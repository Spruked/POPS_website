from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.core import signing
from django.db import transaction, IntegrityError
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from .views import endpoint, invalid, delivery_note
from .profile_forms import CustomerDetailsForm, PreferencesForm, EmailChangeForm, COUNTRIES, US_STATES, POLICY_VERSION
from .profile_service import profile_payload, update_details, record_preferences, request_email_change, complete_email_change
from .models import CustomerEmail, CustomerProfile, ConsentEvent, CustomerAccessAudit

def require_customer(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error':'Sign in to manage your customer information.'},status=401)
    return None

@require_GET
@endpoint
def options(request):
    return JsonResponse({'countries':COUNTRIES,'us_states':list(US_STATES.items()),'policy_version':POLICY_VERSION})

@require_GET
@endpoint
def profile(request):
    denied=require_customer(request)
    return denied if denied is not None else JsonResponse({'profile':profile_payload(request.user)})

@require_POST
@endpoint
def save_profile(request):
    denied=require_customer(request)
    if denied is not None:return denied
    form=CustomerDetailsForm(request.payload)
    if not form.is_valid():return invalid(form)
    with transaction.atomic():
        user=User.objects.select_for_update().get(pk=request.user.pk)
        update_details(user,form.cleaned_data)
        CustomerAccessAudit.objects.create(actor=user,customer=user,action='profile-update',purpose='customer-self-service',changed_fields=list(form.cleaned_data))
    return JsonResponse({'message':'Your profile has been updated.'})

@require_POST
@endpoint
def preferences(request):
    denied=require_customer(request)
    if denied is not None:return denied
    form=PreferencesForm(request.payload)
    if not form.is_valid():return invalid(form)
    with transaction.atomic():record_preferences(request.user,form.cleaned_data,'customer-preferences')
    return JsonResponse({'message':'Communication preferences saved. Operational account and security emails remain separate.'})

@require_GET
@endpoint
def consent_history(request):
    denied=require_customer(request)
    if denied is not None:return denied
    events=ConsentEvent.objects.filter(user=request.user).order_by('-occurred_at').values('purpose','previous_value','granted','policy_version','source','occurred_at')[:100]
    return JsonResponse({'events':list(events)})

@require_POST
@endpoint
def email_change(request):
    denied=require_customer(request)
    if denied is not None:return denied
    form=EmailChangeForm(request.payload)
    if not form.is_valid():return invalid(form)
    if not request.user.check_password(form.cleaned_data['current_password']):
        return JsonResponse({'error':'Confirm your current password to change your email.','fields':{'current_password':['The password could not be confirmed.']}},status=400)
    try:
        with transaction.atomic():
            User.objects.select_for_update().get(pk=request.user.pk)
            request_email_change(request.user,form.cleaned_data['email'])
    except (IntegrityError,ValueError) as error:
        return JsonResponse({'error':str(error) if isinstance(error,ValueError) else 'This address cannot be used. Try another address.'},status=400)
    return JsonResponse({'message':'A verification link for your new email has been prepared. Your current email remains active until verification. '+delivery_note()})

@require_POST
@endpoint
def cancel_email_change(request):
    denied=require_customer(request)
    if denied is not None:return denied
    CustomerEmail.objects.filter(user=request.user,kind='pending').delete()
    return JsonResponse({'message':'Pending email change cancelled. Your current email remains active.'})

@require_POST
@endpoint
def verify_email_change(request):
    try:
        with transaction.atomic():complete_email_change(str(request.payload.get('token','')))
    except (signing.BadSignature,User.DoesNotExist,CustomerProfile.DoesNotExist,CustomerEmail.DoesNotExist,KeyError,ValueError,IntegrityError):
        return JsonResponse({'error':'This email-change link is invalid, expired, cancelled or already used.'},status=400)
    logout(request)
    return JsonResponse({'message':'Your new email is verified. All website sessions have been signed out. Sign in with your new email.'})
