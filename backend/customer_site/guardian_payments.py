"""Square sandbox checkout and verified Guardian payment state transitions."""
from __future__ import annotations

import base64
import hashlib
import hmac
import os
from datetime import timedelta
from typing import Any

import httpx
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import (
    GuardianEntitlement,
    GuardianOrder,
    GuardianOrderEvent,
    GuardianPaymentAttempt,
    GuardianReserveLedger,
    VerifiedPaymentRecord,
)

GUARDIAN_PRICE_MINOR = 9900
GUARDIAN_RESERVE_MINOR = 1485


class SquareUnavailable(Exception):
    pass


class PaymentMismatch(Exception):
    pass


def checkout_is_enabled() -> bool:
    # Production remains blocked even if an operator accidentally sets the opt-in.
    return bool(
        settings.DEVELOPMENT
        and getattr(settings, 'GUARDIAN_CHECKOUT_ENABLED', False)
        and getattr(settings, 'SQUARE_ENVIRONMENT', 'production') == 'sandbox'
    )


def square_api_base() -> str:
    if getattr(settings, 'SQUARE_ENVIRONMENT', 'production') != 'sandbox':
        raise SquareUnavailable('Square sandbox is required for this checkout foundation.')
    return 'https://connect.squareupsandbox.com'


def square_request(method: str, path: str, *, body: dict[str, Any] | None = None,
                   params: dict[str, str] | None = None) -> dict[str, Any]:
    token = os.getenv('SQUARE_ACCESS_TOKEN', '').strip()
    if not token:
        raise SquareUnavailable('Square sandbox is not configured.')
    try:
        with httpx.Client(timeout=20) as client:
            response = client.request(
                method,
                f'{square_api_base()}{path}',
                headers={
                    'Authorization': f'Bearer {token}',
                    'Square-Version': getattr(settings, 'SQUARE_VERSION', '2026-07-15'),
                    'Content-Type': 'application/json',
                },
                json=body,
                params=params,
            )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict) or payload.get('errors'):
            raise SquareUnavailable('Square returned an invalid response.')
        return payload
    except (httpx.HTTPError, ValueError) as exc:
        raise SquareUnavailable('Square could not complete the request.') from exc


def ensure_payment_link(order: GuardianOrder) -> GuardianOrder:
    if order.square_checkout_url:
        return order
    if order.status != GuardianOrder.Status.PENDING:
        return order
    location_id = os.getenv('SQUARE_LOCATION_ID', '').strip()
    if not location_id:
        raise SquareUnavailable('Square sandbox is not configured.')
    # The stable key is persisted before this network call. A timeout can safely retry
    # the same Square operation without creating a second payment link.
    payload = square_request('POST', '/v2/online-checkout/payment-links', body={
        'idempotency_key': str(order.square_idempotency_key),
        'description': 'POPS Guardian Windows license',
        'order': {
            'location_id': location_id,
            'reference_id': str(order.id),
            'source': {'name': 'POPS Website'},
            'line_items': [{
                'name': 'Guardian Access — Windows one-time license',
                'quantity': '1',
                'base_price_money': {'amount': GUARDIAN_PRICE_MINOR, 'currency': 'USD'},
            }],
        },
    })
    link = payload.get('payment_link') or {}
    url = link.get('long_url') or link.get('url')
    if not isinstance(url, str) or not url.startswith('https://') or not link.get('id') or not link.get('order_id'):
        raise SquareUnavailable('Square did not return a complete hosted checkout reference.')
    with transaction.atomic():
        saved = GuardianOrder.objects.select_for_update().get(pk=order.pk)
        if not saved.square_checkout_url:
            saved.square_payment_link_id = str(link['id'])
            saved.square_order_id = str(link['order_id'])
            saved.square_checkout_url = url
            saved.save(update_fields=['square_payment_link_id', 'square_order_id', 'square_checkout_url', 'updated_at'])
            GuardianOrderEvent.objects.create(order=saved, event_type='checkout_link_created', details={'payment_link_id': saved.square_payment_link_id})
        return saved


def create_or_get_order(user, request_key: str) -> tuple[GuardianOrder, bool]:
    try:
        with transaction.atomic():
            order, created = GuardianOrder.objects.get_or_create(
                user=user,
                request_key=request_key,
                defaults={'amount_minor': GUARDIAN_PRICE_MINOR, 'currency': 'USD'},
            )
            if created:
                GuardianOrderEvent.objects.create(order=order, event_type='order_created', to_status=order.status,
                                                  details={'amount_minor': GUARDIAN_PRICE_MINOR, 'currency': 'USD'})
            return order, created
    except IntegrityError:
        # Handles concurrent requests racing on the unique (customer, request key).
        return GuardianOrder.objects.get(user=user, request_key=request_key), False


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    key = os.getenv('SQUARE_WEBHOOK_SIGNATURE_KEY', '').strip()
    url = os.getenv('SQUARE_WEBHOOK_NOTIFICATION_URL', '').strip()
    if not key or not url or not signature or len(raw_body) > 65536:
        return False
    digest = hmac.new(key.encode('utf-8'), url.encode('utf-8') + raw_body, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode('ascii')
    return hmac.compare_digest(expected, signature)


def get_verified_payment(payment_id: str) -> dict[str, Any]:
    payload = square_request('GET', f'/v2/payments/{payment_id}')
    payment = payload.get('payment')
    if not isinstance(payment, dict):
        raise SquareUnavailable('Square payment status was unavailable.')
    return payment


def list_square_order_payments(order: GuardianOrder) -> list[str]:
    """Find provider attempts after a lost webhook using the saved Square order ID."""
    if not order.square_order_id:
        return []
    location_id = os.getenv('SQUARE_LOCATION_ID', '').strip()
    if not location_id:
        raise SquareUnavailable('Square sandbox is not configured.')
    begin_time = (order.created_at - timedelta(minutes=5)).isoformat().replace('+00:00', 'Z')
    cursor = None
    payment_ids: list[str] = []
    for _ in range(100):
        params = {'location_id': location_id, 'begin_time': begin_time, 'limit': '100'}
        if cursor:
            params['cursor'] = cursor
        payload = square_request('GET', '/v2/payments', params=params)
        for payment in payload.get('payments') or []:
            if isinstance(payment, dict) and payment.get('order_id') == order.square_order_id and payment.get('id'):
                payment_ids.append(str(payment['id']))
        cursor = payload.get('cursor')
        if not cursor:
            return payment_ids
    raise SquareUnavailable('Square payment search exceeded its pagination limit.')


def _reserve_target(net_minor: int) -> int:
    # 15% of the remaining customer payment, rounded to the nearest cent.
    return min(GUARDIAN_RESERVE_MINOR, max(0, (net_minor * 15 + 50) // 100))


def _reserve_to(order: GuardianOrder, target: int, refund_total: int) -> None:
    delta = target - order.reserve_balance_minor
    if not delta:
        return
    key = 'sale' if refund_total == 0 else f'refund-total-{refund_total}'
    _, created = GuardianReserveLedger.objects.get_or_create(
        order=order,
        reference_key=key,
        defaults={
            'amount_minor': delta,
            'reason': 'allocation' if delta > 0 else 'refund_reversal',
        },
    )
    if not created:
        # A repeated provider notification already wrote this exact ledger movement.
        return
    order.reserve_balance_minor = target
    order.save(update_fields=['reserve_balance_minor', 'updated_at'])


def _transition(order: GuardianOrder, status: str, event_type: str, *, provider_event_id: str = '', details: dict[str, Any] | None = None) -> None:
    previous = order.status
    if previous == status:
        return
    order.status = status
    if status == GuardianOrder.Status.PAID and order.paid_at is None:
        order.paid_at = timezone.now()
    if status == GuardianOrder.Status.REFUNDED and order.refunded_at is None:
        order.refunded_at = timezone.now()
    order.save(update_fields=['status', 'paid_at', 'refunded_at', 'refunded_amount_minor', 'reserve_balance_minor', 'square_payment_id', 'updated_at'])
    GuardianOrderEvent.objects.create(order=order, event_type=event_type, from_status=previous, to_status=status,
                                      provider_event_id=provider_event_id, details=details or {})


def apply_verified_payment(payment: dict[str, Any], *, provider_event_id: str = '') -> GuardianOrder:
    """Apply only Square's fetched payment object; webhook JSON never supplies state."""
    payment_id = str(payment.get('id', ''))
    square_order_id = str(payment.get('order_id', ''))
    money = payment.get('amount_money') or {}
    amount = money.get('amount')
    currency = money.get('currency')
    if not payment_id or not square_order_id or amount != GUARDIAN_PRICE_MINOR or currency != 'USD':
        raise PaymentMismatch('Square payment amount, currency, or order reference did not match Guardian.')

    with transaction.atomic():
        order = GuardianOrder.objects.select_for_update().filter(square_order_id=square_order_id).first()
        if not order:
            raise PaymentMismatch('Square payment did not match a saved Guardian order.')
        status = str(payment.get('status', '')).upper()
        refunded_money = payment.get('refunded_money') or {}
        reported_refund = refunded_money.get('amount', 0)
        if not isinstance(reported_refund, int) or reported_refund < 0:
            raise PaymentMismatch('Square returned an invalid refund total.')
        attempt, _ = GuardianPaymentAttempt.objects.get_or_create(
            provider_payment_id=payment_id,
            defaults={'order': order, 'amount_minor': amount, 'currency': currency},
        )
        if attempt.order_id != order.pk:
            raise PaymentMismatch('Square payment reference is already associated with a different order.')
        attempt.status = status or 'UNKNOWN'
        attempt.refunded_amount_minor = min(GUARDIAN_PRICE_MINOR, max(attempt.refunded_amount_minor, reported_refund))
        attempt.last_verified_at = timezone.now()
        attempt.save(update_fields=['status', 'refunded_amount_minor', 'last_verified_at'])

        current_id = order.square_payment_id
        current_attempt = GuardianPaymentAttempt.objects.filter(provider_payment_id=current_id).first() if current_id else None
        order_is_paid = order.status in {GuardianOrder.Status.PAID, GuardianOrder.Status.PARTIALLY_REFUNDED, GuardianOrder.Status.REFUNDED}
        if current_id and current_id != payment_id:
            if order_is_paid:
                event_type = 'duplicate_payment_detected' if status == 'COMPLETED' else 'stale_payment_attempt'
                GuardianOrderEvent.objects.create(
                    order=order, event_type=event_type, from_status=order.status,
                    to_status=order.status, provider_event_id=provider_event_id,
                    details={'payment_id': payment_id, 'attempt_status': status,
                             'refunded_amount_minor': attempt.refunded_amount_minor},
                )
                if status == 'COMPLETED':
                    if attempt.refunded_amount_minor >= GUARDIAN_PRICE_MINOR:
                        attempt.status = 'DUPLICATE_REFUNDED'
                    elif attempt.refunded_amount_minor > 0:
                        attempt.status = 'DUPLICATE_PARTIALLY_REFUNDED'
                    else:
                        attempt.status = 'DUPLICATE_COMPLETED'
                    attempt.save(update_fields=['status', 'last_verified_at'])
                return order
            if status in {'CANCELED', 'FAILED'} and current_attempt and current_attempt.status not in {'CANCELED', 'FAILED'}:
                GuardianOrderEvent.objects.create(
                    order=order, event_type='stale_payment_attempt', from_status=order.status,
                    to_status=order.status, provider_event_id=provider_event_id,
                    details={'payment_id': payment_id, 'attempt_status': status},
                )
                return order
            if status in {'APPROVED', 'PENDING'} and order.status == GuardianOrder.Status.PENDING:
                return order
            # A later valid success can recover a previously failed/canceled order.
            order.square_payment_id = payment_id
        else:
            order.square_payment_id = payment_id

        refund_total = min(GUARDIAN_PRICE_MINOR, max(order.refunded_amount_minor, reported_refund))
        order.refunded_amount_minor = refund_total

        if status == 'COMPLETED':
            if order.status != GuardianOrder.Status.PAID and order.status != GuardianOrder.Status.PARTIALLY_REFUNDED and order.status != GuardianOrder.Status.REFUNDED:
                _transition(order, GuardianOrder.Status.PAID, 'payment_confirmed', provider_event_id=provider_event_id,
                            details={'provider': 'square', 'payment_id': payment_id})
            elif order.status == GuardianOrder.Status.REFUNDED:
                # Do not resurrect an entitlement from a stale pre-refund event.
                order.save(update_fields=['refunded_amount_minor', 'square_payment_id', 'updated_at'])
            else:
                order.save(update_fields=['refunded_amount_minor', 'square_payment_id', 'updated_at'])

            paid_order = GuardianOrder.objects.select_for_update().get(pk=order.pk)
            if paid_order.status != GuardianOrder.Status.REFUNDED:
                entitlement, _ = GuardianEntitlement.objects.get_or_create(
                    order=paid_order,
                    defaults={'user_id': paid_order.user_id, 'product_code': 'guardian_windows', 'status': GuardianEntitlement.Status.ACTIVE},
                )
                VerifiedPaymentRecord.objects.get_or_create(
                    provider='square', provider_payment_id=payment_id,
                    defaults={'user_id': paid_order.user_id, 'amount_minor': GUARDIAN_PRICE_MINOR,
                              'currency': 'USD', 'status': 'completed', 'verified_at': timezone.now()},
                )
                if entitlement.status == GuardianEntitlement.Status.REVOKED and refund_total < GUARDIAN_PRICE_MINOR:
                    entitlement.status = GuardianEntitlement.Status.ACTIVE
                    entitlement.revoked_at = None
                    entitlement.save(update_fields=['status', 'revoked_at', 'updated_at'])
            # Record the qualifying gross sale, then append any refund reversal. This
            # also preserves both audit entries if the first observed state is refunded.
            _reserve_to(paid_order, GUARDIAN_RESERVE_MINOR, 0)
            _reserve_to(paid_order, _reserve_target(GUARDIAN_PRICE_MINOR - refund_total), refund_total)
            if refund_total >= GUARDIAN_PRICE_MINOR:
                if paid_order.status != GuardianOrder.Status.REFUNDED:
                    _transition(paid_order, GuardianOrder.Status.REFUNDED, 'payment_refunded', provider_event_id=provider_event_id,
                                details={'refunded_amount_minor': refund_total})
                entitlement = GuardianEntitlement.objects.filter(order=paid_order).first()
                if entitlement and entitlement.status != GuardianEntitlement.Status.REVOKED:
                    entitlement.status = GuardianEntitlement.Status.REVOKED
                    entitlement.revoked_at = timezone.now()
                    entitlement.save(update_fields=['status', 'revoked_at', 'updated_at'])
                VerifiedPaymentRecord.objects.filter(provider='square', provider_payment_id=payment_id).update(status='refunded')
            elif refund_total > 0 and paid_order.status != GuardianOrder.Status.PARTIALLY_REFUNDED:
                _transition(paid_order, GuardianOrder.Status.PARTIALLY_REFUNDED, 'payment_partially_refunded',
                            provider_event_id=provider_event_id, details={'refunded_amount_minor': refund_total})
            elif refund_total == 0 and paid_order.status == GuardianOrder.Status.PARTIALLY_REFUNDED:
                # Refund totals are monotonic; this is defensive and should not normally occur.
                pass
            paid_order.refresh_from_db()
            return paid_order

        if status in {'APPROVED', 'PENDING'}:
            if order.status in {GuardianOrder.Status.CANCELED, GuardianOrder.Status.FAILED}:
                _transition(order, GuardianOrder.Status.PENDING, 'payment_attempt_reopened', provider_event_id=provider_event_id,
                            details={'provider': 'square', 'payment_id': payment_id})
            else:
                order.save(update_fields=['square_payment_id', 'refunded_amount_minor', 'updated_at'])
        elif status in {'CANCELED', 'FAILED'}:
            if order.status == GuardianOrder.Status.PENDING:
                new_status = GuardianOrder.Status.CANCELED if status == 'CANCELED' else GuardianOrder.Status.FAILED
                _transition(order, new_status, f'payment_{new_status}', provider_event_id=provider_event_id,
                            details={'provider': 'square', 'payment_id': payment_id})
        else:
            order.save(update_fields=['square_payment_id', 'refunded_amount_minor', 'updated_at'])
        return GuardianOrder.objects.get(pk=order.pk)


def confirm_payment(payment_id: str, *, provider_event_id: str = '') -> GuardianOrder:
    payment = get_verified_payment(payment_id)
    return apply_verified_payment(payment, provider_event_id=provider_event_id)

