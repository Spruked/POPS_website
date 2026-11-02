from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('customer_site', '0004_guardian_checkout')]

    operations = [
        migrations.AddField(model_name='betaapplication', name='phone', field=models.CharField(max_length=30, blank=True)),
        migrations.AddField(model_name='betaapplication', name='street_address', field=models.CharField(max_length=200, blank=True)),
        migrations.AddField(model_name='betaapplication', name='city', field=models.CharField(max_length=100, blank=True)),
        migrations.AddField(model_name='betaapplication', name='state', field=models.CharField(max_length=100, blank=True)),
        migrations.AddField(model_name='betaapplication', name='source', field=models.CharField(max_length=30, blank=True)),
    ]
