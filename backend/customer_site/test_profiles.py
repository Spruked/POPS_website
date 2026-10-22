import json
import re
from datetime import timedelta
from django.test import TestCase, Client, override_settings, TransactionTestCase
from django.contrib.auth.models import User, Permission
from django.core import mail, signing
from django.db import IntegrityError, transaction
from django.db.migrations.executor import MigrationExecutor
from django.db import connection
from django.utils import timezone
from .models import CustomerProfile, CustomerEmail, CommunicationPreferences, ConsentEvent, GeographicHistory, CustomerAccessAudit, BetaApplication, VerifiedPaymentRecord
from .profile_service import ensure_customer, update_details

PASSWORD='Fictional-test-password!948'
DETAILS={'first_name':'Alex','middle_name':'Taylor','last_name':'Example','display_name':'','phone':'+12025550123','street_address':'100 Fictional Lane','address_line2':'Suite 10','city':'Austin','state':'TX','postal_code':'78701','country':'US'}

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ProfileTests(TestCase):
    def setUp(self):self.client=Client(enforce_csrf_checks=True)
    def post(self,action,payload,client=None):
        client=client or self.client
        token=client.get('/api/customer/session').json()['csrfToken']
        return client.post('/api/customer/'+action,json.dumps(payload),content_type='application/json',HTTP_X_CSRFTOKEN=token)
    def register(self,**extra):return self.post('register',{**DETAILS,'email':'alex@example.com','password1':PASSWORD,'password2':PASSWORD,'consent':True,**extra})
    def activate(self):
        self.assertEqual(self.register().status_code,201)
        token=re.search(r'/account/verify\?token=([^\s]+)',mail.outbox[0].body).group(1)
        self.assertEqual(self.post('verify',{'token':token}).status_code,200)
        self.assertEqual(self.post('login',{'email':'ALEX@EXAMPLE.COM','password':PASSWORD}).status_code,200)
        return User.objects.get(email='alex@example.com')
    def staff(self,permissions):
        user=User.objects.create_user('staff-'+str(User.objects.count()),email='staff'+str(User.objects.count())+'@example.com',password=PASSWORD,is_staff=True)
        ensure_customer(user)
        user.user_permissions.add(*Permission.objects.filter(content_type__app_label='customer_site',codename__in=permissions))
        self.client.force_login(user);return user

    def test_required_fields_and_unchecked_preferences(self):
        self.assertEqual(self.register(last_name='',phone='',street_address='',city='',state='',postal_code='',country='').status_code,400)
        self.assertFalse(User.objects.exists())
        self.assertEqual(self.register().status_code,201)
        user=User.objects.get();profile=user.customer_profile
        self.assertEqual(profile.full_name,'Alex Taylor Example')
        self.assertEqual(profile.phone,'+12025550123')
        self.assertEqual(profile.status,'unverified')
        self.assertFalse(user.communication_preferences.marketing_email)
        self.assertFalse(user.communication_preferences.research_invitations)
        self.assertEqual(ConsentEvent.objects.filter(granted=False).count(),2)

    def test_international_phone_and_us_state_validation(self):
        self.assertEqual(self.register(state='Texas',postal_code='x',phone='123').status_code,400)
        self.assertEqual(self.register(country='GB',state='London',postal_code='SW1A 1AA',phone='+44 20 7946 0958').status_code,201)
        self.assertEqual(CustomerProfile.objects.get().phone,'+442079460958')

    def test_profile_normalization_preserves_password_whitespace(self):
        password='  Exact-passphrase-with-spaces!849  '
        self.assertEqual(self.register(password1=password,password2=password).status_code,201)
        user=User.objects.get(email='alex@example.com')
        self.assertTrue(user.check_password(password))
        self.assertFalse(user.check_password(password.strip()))

    def test_profile_update_preserves_creation_and_original_geography(self):
        user=self.activate();created=user.date_joined
        self.assertEqual(self.post('profile/save',{**DETAILS,'state':'CA','city':'Los Angeles','postal_code':'90001','email':'injected@example.com','status':'closed'}).status_code,200)
        user.refresh_from_db();profile=user.customer_profile
        self.assertEqual(user.email,'alex@example.com');self.assertEqual(user.date_joined,created)
        self.assertEqual(profile.registration_state,'TX');self.assertEqual(profile.state,'CA');self.assertEqual(profile.status,'active')
        self.assertEqual(list(user.geographic_history.values_list('state',flat=True)),['TX','CA'])

    def test_preferences_independent_with_withdrawal_history(self):
        user=self.activate()
        self.assertEqual(self.post('preferences',{'marketing_email':True,'research_invitations':False}).status_code,200)
        self.assertEqual(self.post('preferences',{'marketing_email':False,'research_invitations':True}).status_code,200)
        prefs=CommunicationPreferences.objects.get(user=user)
        self.assertFalse(prefs.marketing_email);self.assertTrue(prefs.research_invitations)
        events=list(ConsentEvent.objects.filter(user=user,purpose='marketing_email').order_by('occurred_at'))
        self.assertEqual([event.granted for event in events],[False,True,False])
        self.assertTrue(all(event.policy_version and event.occurred_at for event in events))

    def test_email_change_requires_password_verification_and_revokes_sessions(self):
        user=self.activate();created=user.date_joined
        other=Client(enforce_csrf_checks=True);other.force_login(user);other.get('/api/customer/session')
        self.assertEqual(self.post('email/change',{'email':'new@example.com','current_password':'wrong'}).status_code,400)
        self.assertEqual(self.post('email/change',{'email':'NEW@example.com','current_password':PASSWORD}).status_code,200)
        user.refresh_from_db();self.assertEqual(user.email,'alex@example.com')
        body=next(message.body for message in mail.outbox if '/account/email/verify?' in message.body)
        token=re.search(r'token=([^\s]+)',body).group(1)
        self.assertEqual(self.post('email/verify',{'token':token}).status_code,200)
        user.refresh_from_db();self.assertEqual(user.email,'new@example.com');self.assertEqual(user.date_joined,created)
        self.assertIsNone(other.get('/api/customer/session').json()['user'])
        self.assertEqual(self.post('email/verify',{'token':token}).status_code,400)
        self.assertEqual(self.post('login',{'email':'alex@example.com','password':PASSWORD}).status_code,400)
        self.assertEqual(self.post('login',{'email':'new@example.com','password':PASSWORD}).status_code,200)

    def test_pending_email_reserved_and_cancelled_link_invalid(self):
        user=self.activate();self.post('email/change',{'email':'reserved@example.com','current_password':PASSWORD})
        body=next(message.body for message in mail.outbox if '/account/email/verify?' in message.body)
        token=re.search(r'token=([^\s]+)',body).group(1)
        self.register(email='reserved@example.com');self.assertEqual(User.objects.filter(is_staff=False).count(),1)
        self.post('email/cancel',{});self.assertEqual(self.post('email/verify',{'token':token}).status_code,400)

    def test_case_insensitive_database_uniqueness(self):
        user=self.activate()
        with self.assertRaises(IntegrityError),transaction.atomic():CustomerEmail.objects.create(user=user,address='ALEX@EXAMPLE.COM',kind='pending')

    def test_personal_endpoints_require_authentication_and_csrf(self):
        self.assertEqual(self.client.get('/api/customer/profile').status_code,401)
        user=self.activate()
        self.assertEqual(self.client.post('/api/customer/preferences','{}',content_type='application/json').status_code,403)
        result=self.post('profile/save',{**DETAILS,'phone':{'unexpected':'object'}})
        self.assertEqual(result.status_code,400)

    def test_aggregate_role_separation_and_no_private_details(self):
        user=self.activate()
        self.assertEqual(self.client.get('/api/customer/admin/geography').status_code,403)
        self.staff(['view_geography'])
        response=self.client.get('/api/customer/admin/geography');self.assertEqual(response.status_code,200)
        self.assertNotIn(user.email,response.content.decode());self.assertNotIn(DETAILS['street_address'],response.content.decode())
        self.assertEqual(self.post('admin/customers',{'purpose':'customer-support'}).status_code,403)
        self.assertIsNone(response.json()['distribution'][0]['paying'])

    def test_distribution_trends_beta_and_verified_payments_distinct(self):
        user=self.activate();self.post('profile/save',{**DETAILS,'state':'CA','postal_code':'90001'})
        BetaApplication.objects.create(user=user,email=user.email,name='Example',platform='windows',experience='new',status='pending')
        self.staff(['view_geography'])
        report=self.client.get('/api/customer/admin/geography').json();row=report['distribution'][0]
        self.assertEqual(row['state'],'CA');self.assertEqual(row['registered'],1);self.assertEqual(row['active'],1)
        self.assertEqual(row['beta_participants'],0);self.assertEqual(row['beta_interest'],1);self.assertEqual(row['percentage_of_registered'],100)
        self.assertEqual(report['registration_trends'][0]['registration_state'],'TX')
        BetaApplication.objects.update(status='active')
        VerifiedPaymentRecord.objects.create(user=user,provider='square',provider_payment_id='fictional-test',amount_minor=9900,currency='USD',status='completed',verified_at=timezone.now())
        report=self.client.get('/api/customer/admin/geography?country=US&state=CA').json()
        self.assertEqual(report['distribution'][0]['paying'],1);self.assertEqual(report['distribution'][0]['beta_participants'],1)
        VerifiedPaymentRecord.objects.update(status='refunded')
        self.assertEqual(self.client.get('/api/customer/admin/geography').json()['distribution'][0]['paying'],0)

    def test_support_access_audited_and_status_revokes_session(self):
        user=self.activate();browser=self.client
        staff_browser=Client(enforce_csrf_checks=True);self.client=staff_browser
        self.staff(['view_customerprofile','manage_customer_status'])
        self.assertEqual(self.post('admin/customers',{'customer_id':user.pk}).status_code,400)
        self.assertEqual(self.post('admin/customers',{'customer_id':user.pk,'purpose':'customer-support'}).status_code,200)
        self.assertTrue(CustomerAccessAudit.objects.filter(customer=user,action='staff-profile-view').exists())
        self.assertEqual(self.post('admin/status',{'customer_id':user.pk,'purpose':'security-review','status':'suspended'}).status_code,200)
        self.assertIsNone(browser.get('/api/customer/session').json()['user'])

    def test_suspension_cannot_be_reactivated_by_verification(self):
        user=self.activate();profile=user.customer_profile;profile.status='suspended';profile.save();user.is_active=False;user.save(update_fields=['is_active'])
        token=signing.dumps({'user':user.pk,'email':user.email},salt='pops-verify-email')
        self.assertEqual(self.post('verify',{'token':token}).status_code,400)
        user.refresh_from_db();self.assertFalse(user.is_active)

class LegacyMigrationTests(TransactionTestCase):
    def test_legacy_timestamp_password_and_unknown_profile_preserved(self):
        executor=MigrationExecutor(connection);executor.migrate([('customer_site','0001_initial')])
        try:
            old=executor.loader.project_state([('customer_site','0001_initial'),*executor.loader.graph.leaf_nodes('auth')]).apps
            OldUser=old.get_model('auth','User')
            created=timezone.now()-timedelta(days=90)
            user=OldUser.objects.create(username='legacy@example.com',email='LEGACY@EXAMPLE.COM',first_name='Existing Display Name',date_joined=created,password='existing-password-hash',is_active=True)
            pk=user.pk
            executor=MigrationExecutor(connection);executor.migrate([('customer_site','0003_preserve_existing_customers')])
            current=User.objects.get(pk=pk);profile=CustomerProfile.objects.get(user=current)
            self.assertEqual(current.date_joined,created);self.assertEqual(current.password,'existing-password-hash');self.assertEqual(current.first_name,'Existing Display Name');self.assertEqual(current.last_name,'')
            self.assertEqual(profile.state,'');self.assertEqual(profile.country,'');self.assertEqual(profile.registration_state,'')
            self.assertTrue(profile.email_verified);self.assertIsNone(profile.email_verified_at)
            self.assertFalse(current.communication_preferences.marketing_email);self.assertFalse(ConsentEvent.objects.filter(user=current).exists())
        finally:MigrationExecutor(connection).migrate([('customer_site','0003_preserve_existing_customers')])
