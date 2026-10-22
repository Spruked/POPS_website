from django.db import models
from django.conf import settings
from django.db.models.functions import Lower
from django.utils import timezone
import uuid


class BetaApplication(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='beta_applications')
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    platform = models.CharField(max_length=20)
    experience = models.CharField(max_length=30)
    updates = models.BooleanField(default=False)
    consent_version = models.CharField(max_length=30, default='2026-10-21')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')


class SupportRequest(models.Model):
    email = models.EmailField()
    category = models.CharField(max_length=30)
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)


class RequestLimit(models.Model):
    key = models.CharField(max_length=64, unique=True)
    window = models.BigIntegerField()
    count = models.PositiveIntegerField(default=0)


class CustomerProfile(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        UNVERIFIED = 'unverified', 'Unverified'
        SUSPENDED = 'suspended', 'Suspended'
        CLOSED = 'closed', 'Closed'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_profile')
    middle_name = models.CharField(max_length=150, blank=True)
    display_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    street_address = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True, db_index=True)
    postal_code = models.CharField(max_length=30, blank=True)
    country = models.CharField(max_length=2, blank=True, db_index=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.UNVERIFIED, db_index=True)
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    auth_version = models.PositiveIntegerField(default=1)
    registration_country = models.CharField(max_length=2, blank=True)
    registration_state = models.CharField(max_length=100, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    terms_version = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        permissions = [('view_geography', 'View aggregate customer geography'), ('manage_customer_status', 'Manage customer account status')]
        constraints = [models.CheckConstraint(condition=models.Q(status__in=['active', 'unverified', 'suspended', 'closed']), name='customer_status_valid')]

    @property
    def full_name(self):
        return ' '.join(part for part in [self.user.first_name, self.middle_name, self.user.last_name] if part)


class CustomerEmail(models.Model):
    """One namespace reserves current and pending emails across all accounts."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_emails')
    address = models.EmailField(max_length=254)
    kind = models.CharField(max_length=10, choices=[('current', 'Current'), ('pending', 'Pending')])
    nonce = models.UUIDField(default=uuid.uuid4)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower('address'), name='customer_email_unique_casefold'),
            models.UniqueConstraint(fields=['user', 'kind'], name='customer_one_email_per_kind'),
            models.CheckConstraint(condition=models.Q(kind__in=['current', 'pending']), name='customer_email_kind_valid'),
        ]


class CommunicationPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='communication_preferences')
    marketing_email = models.BooleanField(default=False)
    research_invitations = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


class ConsentEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consent_events')
    purpose = models.CharField(max_length=30, choices=[('marketing_email', 'Marketing email'), ('research_invitations', 'Research invitations')])
    previous_value = models.BooleanField(null=True)
    granted = models.BooleanField()
    policy_version = models.CharField(max_length=60)
    source = models.CharField(max_length=30)
    occurred_at = models.DateTimeField(default=timezone.now)


class GeographicHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='geographic_history')
    country = models.CharField(max_length=2, blank=True)
    state = models.CharField(max_length=100, blank=True)
    effective_from = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=30)


class CustomerAccessAudit(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='customer_access_events')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='staff_access_events')
    action = models.CharField(max_length=40)
    purpose = models.CharField(max_length=40)
    changed_fields = models.JSONField(default=list)
    occurred_at = models.DateTimeField(default=timezone.now)


class VerifiedPaymentRecord(models.Model):
    """Future trusted payment-ingestion boundary. No public writes or checkout."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='verified_payments')
    provider = models.CharField(max_length=10, choices=[('square', 'Square'), ('stripe', 'Stripe')])
    provider_payment_id = models.CharField(max_length=200)
    amount_minor = models.PositiveIntegerField()
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=15, choices=[('completed', 'Completed'), ('refunded', 'Refunded')])
    verified_at = models.DateTimeField(null=True, blank=True)
    recorded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['provider', 'provider_payment_id'], name='customer_payment_reference_unique')]


class StateFeatureFeedback(models.Model):
    """Reserved for future permission-based product feedback; no invented demand."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    country = models.CharField(max_length=2)
    state = models.CharField(max_length=100)
    feature = models.CharField(max_length=100)
    feedback = models.TextField(max_length=2000)
    created_at = models.DateTimeField(default=timezone.now)
