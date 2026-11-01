import base64
import hashlib
import hmac
import json
import os
import uuid
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import connection
from django.test import Client, TestCase, TransactionTestCase, override_settings

from . import guardian_payments
from .models import (GuardianEntitlement, GuardianOrder, GuardianOrderEvent,
                     GuardianReserveLedger, SquareWebhookEvent, VerifiedPaymentRecord)
from .profile_service import ensure_customer


SIGNATURE_KEY = 'test-only-square-webhook-signature-key'
NOTIFICATION_URL = 'https://checkout.test.invalid/api/checkout/square/webhook'


@override_settings(DEVELOPMENT=True, GUARDIAN_CHECKOUT_ENABLED=True,
                   SQUARE_ENVIRONMENT='sandbox', SQUARE_VERSION='2026-07-15')
class GuardianPaymentTests(TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {
            'SQUARE_ACCESS_TOKEN': 'sandbox-test-token',
            'SQUARE_LOCATION_ID': 'sandbox-location',
            'SQUARE_WEBHOOK_SIGNATURE_KEY': SIGNATURE_KEY,
            'SQUARE_WEBHOOK_NOTIFICATION_URL': NOTIFICATION_URL,
        })
        self.env.start()
        self.addCleanup(self.env.stop)
        self.user = User.objects.create_user('buyer@example.com', email='buyer@example.com', password='Test-password!928', is_active=True)
        profile = ensure_customer(self.user)
        profile.status = 'active'
        profile.email_verified = True
        profile.save(update_fields=['status', 'email_verified', 'updated_at'])
        self.client = Client()
        self.client.force_login(self.user)
        self.square_link_call_count = 0

    def create_link(self, method, path, *, body=None, params=None):
        if method == 'POST' and path == '/v2/online-checkout/payment-links':
            self.square_link_call_count += 1
            reference = body['order']['reference_id']
            return {'payment_link': {
                'id': 'link-' + reference, 'order_id': 'square-order-' + reference,
                'long_url': 'https://squareupsandbox.com/checkout/test-link',
            }}
        raise AssertionError(f'Unexpected Square API request: {method} {path} {params}')

    def start_checkout(self, key=None):
        with patch('customer_site.guardian_payments.square_request', side_effect=self.create_link):
            return self.client.post('/api/checkout/guardian', json.dumps({'request_key': key or str(uuid.uuid4())}), content_type='application/json')

    def sign(self, body):
        mac = hmac.new(SIGNATURE_KEY.encode(), NOTIFICATION_URL.encode() + body, hashlib.sha256).digest()
        return base64.b64encode(mac).decode()

    def send_event(self, event_id, event_type, payment_id='square-payment-test'):
        if event_type.startswith('payment.'):
            object_body = {'payment': {'id': payment_id}}
        else:
            object_body = {'refund': {'id': 'refund-test', 'payment_id': payment_id}}
        body = json.dumps({'event_id': event_id, 'type': event_type, 'data': {'object': object_body}}, separators=(',', ':')).encode()
        return self.client.post('/api/checkout/square/webhook', body, content_type='application/json', HTTP_X_SQUARE_HMACSHA256_SIGNATURE=self.sign(body))

    def checkout_order(self):
        response = self.start_checkout()
        self.assertEqual(response.status_code, 201, response.content)
        return GuardianOrder.objects.get(pk=response.json()['order']['order_id'])

    @staticmethod
    def completed_payment(order=None, payment_id='square-payment-test', **overrides):
        square_order_id = order.square_order_id if order else 'square-order-guardian-test'
        return {
            'id': payment_id,
            'order_id': square_order_id,
            'status': 'COMPLETED',
            'amount_money': {'amount': 9900, 'currency': 'USD'},
            'refunded_money': {'amount': 0, 'currency': 'USD'},
            **overrides,
        }

    def verify_webhook(self, payment=None, error=None):
        with patch('customer_site.guardian_payments.get_verified_payment', side_effect=error or None, return_value=payment or self.completed_payment()):
            return self.send_event('event-' + str(uuid.uuid4()), 'payment.updated')

    def test_correct_server_price_and_manipulated_price_rejected(self):
        bad = self.client.post('/api/checkout/guardian', json.dumps({'request_key': str(uuid.uuid4()), 'price': 1}), content_type='application/json')
        self.assertEqual(bad.status_code, 400)
        self.assertEqual(GuardianOrder.objects.count(), 0)
        response = self.start_checkout()
        self.assertEqual(response.status_code, 201)
        order = GuardianOrder.objects.get()
        self.assertEqual(order.amount_minor, 9900)
        self.assertEqual(order.currency, 'USD')
        self.assertEqual(response.json()['order']['amount_minor'], 9900)

    def test_pending_order_and_repeated_checkout_reuse_stable_square_request(self):
        key = str(uuid.uuid4())
        first = self.start_checkout(key)
        self.assertEqual(first.status_code, 201)
        order = GuardianOrder.objects.get()
        square_key = order.square_idempotency_key
        self.assertEqual(order.status, GuardianOrder.Status.PENDING)
        self.assertEqual(order.square_payment_link_id, 'link-' + str(order.pk))
        self.assertEqual(order.square_order_id, 'square-order-' + str(order.pk))
        second = self.start_checkout(key)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json()['order']['order_id'], str(order.pk))
        self.assertEqual(self.square_link_call_count, 1)
        order.refresh_from_db()
        self.assertEqual(order.square_idempotency_key, square_key)
        self.assertEqual(GuardianOrder.objects.count(), 1)

    def test_square_link_creation_failure_keeps_pending_order_for_safe_retry(self):
        key = str(uuid.uuid4())
        recovered_link = {'payment_link': {'id': 'retry-link', 'order_id': 'retry-square-order', 'long_url': 'https://squareupsandbox.com/checkout/retry'}}
        with patch('customer_site.guardian_payments.square_request', side_effect=[guardian_payments.SquareUnavailable('timeout'), recovered_link]) as square_call:
            first = self.client.post('/api/checkout/guardian', json.dumps({'request_key': key}), content_type='application/json')
            self.assertEqual(first.status_code, 502)
            order = GuardianOrder.objects.get()
            stable_key = order.square_idempotency_key
            self.assertEqual(order.status, GuardianOrder.Status.PENDING)
            # Retry uses the same persisted Square idempotency key and completes the link.
            second = self.client.post('/api/checkout/guardian', json.dumps({'request_key': key}), content_type='application/json')
        self.assertEqual(second.status_code, 201)
        self.assertEqual(square_call.call_count, 2)
        self.assertEqual(square_call.call_args_list[0].kwargs['body']['idempotency_key'], str(stable_key))
        self.assertEqual(square_call.call_args_list[1].kwargs['body']['idempotency_key'], str(stable_key))
        order.refresh_from_db()
        self.assertEqual(order.square_idempotency_key, stable_key)
        self.assertTrue(order.square_checkout_url)

    def test_order_survives_new_request_context_and_is_customer_scoped(self):
        order = self.checkout_order()
        order_id = str(order.pk)
        self.client.logout()
        new_browser = Client()
        new_browser.force_login(self.user)
        response = new_browser.get(f'/api/checkout/guardian/orders/{order_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['order']['status'], 'pending')
        other = User.objects.create_user('other@example.com', password='Test-password!938')
        other_browser = Client()
        other_browser.force_login(other)
        self.assertEqual(other_browser.get(f'/api/checkout/guardian/orders/{order_id}').status_code, 404)

    def test_reconciliation_can_discover_a_payment_when_its_webhook_was_missed(self):
        order = self.checkout_order()
        with patch.dict(os.environ, {'SQUARE_LOCATION_ID': 'sandbox-location'}):
            with patch('customer_site.guardian_payments.square_request', side_effect=[
                {'payments': [{'id': 'unrelated', 'order_id': 'another-order'}], 'cursor': 'next-page'},
                {'payments': [{'id': 'missed-webhook-payment', 'order_id': order.square_order_id}]},
            ]) as list_payments:
                ids = guardian_payments.list_square_order_payments(order)
        self.assertEqual(ids, ['missed-webhook-payment'])
        self.assertEqual(list_payments.call_count, 2)

    def test_provider_success_grants_one_entitlement_and_one_reserve_allocation(self):
        order = self.checkout_order()
        payment = self.completed_payment(order)
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=payment):
            first = guardian_payments.confirm_payment('square-payment-test', provider_event_id='webhook-1')
            second = guardian_payments.confirm_payment('square-payment-test', provider_event_id='webhook-2')
        self.assertEqual(first.status, GuardianOrder.Status.PAID)
        self.assertEqual(second.status, GuardianOrder.Status.PAID)
        self.assertEqual(GuardianEntitlement.objects.filter(order=order, status='active').count(), 1)
        self.assertEqual(VerifiedPaymentRecord.objects.filter(provider_payment_id='square-payment-test', status='completed').count(), 1)
        self.assertEqual(GuardianReserveLedger.objects.filter(order=order, amount_minor__gt=0).count(), 1)
        order.refresh_from_db()
        self.assertEqual(order.reserve_balance_minor, 1485)

    def test_second_completed_payment_for_order_is_detected_without_duplicate_entitlement(self):
        order = self.checkout_order()
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=self.completed_payment(order)):
            guardian_payments.confirm_payment('square-payment-test')
        duplicate = self.completed_payment(order, payment_id='second-square-payment')
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=duplicate):
            guardian_payments.confirm_payment('second-square-payment', provider_event_id='second-payment-event')
        self.assertEqual(GuardianEntitlement.objects.filter(order=order).count(), 1)
        self.assertEqual(GuardianReserveLedger.objects.filter(order=order).count(), 1)
        self.assertEqual(order.payment_attempts.filter(status='DUPLICATE_COMPLETED').count(), 1)
        self.assertTrue(GuardianOrderEvent.objects.filter(order=order, event_type='duplicate_payment_detected').exists())

    def test_canceled_and_failed_payments_do_not_grant_entitlement(self):
        for terminal, expected in [('CANCELED', GuardianOrder.Status.CANCELED), ('FAILED', GuardianOrder.Status.FAILED)]:
            order = self.checkout_order()
            payment = self.completed_payment(order, payment_id=f'payment-{terminal.lower()}', status=terminal)
            with patch('customer_site.guardian_payments.get_verified_payment', return_value=payment):
                updated = guardian_payments.confirm_payment(payment['id'])
            self.assertEqual(updated.status, expected)
            self.assertFalse(GuardianEntitlement.objects.filter(order=order).exists())
            # A later provider-confirmed success may arrive after a delayed failure event.
            with patch('customer_site.guardian_payments.get_verified_payment', return_value=self.completed_payment(order, payment_id=payment['id'])):
                recovered = guardian_payments.confirm_payment(payment['id'])
            self.assertEqual(recovered.status, GuardianOrder.Status.PAID)
            self.assertEqual(GuardianEntitlement.objects.filter(order=order).count(), 1)

    def test_invalid_webhook_signature_is_rejected_before_persistence(self):
        body = json.dumps({'event_id': 'bad-signature-event', 'type': 'payment.updated', 'data': {}}).encode()
        response = self.client.post('/api/checkout/square/webhook', body, content_type='application/json', HTTP_X_SQUARE_HMACSHA256_SIGNATURE='invalid')
        self.assertEqual(response.status_code, 403)
        self.assertFalse(SquareWebhookEvent.objects.filter(event_id='bad-signature-event').exists())

    def test_duplicate_and_out_of_order_webhooks_use_current_provider_state(self):
        order = self.checkout_order()
        body = json.dumps({'event_id': 'duplicate-test', 'type': 'payment.updated', 'data': {'object': {'payment': {'id': 'square-payment-test'}}}}, separators=(',', ':')).encode()
        signature = self.sign(body)
        current = self.completed_payment(order)
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=current):
            one = self.client.post('/api/checkout/square/webhook', body, content_type='application/json', HTTP_X_SQUARE_HMACSHA256_SIGNATURE=signature)
            two = self.client.post('/api/checkout/square/webhook', body, content_type='application/json', HTTP_X_SQUARE_HMACSHA256_SIGNATURE=signature)
        self.assertEqual(one.status_code, 200)
        self.assertEqual(two.status_code, 200)
        # A later-arriving old cancellation notice triggers a fresh GET; Square still
        # reports COMPLETED, so browser/webhook arrival order cannot downgrade the order.
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=current):
            old = self.send_event('old-cancel-event', 'payment.updated')
        self.assertEqual(old.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.PAID)
        self.assertEqual(GuardianEntitlement.objects.filter(order=order).count(), 1)
        self.assertEqual(GuardianReserveLedger.objects.filter(order=order).count(), 1)
        self.assertEqual(SquareWebhookEvent.objects.filter(event_id='duplicate-test').count(), 1)

    def test_provider_verification_failure_is_retryable_without_marking_paid(self):
        order = self.checkout_order()
        with patch('customer_site.guardian_payments.get_verified_payment', side_effect=guardian_payments.SquareUnavailable('temporary')):
            failed = self.send_event('retryable-payment-event', 'payment.updated')
        self.assertEqual(failed.status_code, 503)
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.PENDING)
        self.assertEqual(SquareWebhookEvent.objects.get(event_id='retryable-payment-event').status, 'retryable_error')
        body = json.dumps({'event_id': 'retryable-payment-event', 'type': 'payment.updated', 'data': {'object': {'payment': {'id': 'square-payment-test'}}}}, separators=(',', ':')).encode()
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=self.completed_payment(order)):
            retry = self.client.post('/api/checkout/square/webhook', body, content_type='application/json', HTTP_X_SQUARE_HMACSHA256_SIGNATURE=self.sign(body))
        self.assertEqual(retry.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.PAID)

    def test_refund_reverses_reserve_proportionally_and_full_refund_revokes_entitlement_once(self):
        order = self.checkout_order()
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=self.completed_payment(order)):
            guardian_payments.confirm_payment('square-payment-test')
        partial = self.completed_payment(order, refunded_money={'amount': 3300, 'currency': 'USD'})
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=partial):
            guardian_payments.confirm_payment('square-payment-test', provider_event_id='partial-refund')
            guardian_payments.confirm_payment('square-payment-test', provider_event_id='duplicate-partial-refund')
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.PARTIALLY_REFUNDED)
        self.assertEqual(order.reserve_balance_minor, 990)
        full = self.completed_payment(order, refunded_money={'amount': 9900, 'currency': 'USD'})
        with patch('customer_site.guardian_payments.get_verified_payment', return_value=full):
            guardian_payments.confirm_payment('square-payment-test', provider_event_id='full-refund')
            guardian_payments.confirm_payment('square-payment-test', provider_event_id='duplicate-full-refund')
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.REFUNDED)
        self.assertEqual(order.reserve_balance_minor, 0)
        self.assertEqual(sum(order.reserve_entries.values_list('amount_minor', flat=True)), 0)
        self.assertEqual(order.reserve_entries.filter(amount_minor__gt=0).count(), 1)
        self.assertEqual(GuardianEntitlement.objects.get(order=order).status, GuardianEntitlement.Status.REVOKED)
        self.assertEqual(VerifiedPaymentRecord.objects.get(provider_payment_id='square-payment-test').status, 'refunded')

    def test_mismatched_provider_amount_never_marks_paid(self):
        order = self.checkout_order()
        with self.assertRaises(guardian_payments.PaymentMismatch):
            guardian_payments.apply_verified_payment(self.completed_payment(order, amount_money={'amount': 100, 'currency': 'USD'}))
        order.refresh_from_db()
        self.assertEqual(order.status, GuardianOrder.Status.PENDING)
        self.assertFalse(GuardianEntitlement.objects.filter(order=order).exists())

    @override_settings(DEVELOPMENT=False, GUARDIAN_CHECKOUT_ENABLED=True, SQUARE_ENVIRONMENT='sandbox')
    def test_production_remains_blocked_even_when_checkout_flag_is_set(self):
        response = self.client.post('/api/checkout/guardian', json.dumps({'request_key': str(uuid.uuid4())}), content_type='application/json')
        self.assertEqual(response.status_code, 503)
        self.assertEqual(GuardianOrder.objects.count(), 0)


@override_settings(DEVELOPMENT=True, GUARDIAN_CHECKOUT_ENABLED=True,
                   SQUARE_ENVIRONMENT='sandbox', SQUARE_VERSION='2026-07-15')
class GuardianOrderRecoveryTests(TransactionTestCase):
    reset_sequences = True

    def test_order_and_payment_link_recover_after_database_connection_restart(self):
        user = User.objects.create_user('restart@example.com', password='Test-password!948', is_active=True)
        profile = ensure_customer(user)
        profile.status = 'active'
        profile.email_verified = True
        profile.save(update_fields=['status', 'email_verified', 'updated_at'])
        key = str(uuid.uuid4())
        first_browser = Client()
        first_browser.force_login(user)
        with patch.dict(os.environ, {'SQUARE_ACCESS_TOKEN': 'sandbox-test-token', 'SQUARE_LOCATION_ID': 'sandbox-location'}):
            with patch('customer_site.guardian_payments.square_request', return_value={'payment_link': {
                'id': 'restart-link', 'order_id': 'restart-square-order',
                'long_url': 'https://squareupsandbox.com/checkout/restart',
            }}) as create_link:
                first = first_browser.post('/api/checkout/guardian', json.dumps({'request_key': key}), content_type='application/json')
                self.assertEqual(first.status_code, 201)
                connection.close()
                recovered_browser = Client()
                recovered_browser.force_login(user)
                second = recovered_browser.post('/api/checkout/guardian', json.dumps({'request_key': key}), content_type='application/json')
                self.assertEqual(second.status_code, 200)
                self.assertEqual(first.json()['order']['order_id'], second.json()['order']['order_id'])
                self.assertEqual(second.json()['order']['checkout_url'], 'https://squareupsandbox.com/checkout/restart')
                create_link.assert_called_once()
                self.assertEqual(GuardianOrder.objects.count(), 1)
