from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegistrationForm(UserCreationForm):
    name = forms.CharField(max_length=100)
    email = forms.EmailField(max_length=150)
    consent = forms.BooleanField()

    class Meta:
        model = User
        fields = ('email', 'name', 'password1', 'password2', 'consent')

    def clean_email(self):
        return self.cleaned_data['email'].strip().casefold()


class BetaForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    platform = forms.ChoiceField(choices=[('windows', 'Windows'), ('android', 'Android'), ('both', 'Both')])
    experience = forms.ChoiceField(choices=[('new', 'New to this'), ('some', 'Some experience'), ('experienced', 'Experienced')])
    consent = forms.BooleanField()
    updates = forms.BooleanField(required=False)
    website = forms.CharField(required=False, max_length=100)


class SupportForm(forms.Form):
    email = forms.EmailField()
    category = forms.ChoiceField(choices=[(x, x) for x in ['installation', 'account', 'beta-feedback', 'licensing', 'privacy', 'other']])
    message = forms.CharField(min_length=10, max_length=2000)
    consent = forms.BooleanField()
    website = forms.CharField(required=False, max_length=100)
