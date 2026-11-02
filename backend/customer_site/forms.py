from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


from .profile_forms import CustomerRegistrationForm as RegistrationForm


class BetaForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    platform = forms.ChoiceField(choices=[('windows', 'Windows'), ('android', 'Android'), ('both', 'Both')])
    experience = forms.ChoiceField(choices=[('new', 'New to this'), ('some', 'Some experience'), ('experienced', 'Experienced')])
    consent = forms.BooleanField()
    updates = forms.BooleanField(required=False)
    phone = forms.CharField(max_length=30, required=False)
    street_address = forms.CharField(max_length=200, required=False)
    city = forms.CharField(max_length=100, required=False)
    state = forms.CharField(max_length=100, required=False)
    source = forms.ChoiceField(required=False, choices=[(x, x) for x in ['tiktok', 'facebook', 'instagram', 'youtube', 'friend', 'other']])
    website = forms.CharField(required=False, max_length=100)


class SupportForm(forms.Form):
    email = forms.EmailField()
    category = forms.ChoiceField(choices=[(x, x) for x in ['installation', 'account', 'beta-feedback', 'licensing', 'privacy', 'other']])
    message = forms.CharField(min_length=10, max_length=2000)
    consent = forms.BooleanField()
    website = forms.CharField(required=False, max_length=100)
