import hashlib
import json
import logging
import time
from functools import wraps
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import F
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET, require_POST
from .forms import RegistrationForm, BetaForm, SupportForm
from .models import BetaApplication, SupportRequest, RequestLimit

logger = logging.getLogger(__name__)


def csrf_failure(request, reason=''):
    return JsonResponse({'error': 'Your form session expired. Reload this page and try again.'}, status=403)


def endpoint(view):
    @never_cache
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if request.method == 'POST':
            key = hashlib.sha256(f'{request.META.get("REMOTE_ADDR", "")}/{view.__name__}'.encode()).hexdigest()
            window = int(time.time()) // 900
            with transaction.atomic():
                limit, _ = RequestLimit.objects.get_or_create(key=key, defaults={'window': window})
                if limit.window != window:
                    RequestLimit.objects.filter(pk=limit.pk).update(window=window, count=0)
                RequestLimit.objects.filter(pk=limit.pk).update(count=F('count') + 1)
                limit.refresh_from_db()
                if limit.count > 20:
                    response = JsonResponse({'error': 'Too many requests. Please try again in 15 minutes.'}, status=429)
                    response['Retry-After'] = '900'
                    return response
            try:
                request.payload = json.loads(request.body or '{}')
                if not isinstance(request.payload, dict):
                    raise ValueError()
            except (ValueError, UnicodeDecodeError):
                return JsonResponse({'error': 'Invalid request.'}, status=400)
        try:
            response = view(request, *args, **kwargs)
        except Exception:
            logger.exception('Customer endpoint failed: %s', view.__name__)
            return JsonResponse({'error': 'The service could not complete this request. Please try again.'}, status=503)
        response['X-Robots-Tag'] = 'noindex, nofollow'
        return response
    return wrapped


def invalid(form):
    return JsonResponse({'error': 'Please correct the highlighted fields.', 'fields': {key: list(errors) for key, errors in form.errors.items()}}, status=400)


def mail_link(user, kind):
    if kind == 'verify':
        token = signing.dumps({'user': user.pk, 'email': user.email}, salt='pops-verify-email')
        link = f'{settings.FRONTEND_URL}/account/verify?token={token}'
        subject = 'Verify your P.O.P.S. website email'
    else:
        token = default_token_generator.make_token(user)
        link = f'{settings.FRONTEND_URL}/account/reset?uid={user.pk}&token={token}'
        subject = 'Reset your P.O.P.S. website password'
    send_mail(subject, f'{subject}\n\n{link}\n\nThis link expires in one hour. If you did not request it, ignore this message. Your website account does not contain application evidence.', settings.DEFAULT_FROM_EMAIL, [user.email])


def delivery_note():
    return 'Local preview: email is saved in the local development outbox; it is not delivered to your inbox.' if settings.DEVELOPMENT else 'Check your email, including your spam folder.'


@require_GET
@endpoint
def session(request):
    user = request.user
    beta = BetaApplication.objects.filter(email=user.email).values('status', 'platform').first() if user.is_authenticated else None
    return JsonResponse({'csrfToken': get_token(request), 'user': {'name': user.first_name, 'email': user.email, 'verified': user.is_active, 'beta': beta} if user.is_authenticated else None, 'development': settings.DEVELOPMENT, 'emailDelivery': 'local-outbox' if settings.DEVELOPMENT else 'smtp'})


@require_POST
@endpoint
def register(request):
    form = RegistrationForm(request.payload)
    if not form.is_valid():
        return invalid(form)
    data = form.cleaned_data
    if not User.objects.filter(username=data['email']).exists():
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=data['email'], email=data['email'], first_name=data['name'], password=data['password1'], is_active=False)
                mail_link(user, 'verify')
        except IntegrityError:
            pass
    return JsonResponse({'message': 'If this address is eligible, a verification link has been prepared. Verify your email before signing in. ' + delivery_note()}, status=201)


@require_POST
@endpoint
def sign_in(request):
    email = str(request.payload.get('email', '')).strip().casefold()
    password = request.payload.get('password', '')
    if not isinstance(password, str):
        return JsonResponse({'error': 'Enter your email and password.'}, status=400)
    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({'error': 'Unable to sign in. Check your credentials and verify your email first.'}, status=400)
    login(request, user)
    return JsonResponse({'message': 'Signed in.', 'csrfToken': get_token(request)})


@require_POST
@endpoint
def sign_out(request):
    logout(request)
    return JsonResponse({'message': 'Signed out.', 'csrfToken': get_token(request)})


@require_POST
@endpoint
def verify(request):
    try:
        data = signing.loads(str(request.payload.get('token', '')), salt='pops-verify-email', max_age=3600)
        user = User.objects.get(pk=data['user'], email=data['email'], is_active=False)
    except (signing.BadSignature, User.DoesNotExist, KeyError, ValueError):
        return JsonResponse({'error': 'This verification link is invalid, expired, or already used. Request a new link if needed.'}, status=400)
    user.is_active = True
    user.save(update_fields=['is_active'])
    return JsonResponse({'message': 'Email verified. You can now sign in.'})


@require_POST
@endpoint
def request_link(request, kind):
    email = str(request.payload.get('email', '')).strip().casefold()
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'error': 'Enter a valid email address.'}, status=400)
    user = User.objects.filter(username=email, is_active=(kind == 'reset')).first()
    if user:
        mail_link(user, kind)
    return JsonResponse({'message': 'If an eligible account exists, a link has been prepared. ' + delivery_note()})


@require_POST
@endpoint
def reset(request):
    try:
        user = User.objects.get(pk=request.payload.get('uid'), is_active=True)
    except (User.DoesNotExist, ValueError, TypeError):
        user = None
    if user is None or not default_token_generator.check_token(user, str(request.payload.get('token', ''))):
        return JsonResponse({'error': 'This reset link is invalid or expired. Request a new link.'}, status=400)
    form = SetPasswordForm(user, request.payload)
    if not form.is_valid():
        return invalid(form)
    form.save()
    return JsonResponse({'message': 'Password changed. Sign in with your new password.'})


@require_POST
@endpoint
def beta(request):
    form = BetaForm(request.payload)
    if not form.is_valid():
        return invalid(form)
    if form.cleaned_data['website']:
        return JsonResponse({'error': 'Unable to accept this request.'}, status=400)
    data = form.cleaned_data
    _, created = BetaApplication.objects.get_or_create(email=data['email'].strip().casefold(), defaults={key: data[key] for key in ['name', 'platform', 'experience', 'updates']})
    return JsonResponse({'message': 'Your interest has been recorded for review. This is not a beta invitation or a license. ' + ('This development entry is stored locally and will not reach the production team.' if settings.DEVELOPMENT else 'Invitations depend on testing needs and available places.')}, status=201 if created else 200)


@require_POST
@endpoint
def support(request):
    form = SupportForm(request.payload)
    if not form.is_valid():
        return invalid(form)
    data = form.cleaned_data
    if data['website']:
        return JsonResponse({'error': 'Unable to accept this request.'}, status=400)
    item = SupportRequest.objects.create(email=data['email'].strip().casefold(), category=data['category'], message=data['message'])
    return JsonResponse({'message': f'Request #{item.pk} has been saved. ' + ('Local preview only: this request has not been sent to the production support team.' if settings.DEVELOPMENT else 'Keep this reference for follow-up. No response time is promised.')}, status=201)


@endpoint
def checkout_unavailable(request):
    return JsonResponse({'error': 'Checkout is unavailable. No order or payment has been created.'}, status=503)
