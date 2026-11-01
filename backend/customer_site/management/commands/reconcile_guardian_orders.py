from django.core.management.base import BaseCommand

from customer_site.guardian_payments import (PaymentMismatch, SquareUnavailable, confirm_payment,
                                              list_square_order_payments)
from customer_site.models import GuardianOrder


class Command(BaseCommand):
    help = 'Reconcile persisted Guardian orders with current Square payment status.'

    def add_arguments(self, parser):
        parser.add_argument('--order-id', help='Reconcile one Guardian order UUID.')

    def handle(self, *args, **options):
        orders = GuardianOrder.objects.exclude(square_order_id__isnull=True).exclude(square_order_id='')
        if options.get('order_id'):
            orders = orders.filter(pk=options['order_id'])
        checked = 0
        errors = 0
        for order in orders.iterator():
            payment_ids = set(order.payment_attempts.values_list('provider_payment_id', flat=True))
            if order.square_payment_id:
                payment_ids.add(order.square_payment_id)
            try:
                # Recover attempts whose signed webhook was missed during an outage.
                payment_ids.update(list_square_order_payments(order))
            except SquareUnavailable as exc:
                errors += 1
                self.stderr.write(f'{order.pk}: payment search failed ({type(exc).__name__})')
            for payment_id in sorted(payment_ids):
                try:
                    current = confirm_payment(payment_id)
                    checked += 1
                    self.stdout.write(f'{current.pk} {current.status} provider_payment={payment_id}')
                except (SquareUnavailable, PaymentMismatch, GuardianOrder.DoesNotExist) as exc:
                    errors += 1
                    self.stderr.write(f'{order.pk}: reconciliation failed ({type(exc).__name__})')
        self.stdout.write(f'Reconciled {checked} order(s); {errors} error(s).')
        if errors:
            raise SystemExit(1)
