import re
import unicodedata
import phonenumbers
import pycountry
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

POLICY_VERSION = 'customer-communications-2026-10-22'
TERMS_VERSION = 'website-terms-2026-10-22'
US_STATES = dict((code, name) for code, name in [
    ('AL','Alabama'),('AK','Alaska'),('AZ','Arizona'),('AR','Arkansas'),('CA','California'),('CO','Colorado'),('CT','Connecticut'),('DE','Delaware'),('DC','District of Columbia'),('FL','Florida'),('GA','Georgia'),('HI','Hawaii'),('ID','Idaho'),('IL','Illinois'),('IN','Indiana'),('IA','Iowa'),('KS','Kansas'),('KY','Kentucky'),('LA','Louisiana'),('ME','Maine'),('MD','Maryland'),('MA','Massachusetts'),('MI','Michigan'),('MN','Minnesota'),('MS','Mississippi'),('MO','Missouri'),('MT','Montana'),('NE','Nebraska'),('NV','Nevada'),('NH','New Hampshire'),('NJ','New Jersey'),('NM','New Mexico'),('NY','New York'),('NC','North Carolina'),('ND','North Dakota'),('OH','Ohio'),('OK','Oklahoma'),('OR','Oregon'),('PA','Pennsylvania'),('RI','Rhode Island'),('SC','South Carolina'),('SD','South Dakota'),('TN','Tennessee'),('TX','Texas'),('UT','Utah'),('VT','Vermont'),('VA','Virginia'),('WA','Washington'),('WV','West Virginia'),('WI','Wisconsin'),('WY','Wyoming'),('AS','American Samoa'),('GU','Guam'),('MP','Northern Mariana Islands'),('PR','Puerto Rico'),('VI','U.S. Virgin Islands'),('AA','Armed Forces Americas'),('AE','Armed Forces Europe'),('AP','Armed Forces Pacific')])
COUNTRIES = sorted([(c.alpha_2, c.name) for c in pycountry.countries], key=lambda c:c[1])

def normalize_email(value):
    local, domain = value.strip().casefold().rsplit('@', 1)
    return local + '@' + domain.encode('idna').decode('ascii')

class CustomerDetailsForm(forms.Form):
    first_name = forms.CharField(max_length=150)
    middle_name = forms.CharField(max_length=150, required=False)
    last_name = forms.CharField(max_length=150)
    display_name = forms.CharField(max_length=150, required=False)
    phone = forms.CharField(max_length=60)
    street_address = forms.CharField(max_length=200)
    address_line2 = forms.CharField(max_length=100, required=False)
    city = forms.CharField(max_length=100)
    state = forms.CharField(max_length=100)
    postal_code = forms.CharField(max_length=30)
    country = forms.ChoiceField(choices=COUNTRIES, initial='US')

    def clean(self):
        data = super().clean()
        for field, value in data.items():
            # Identity normalization must never alter a password's exact bytes.
            if field not in CustomerDetailsForm.base_fields:
                continue
            if isinstance(value, str):
                if any(unicodedata.category(char) in {'Cc', 'Cs'} for char in value):
                    self.add_error(field, 'Remove control characters from this field.')
                else:
                    data[field] = unicodedata.normalize('NFC', value.strip())
        country = data.get('country')
        state = data.get('state', '')
        if country == 'US':
            data['state'] = state.upper()
            if data['state'] not in US_STATES:
                self.add_error('state', 'Choose a valid two-letter US state or territory code.')
            if not re.fullmatch(r'\d{5}(?:-\d{4})?', data.get('postal_code', '')):
                self.add_error('postal_code', 'Enter a five-digit ZIP code or ZIP+4.')
        if country and data.get('phone'):
            try:
                phone = phonenumbers.parse(data['phone'], country)
                if not phonenumbers.is_valid_number(phone):
                    raise ValueError()
                normalized = phonenumbers.format_number(phone, phonenumbers.PhoneNumberFormat.E164)
                data['phone'] = normalized + (f' ext. {phone.extension}' if phone.extension else '')
                if len(data['phone']) > 40: raise ValueError()
            except (ValueError, phonenumbers.NumberParseException):
                self.add_error('phone', 'Enter a valid telephone number, including its country calling code for an international number.')
        return data

class PreferencesForm(forms.Form):
    marketing_email = forms.BooleanField(required=False)
    research_invitations = forms.BooleanField(required=False)

class CustomerRegistrationForm(CustomerDetailsForm, UserCreationForm):
    email = forms.EmailField(max_length=254)
    consent = forms.BooleanField()
    marketing_email = forms.BooleanField(required=False)
    research_invitations = forms.BooleanField(required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password1', 'password2')

    def clean_email(self):
        try:
            value = normalize_email(self.cleaned_data['email'])
            if len(value) > 254: raise ValueError()
            return value
        except (ValueError, UnicodeError):
            raise forms.ValidationError('Enter a valid email address.')

class EmailChangeForm(forms.Form):
    email = forms.EmailField(max_length=254)
    current_password = forms.CharField(max_length=1024)

    def clean_email(self):
        try: return normalize_email(self.cleaned_data['email'])
        except (ValueError, UnicodeError): raise forms.ValidationError('Enter a valid email address.')
