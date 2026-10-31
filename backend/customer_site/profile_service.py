"""Customer data services. Never imports ORB, AIMS, prompts or conversation code."""
from datetime import timedelta
import uuid
from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from .models import CustomerProfile, CustomerEmail, CommunicationPreferences, ConsentEvent, GeographicHistory, BetaApplication
from .profile_forms import normalize_email, POLICY_VERSION, TERMS_VERSION

DETAIL_FIELDS = ['middle_name','display_name','phone','street_address','address_line2','city','state','postal_code','country']

def ensure_customer(user):
    profile, _ = CustomerProfile.objects.get_or_create(user=user, defaults={
        'status':'active' if user.is_active else 'unverified', 'email_verified':user.is_active, 'created_at':user.date_joined,
    })
    CommunicationPreferences.objects.get_or_create(user=user)
    if user.email and not CustomerEmail.objects.filter(user=user,kind='current').exists():
        CustomerEmail.objects.create(user=user,address=normalize_email(user.email),kind='current')
    if profile.email_verified and user.email:
        BetaApplication.objects.filter(email__iexact=user.email,user__isnull=True).update(user=user)
    return profile

def profile_payload(user):
    profile = ensure_customer(user)
    preferences = user.communication_preferences
    pending = CustomerEmail.objects.filter(user=user,kind='pending',expires_at__gt=timezone.now()).first()
    complete = all([user.first_name,user.last_name,profile.phone,profile.street_address,profile.city,profile.state,profile.postal_code,profile.country])
    return {
        'first_name':user.first_name, 'middle_name':profile.middle_name, 'last_name':user.last_name,
        'full_name':profile.full_name, 'name':profile.display_name or profile.full_name,
        **{key:getattr(profile,key) for key in DETAIL_FIELDS}, 'email':normalize_email(user.email) if user.email else '',
        'verified':profile.email_verified, 'email_verified_at':profile.email_verified_at,
        'status':profile.status, 'created_at':user.date_joined, 'updated_at':profile.updated_at,
        'last_login':user.last_login, 'profile_complete':bool(complete),
        'pending_email':pending.address if pending else None,
        'preferences':{'marketing_email':preferences.marketing_email,'research_invitations':preferences.research_invitations,'policy_version':POLICY_VERSION,'updated_at':preferences.updated_at},
    }

def record_preferences(user, data, source):
    prefs, _ = CommunicationPreferences.objects.select_for_update().get_or_create(user=user)
    for purpose in ['marketing_email','research_invitations']:
        previous = getattr(prefs,purpose)
        granted = bool(data.get(purpose,False))
        if previous != granted or source == 'registration':
            ConsentEvent.objects.create(user=user,purpose=purpose,previous_value=previous if source!='registration' else None,granted=granted,policy_version=POLICY_VERSION,source=source)
        setattr(prefs,purpose,granted)
    prefs.save()

def update_details(user, data, registration=False):
    profile = ensure_customer(user)
    old_geography = (profile.country,profile.state)
    user.first_name, user.last_name = data['first_name'], data['last_name']
    user.save(update_fields=['first_name','last_name'])
    for key in DETAIL_FIELDS:setattr(profile,key,data.get(key,''))
    if registration:
        profile.registration_country, profile.registration_state = profile.country, profile.state
        profile.terms_accepted_at, profile.terms_version = timezone.now(), TERMS_VERSION
    profile.save()
    if registration or old_geography != (profile.country,profile.state):
        GeographicHistory.objects.create(user=user,country=profile.country,state=profile.state,source='registration' if registration else 'profile-update',effective_from=user.date_joined if registration else timezone.now())
    return profile

def request_email_change(user, email):
    now = timezone.now()
    CustomerEmail.objects.filter(kind='pending',expires_at__lte=now).delete()
    current = CustomerEmail.objects.get(user=user,kind='current')
    if current.address == email:raise ValueError('Choose a different email address.')
    if CustomerEmail.objects.filter(address__iexact=email).exclude(user=user,kind='pending').exists():
        raise ValueError('This email address cannot be used. Choose another address or contact support.')
    CustomerEmail.objects.filter(user=user,kind='pending').delete()
    pending = CustomerEmail.objects.create(user=user,address=email,kind='pending',expires_at=now+timedelta(hours=1))
    token=signing.dumps({'user':user.pk,'email':email,'nonce':str(pending.nonce)},salt='pops-change-email')
    link=f'{settings.FRONTEND_URL}/account/email/verify?token={token}'
    send_mail('Verify your new P.O.P.S. email',f'Confirm your requested email change:\n\n{link}\n\nExpires in one hour. Your current email remains active until you verify. No marketing preference has changed.',settings.DEFAULT_FROM_EMAIL,[email])
    send_mail('P.O.P.S. email change requested','A change to your website account email was requested. Your current address remains active until the new address is verified. If this was not you, reset your password or contact support.',settings.DEFAULT_FROM_EMAIL,[current.address])

def complete_email_change(token):
    data=signing.loads(token,salt='pops-change-email',max_age=3600)
    user=User.objects.select_for_update().get(pk=data['user'])
    profile=CustomerProfile.objects.select_for_update().get(user=user,status='active',email_verified=True)
    pending=CustomerEmail.objects.select_for_update().get(user=user,kind='pending',address=data['email'],nonce=data['nonce'],expires_at__gt=timezone.now())
    previous=CustomerEmail.objects.get(user=user,kind='current').address
    CustomerEmail.objects.filter(user=user,kind='current').delete()
    pending.kind,pending.expires_at='current',None
    pending.nonce=uuid.uuid4()
    pending.save()
    user.email=pending.address
    user.save(update_fields=['email'])
    profile.email_verified_at=timezone.now()
    profile.auth_version+=1
    profile.save(update_fields=['email_verified_at','auth_version','updated_at'])
    send_mail('P.O.P.S. email changed','Your website email was changed after verification. All website sessions have been signed out. If this was not you, contact support.',settings.DEFAULT_FROM_EMAIL,[previous,pending.address])
    return user
