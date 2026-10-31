"""Restricted, aggregate-only geography; no addresses or contact fields."""
from django import forms
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, Q, Exists, OuterRef
from django.db.models.functions import TruncMonth
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from .models import CustomerProfile, VerifiedPaymentRecord, BetaApplication, CustomerAccessAudit
from .profile_service import ensure_customer, profile_payload
from .profile_forms import US_STATES, COUNTRIES
from .views import endpoint, invalid

def staff_denial(request, permission):
    if not request.user.is_authenticated:return JsonResponse({'error':'Sign in to use customer administration.'},status=401)
    if not request.user.is_staff or not request.user.has_perm('customer_site.'+permission):
        return JsonResponse({'error':'Your role does not permit this customer administration action.'},status=403)
    return None

class GeographicFilter(forms.Form):
    country=forms.ChoiceField(choices=[('','All countries')]+COUNTRIES,required=False)
    state=forms.CharField(max_length=100,required=False)
    start=forms.DateField(required=False)
    end=forms.DateField(required=False)
    def clean(self):
        data=super().clean()
        if data.get('country')=='US' and data.get('state'):
            data['state']=data['state'].upper()
            if data['state'] not in US_STATES:self.add_error('state','Choose a valid US state or territory.')
        if data.get('start') and data.get('end') and data['start']>data['end']:self.add_error('end','End date must follow the start date.')
        return data

@require_GET
@endpoint
def geography(request):
    denied=staff_denial(request,'view_geography')
    if denied is not None:return denied
    form=GeographicFilter(request.GET)
    if not form.is_valid():return invalid(form)
    filters=form.cleaned_data
    base=CustomerProfile.objects.filter(user__is_staff=False)
    denominator=base.count()
    filtered=base
    for field in ['country','state']:
        if filters.get(field):filtered=filtered.filter(**{field:filters[field]})
    verified=VerifiedPaymentRecord.objects.filter(user_id=OuterRef('user_id'),verified_at__isnull=False,status='completed',amount_minor__gt=0)
    participants=BetaApplication.objects.filter(user_id=OuterRef('user_id'),status='active')
    interests=BetaApplication.objects.filter(user_id=OuterRef('user_id'))
    filtered=filtered.annotate(has_payment=Exists(verified),beta_active=Exists(participants),beta_interest=Exists(interests))
    rows=list(filtered.values('country','state').annotate(
        registered=Count('pk'),active=Count('pk',filter=Q(status='active',email_verified=True,user__is_active=True)),
        paying=Count('pk',filter=Q(has_payment=True)),beta_participants=Count('pk',filter=Q(beta_active=True)),beta_interest=Count('pk',filter=Q(beta_interest=True)),
    ).order_by('country','state'))
    payment_available=VerifiedPaymentRecord.objects.filter(verified_at__isnull=False).exists()
    for row in rows:
        row['percentage_of_registered']=round(100*row['registered']/denominator,2) if denominator else 0
        if not payment_available:row['paying']=None
    trends=base
    for field in ['country','state']:
        if filters.get(field):trends=trends.filter(**{'registration_'+field:filters[field]})
    if filters.get('start'):trends=trends.filter(user__date_joined__date__gte=filters['start'])
    if filters.get('end'):trends=trends.filter(user__date_joined__date__lte=filters['end'])
    trends=list(trends.annotate(month=TruncMonth('user__date_joined')).values('month','registration_country','registration_state').annotate(registered=Count('pk')).order_by('month','registration_country','registration_state'))
    return JsonResponse({'total_registered':denominator,'filtered_registered':filtered.count(),'payment_data_available':payment_available,'distribution':rows,'registration_trends':trends,'definitions':{
        'distribution':'Current recorded country/state. Unknown locations stay unknown. Staff/service accounts excluded.',
        'active':'Verified, enabled accounts with active account status; not a purchase metric.',
        'paying':'Distinct accounts with a positive, completed payment and a verified payment record. Cart entries never count.',
        'beta_participants':'Distinct accounts linked to a beta record whose status is active. Pending interest is separate.',
        'trends':'Original account creation month and recorded registration geography. Later moves do not rewrite registration history.',
        'percentage':'Share of all registered non-staff accounts, including unknown locations and every account status.',
    }})

PURPOSES=[('customer-support','Customer support'),('customer-request','Customer requested correction'),('security-review','Account security review')]
class StaffAccessForm(forms.Form):
    purpose=forms.ChoiceField(choices=PURPOSES)
    customer_id=forms.IntegerField(min_value=1,required=False)
    country=forms.ChoiceField(choices=[('','All countries')]+COUNTRIES,required=False)
    state=forms.CharField(max_length=100,required=False)
    status=forms.ChoiceField(choices=[('','All statuses')]+list(CustomerProfile.Status.choices),required=False)
    page=forms.IntegerField(min_value=1,max_value=100000,required=False)

@require_POST
@endpoint
def customers(request):
    denied=staff_denial(request,'view_customerprofile')
    if denied is not None:return denied
    form=StaffAccessForm(request.payload)
    if not form.is_valid():return invalid(form)
    data=form.cleaned_data
    profiles=CustomerProfile.objects.filter(user__is_staff=False).select_related('user').order_by('user_id')
    for field in ['country','state','status']:
        if data.get(field):profiles=profiles.filter(**{field:data[field]})
    if data.get('customer_id'):
        item=profiles.filter(user_id=data['customer_id']).first()
        if not item:return JsonResponse({'error':'Customer not found.'},status=404)
        CustomerAccessAudit.objects.create(actor=request.user,customer=item.user,action='staff-profile-view',purpose=data['purpose'])
        return JsonResponse({'profile':profile_payload(item.user),'customer_id':item.user_id})
    offset=((data.get('page') or 1)-1)*50
    CustomerAccessAudit.objects.create(actor=request.user,action='staff-customer-list',purpose=data['purpose'])
    return JsonResponse({'total':profiles.count(),'page':data.get('page') or 1,'customers':[{'id':p.user_id,'name':p.full_name,'email':p.user.email,'country':p.country,'state':p.state,'status':p.status} for p in profiles[offset:offset+50]]})

@require_POST
@endpoint
def account_status(request):
    denied=staff_denial(request,'manage_customer_status')
    if denied is not None:return denied
    form=StaffAccessForm(request.payload)
    if not form.is_valid():return invalid(form)
    data=form.cleaned_data
    if not data.get('customer_id') or not data.get('status') or data['customer_id']==request.user.pk:
        return JsonResponse({'error':'Choose another customer and a valid account status.'},status=400)
    with transaction.atomic():
        user=User.objects.select_for_update().filter(pk=data['customer_id'],is_staff=False,is_superuser=False).first()
        if not user:return JsonResponse({'error':'Customer not found.'},status=404)
        profile=ensure_customer(user)
        if data['status']=='active' and not profile.email_verified:return JsonResponse({'error':'An unverified email cannot be activated by a status change.'},status=400)
        if data['status']=='unverified' and profile.email_verified:return JsonResponse({'error':'Email verification cannot be removed through account-status management.'},status=400)
        profile.status=data['status'];profile.auth_version+=1;profile.save(update_fields=['status','auth_version','updated_at'])
        user.is_active=profile.status=='active';user.save(update_fields=['is_active'])
        CustomerAccessAudit.objects.create(actor=request.user,customer=user,action='account-status-change',purpose=data['purpose'],changed_fields=['status'])
    return JsonResponse({'message':'Account status updated; existing customer sessions have been revoked.'})
