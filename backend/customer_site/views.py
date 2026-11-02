import hashlib
import hmac
import json
import logging
import time
import uuid
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
from django.utils import timezone
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from .forms import RegistrationForm, BetaForm, SupportForm
from .models import (BetaApplication, SupportRequest, RequestLimit, CustomerProfile, CustomerEmail,
                     GuardianOrder, GuardianOrderEvent, SquareWebhookEvent)
from .profile_service import ensure_customer, profile_payload, update_details, record_preferences
from .profile_forms import normalize_email
from . import guardian_payments

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
                if any(isinstance(value,(list,dict)) for value in request.payload.values()):
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
    beta = BetaApplication.objects.filter(user=user).values('status', 'platform').first() if user.is_authenticated else None
    if user.is_authenticated and not beta:
        beta = BetaApplication.objects.filter(email__iexact=user.email).values('status','platform').first()
    details = {**profile_payload(user), 'beta':beta, 'permissions':{
        'geography':user.is_staff and user.has_perm('customer_site.view_geography'),
        'customer_profiles':user.is_staff and user.has_perm('customer_site.view_customerprofile'),
        'account_status':user.is_staff and user.has_perm('customer_site.manage_customer_status'),
    }} if user.is_authenticated else None
    return JsonResponse({'csrfToken': get_token(request), 'user':details, 'development': settings.DEVELOPMENT, 'emailDelivery': 'local-outbox' if settings.DEVELOPMENT else 'smtp'})


@require_POST
@endpoint
def register(request):
    form = RegistrationForm(request.payload)
    if not form.is_valid():
        return invalid(form)
    data = form.cleaned_data
    CustomerEmail.objects.filter(kind='pending',expires_at__lte=timezone.now()).delete()
    if not CustomerEmail.objects.filter(address__iexact=data['email']).exists() and not User.objects.filter(email__iexact=data['email']).exists():
        try:
            with transaction.atomic():
                import uuid
                user = User.objects.create_user(username='customer-'+uuid.uuid4().hex, email=data['email'], first_name=data['first_name'], last_name=data['last_name'], password=data['password1'], is_active=False)
                update_details(user,data,registration=True)
                record_preferences(user,data,'registration')
                mail_link(user, 'verify')
        except IntegrityError:
            pass
    return JsonResponse({'message': 'If this address is eligible, a verification link has been prepared. Verify your email before signing in. ' + delivery_note()}, status=201)


@require_POST
@endpoint
def sign_in(request):
    try: email = normalize_email(str(request.payload.get('email', '')))
    except (ValueError,UnicodeError): email = ''
    password = request.payload.get('password', '')
    if not isinstance(password, str):
        return JsonResponse({'error': 'Enter your email and password.'}, status=400)
    identity = CustomerEmail.objects.filter(address=email,kind='current').select_related('user').first()
    candidate = identity.user if identity else User.objects.filter(email__iexact=email).first()
    user = authenticate(request, username=candidate.username if candidate else email, password=password)
    if user and (ensure_customer(user).status!='active' or not ensure_customer(user).email_verified):user=None
    if user is None:
        return JsonResponse({'error': 'Unable to sign in. Check your credentials and verify your email first.'}, status=400)
    login(request, user)
    request.session['customer_auth_version']=user.customer_profile.auth_version
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
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=data['user'], email=data['email'], is_active=False)
            profile=ensure_customer(user)
            if profile.status!='unverified' or profile.email_verified:raise ValueError()
            profile.status='active'
            profile.email_verified=True
            profile.email_verified_at=timezone.now()
            profile.save(update_fields=['status','email_verified','email_verified_at','updated_at'])
            user.is_active=True
            user.save(update_fields=['is_active'])
    except (signing.BadSignature, User.DoesNotExist, KeyError, ValueError):
        return JsonResponse({'error': 'This verification link is invalid, expired, or already used. Request a new link if needed.'}, status=400)
    return JsonResponse({'message': 'Email verified. You can now sign in.'})


@require_POST
@endpoint
def request_link(request, kind):
    try: email=normalize_email(str(request.payload.get('email','')))
    except (ValueError,UnicodeError):email=''
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'error': 'Enter a valid email address.'}, status=400)
    user = User.objects.filter(email__iexact=email, is_active=(kind == 'reset')).first()
    if user:
        profile=ensure_customer(user)
        if profile.status not in (['active'] if kind=='reset' else ['unverified']):user=None
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
    owner=request.user if request.user.is_authenticated and request.user.email.casefold()==data['email'].strip().casefold() else None
    _, created = BetaApplication.objects.get_or_create(email=data['email'].strip().casefold(), defaults={**{key: data[key] for key in ['name', 'platform', 'experience', 'updates', 'phone', 'street_address', 'city', 'state', 'source']},'user':owner})
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


def _guardian_order_payload(order, *, include_checkout=False):
    result = {
        'order_id': str(order.pk),
        'product': 'guardian_windows',
        'amount_minor': 9900,
        'currency': 'USD',
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'updated_at': order.updated_at.isoformat(),
    }
    if include_checkout and order.status == GuardianOrder.Status.PENDING and order.square_checkout_url:
        result['checkout_url'] = order.square_checkout_url
    return result


def _checkout_unavailable_response():
    return JsonResponse({'error': 'Guardian sandbox checkout is disabled. No payment has been taken.'}, status=503)


@require_POST
@endpoint
def guardian_checkout(request):
    if not guardian_payments.checkout_is_enabled():
        return _checkout_unavailable_response()
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Sign in to start a Guardian checkout.'}, status=401)
    if set(request.payload) != {'request_key'}:
        return JsonResponse({'error': 'Only a checkout request key is accepted; prices and product details are server controlled.'}, status=400)
    try:
        request_key = str(uuid.UUID(str(request.payload['request_key'])))
    except (ValueError, TypeError, AttributeError):
        return JsonResponse({'error': 'A valid checkout request key is required.'}, status=400)
    order, _ = guardian_payments.create_or_get_order(request.user, request_key)
    if order.status != GuardianOrder.Status.PENDING:
        return JsonResponse({'order': _guardian_order_payload(order)}, status=200)
    had_checkout_url = bool(order.square_checkout_url)
    try:
        order = guardian_payments.ensure_payment_link(order)
    except guardian_payments.SquareUnavailable:
        logger.warning('Square sandbox checkout unavailable for Guardian order %s', order.pk)
        return JsonResponse({'error': 'Secure checkout is temporarily unavailable. Retry this same request.'}, status=502)
    return JsonResponse({'order': _guardian_order_payload(order, include_checkout=True)}, status=200 if had_checkout_url else 201)


@require_GET
@endpoint
def guardian_order_status(request, order_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Sign in to view this order.'}, status=401)
    order = GuardianOrder.objects.filter(pk=order_id, user=request.user).first()
    if not order:
        return JsonResponse({'error': 'Order not found.'}, status=404)
    return JsonResponse({'order': _guardian_order_payload(order, include_checkout=True)})


@csrf_exempt
@require_POST
@never_cache
def square_guardian_webhook(request):
    """Accept only signed notices, then fetch payment/refund state directly from Square."""
    if not guardian_payments.checkout_is_enabled():
        return _checkout_unavailable_response()
    raw_body = request.body
    signature = request.headers.get('x-square-hmacsha256-signature', '')
    if not guardian_payments.verify_webhook_signature(raw_body, signature):
        return JsonResponse({'error': 'Invalid Square webhook signature.'}, status=403)
    try:
        payload = json.loads(raw_body)
        event_id = str(payload['event_id'])
        event_type = str(payload['type'])
        if not event_id or len(event_id) > 200 or len(event_type) > 100:
            raise ValueError()
    except (ValueError, TypeError, KeyError, UnicodeDecodeError):
        return JsonResponse({'error': 'Invalid Square webhook event.'}, status=400)

    payload_hash = hashlib.sha256(raw_body).hexdigest()
    try:
        event, created = SquareWebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={'event_type': event_type, 'payload_sha256': payload_hash},
        )
    except Exception:
        logger.exception('Could not persist Square webhook receipt')
        return JsonResponse({'error': 'Webhook could not be recorded.'}, status=503)
    if not created and (event.event_type != event_type or not hmac.compare_digest(event.payload_sha256, payload_hash)):
        return JsonResponse({'error': 'Square event identifier was reused with different content.'}, status=400)
    if not created and event.status in {'processed', 'ignored', 'rejected'}:
        return JsonResponse({'received': True, 'processed': event.status == 'processed'})

    if event_type not in {'payment.created', 'payment.updated', 'refund.created', 'refund.updated'}:
        event.status = 'ignored'
        event.processed_at = timezone.now()
        event.save(update_fields=['status', 'processed_at'])
        return JsonResponse({'received': True, 'processed': False})
    try:
        data = payload.get('data') or {}
        object_data = ((data.get('object') or {}).get('payment') or {}) if event_type.startswith('payment.') else ((data.get('object') or {}).get('refund') or {})
        payment_id = object_data.get('id') if event_type.startswith('payment.') else object_data.get('payment_id')
        if not isinstance(payment_id, str) or not payment_id or len(payment_id) > 200:
            raise guardian_payments.PaymentMismatch('Square event did not identify a payment.')
        order = guardian_payments.confirm_payment(payment_id, provider_event_id=event_id)
    except guardian_payments.SquareUnavailable:
        event.status = 'retryable_error'
        event.error_code = 'provider_unavailable'
        event.save(update_fields=['status', 'error_code'])
        return JsonResponse({'error': 'Square status verification is temporarily unavailable.'}, status=503)
    except guardian_payments.PaymentMismatch:
        event.status = 'rejected'
        event.error_code = 'payment_mismatch'
        event.processed_at = timezone.now()
        event.save(update_fields=['status', 'error_code', 'processed_at'])
        return JsonResponse({'received': True, 'processed': False})
    except Exception:
        event.status = 'retryable_error'
        event.error_code = 'processing_error'
        event.save(update_fields=['status', 'error_code'])
        logger.exception('Square webhook processing failed for event %s', event_id)
        return JsonResponse({'error': 'Square event processing will be retried.'}, status=503)

    event.status = 'processed'
    event.error_code = ''
    event.processed_at = timezone.now()
    event.save(update_fields=['status', 'error_code', 'processed_at'])
    return JsonResponse({'received': True, 'processed': True, 'order_id': str(order.pk), 'status': order.status})
