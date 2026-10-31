from django.conf import settings
from django.db import migrations

def preserve_customers(apps, schema_editor):
    User=apps.get_model('auth','User')
    Profile=apps.get_model('customer_site','CustomerProfile')
    Email=apps.get_model('customer_site','CustomerEmail')
    Preferences=apps.get_model('customer_site','CommunicationPreferences')
    Beta=apps.get_model('customer_site','BetaApplication')
    History=apps.get_model('customer_site','GeographicHistory')
    seen={}
    for user in User.objects.all().iterator():
        if user.email:
            local,domain=user.email.strip().casefold().rsplit('@',1)
            address=local+'@'+domain.encode('idna').decode('ascii')
            if address in seen:raise RuntimeError('Existing customer emails collide after normalization. Resolve duplicate user IDs before migrating: '+str(seen[address])+', '+str(user.pk))
            seen[address]=user.pk
            Email.objects.create(user_id=user.pk,address=address,kind='current')
            Beta.objects.filter(email__iexact=user.email,user__isnull=True).update(user_id=user.pk)
            User.objects.filter(pk=user.pk).update(email=address)
        Profile.objects.create(user_id=user.pk,status='active' if user.is_active else 'unverified',email_verified=user.is_active,created_at=user.date_joined)
        Preferences.objects.create(user_id=user.pk)
        History.objects.create(user_id=user.pk,country='',state='',effective_from=user.date_joined,source='legacy-location-unknown')
    # No invented address, surname, verification timestamp or marketing consent.

class Migration(migrations.Migration):
    dependencies=[migrations.swappable_dependency(settings.AUTH_USER_MODEL),('customer_site','0002_betaapplication_user_communicationpreferences_and_more')]
    operations=[migrations.RunPython(preserve_customers,migrations.RunPython.noop)]
