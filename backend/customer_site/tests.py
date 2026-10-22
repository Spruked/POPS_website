import json
import re
from django.test import TestCase, Client, override_settings
from django.core import mail
from django.contrib.auth.models import User
from .models import BetaApplication, SupportRequest, RequestLimit


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class CustomerTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get('/api/customer/session').json()['csrfToken']

    def post(self, action, data, client=None):
        browser = client or self.client
        token = browser.get('/api/customer/session').json()['csrfToken']
        return browser.post('/api/customer/' + action, json.dumps(data), content_type='application/json', HTTP_X_CSRFTOKEN=token)

    def register(self):
        return self.post('register', {'name': 'Test Parent', 'email': 'Parent@Example.com', 'password1': 'Proof-presence-test!483', 'password2': 'Proof-presence-test!483', 'consent': True})

    def test_csrf_is_required(self):
        response = self.client.post('/api/customer/register', '{}', content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(User.objects.count(), 0)

    def test_account_verification_login_logout_and_session_security(self):
        self.assertEqual(self.register().status_code, 201)
        user = User.objects.get()
        self.assertFalse(user.is_active)
        self.assertTrue(user.password.startswith('argon2$'))
        self.assertNotEqual(user.password, 'Proof-presence-test!483')
        self.assertEqual(self.post('login', {'email': user.email, 'password': 'Proof-presence-test!483'}).status_code, 400)
        token = re.search(r'/account/verify\?token=([^\s]+)', mail.outbox[0].body).group(1)
        self.assertEqual(self.post('verify', {'token': token}).status_code, 200)
        self.assertEqual(self.post('verify', {'token': token}).status_code, 400)
        self.assertEqual(self.post('login', {'email': 'PARENT@example.com', 'password': 'Proof-presence-test!483'}).status_code, 200)
        self.assertEqual(self.client.get('/api/customer/session').json()['user']['email'], 'parent@example.com')
        self.assertTrue(self.client.cookies['pops_customer_session']['httponly'])
        self.assertEqual(self.client.cookies['pops_customer_session']['samesite'], 'Lax')
        self.assertEqual(self.post('logout', {}).status_code, 200)
        self.assertIsNone(self.client.get('/api/customer/session').json()['user'])

    def test_password_validation_and_mismatch(self):
        response = self.post('register', {'name':'Test','email':'person@example.com','password1':'short','password2':'different','consent':True})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_registration_does_not_replace_account(self):
        self.register()
        user = User.objects.get()
        original = user.password
        self.register()
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().password, original)

    def test_reset_token_single_use_and_existing_session_invalidated(self):
        user = User.objects.create_user(username='test@example.com', email='test@example.com', password='Old-test-password!483')
        self.post('login', {'email': user.email, 'password':'Old-test-password!483'})
        response = self.post('recovery', {'email':user.email})
        self.assertEqual(response.status_code,200)
        self.assertIn('/account/reset?', mail.outbox[0].body)
        token = re.search(r'/account/reset\?uid=\d+&token=([^\s]+)', mail.outbox[0].body).group(1)
        payload = {'uid':user.pk, 'token':token, 'new_password1':'New-test-password!746', 'new_password2':'New-test-password!746'}
        browser = Client(enforce_csrf_checks=True)
        self.assertEqual(self.post('reset', payload, browser).status_code,200)
        self.assertIsNone(self.client.get('/api/customer/session').json()['user'])
        self.assertEqual(self.post('reset', payload, browser).status_code,400)
        self.assertEqual(self.post('login', {'email':user.email,'password':'Old-test-password!483'}).status_code,400)
        self.assertEqual(self.post('login', {'email':user.email,'password':'New-test-password!746'}).status_code,200)

    def test_recovery_does_not_disclose_account_existence(self):
        User.objects.create_user(username='known@example.com',email='known@example.com',password='Test-password!848')
        first = self.post('recovery', {'email':'known@example.com'})
        second = self.post('recovery', {'email':'unknown@example.com'})
        self.assertEqual(first.json(),second.json())

    def test_beta_is_persistent_idempotent_and_requires_consent(self):
        payload={'name':'Test','email':'Beta@example.com','platform':'both','experience':'new','consent':True,'updates':False}
        self.assertEqual(self.post('beta',payload).status_code,201)
        self.assertEqual(self.post('beta',payload).status_code,200)
        self.assertEqual(BetaApplication.objects.count(),1)
        self.assertEqual(BetaApplication.objects.get().email,'beta@example.com')
        self.assertEqual(self.post('beta',{**payload,'email':'other@example.com','consent':False}).status_code,400)

    def test_support_is_saved_with_reference(self):
        response=self.post('support',{'email':'test@example.com','category':'beta-feedback','message':'Fictional data test: the timeline did not show the new example event.','consent':True})
        self.assertEqual(response.status_code,201)
        self.assertEqual(SupportRequest.objects.count(),1)
        self.assertIn('Request #',response.json()['message'])

    def test_honeypot_rejects_submission(self):
        response=self.post('beta',{'name':'Bot','email':'bot@example.com','platform':'windows','experience':'new','consent':True,'website':'spam'})
        self.assertEqual(response.status_code,400)
        self.assertEqual(BetaApplication.objects.count(),0)

    def test_rate_limit_is_enforced(self):
        self.post('recovery',{'email':'test@example.com'})
        RequestLimit.objects.update(count=20)
        response=self.post('recovery',{'email':'test@example.com'})
        self.assertEqual(response.status_code,429)
        self.assertEqual(response['Retry-After'],'900')

    def test_checkout_is_disabled(self):
        for path in ['/api/checkout','/api/checkout/square','/api/checkout/stripe']:
            self.assertEqual(self.client.get(path).status_code,503)
            response=self.client.post(path,'{}',content_type='application/json',HTTP_X_CSRFTOKEN=self.token)
            self.assertEqual(response.status_code,503)
