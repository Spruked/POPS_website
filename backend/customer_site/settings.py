import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / '.local' / 'customers'
if os.name != 'nt': os.umask(0o077)
STATE.mkdir(parents=True, exist_ok=True, mode=0o700)
DEVELOPMENT = os.environ.get('CUSTOMER_ENV', 'development') == 'development'
if not DEVELOPMENT and not os.environ.get('CUSTOMER_SECRET_KEY'):
    raise RuntimeError('CUSTOMER_SECRET_KEY is required outside isolated development.')
key_path = STATE / 'django-secret.txt'
if DEVELOPMENT and not key_path.exists():
    try:
        with key_path.open('x') as key_file:
            key_file.write(get_random_secret_key())
    except FileExistsError:
        pass
SECRET_KEY = os.environ.get('CUSTOMER_SECRET_KEY') or key_path.read_text()
DEBUG = False
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver'] if DEVELOPMENT else os.environ.get('CUSTOMER_ALLOWED_HOSTS', '').split(',')
FRONTEND_URL = 'http://localhost:5173' if DEVELOPMENT else os.environ.get('CUSTOMER_FRONTEND_URL', '')
if not DEVELOPMENT and not FRONTEND_URL.startswith('https://'):
    raise RuntimeError('Set an HTTPS CUSTOMER_FRONTEND_URL before deployment.')
ROOT_URLCONF = 'customer_site.urls'
INSTALLED_APPS = ['django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions', 'customer_site']
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'customer_site.middleware.CustomerSessionSecurity',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': os.environ.get('CUSTOMER_DATABASE', str(STATE / 'customers.sqlite3')), 'OPTIONS': {'timeout': 20}}}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
PASSWORD_HASHERS = ['django.contrib.auth.hashers.Argon2PasswordHasher', 'django.contrib.auth.hashers.PBKDF2PasswordHasher']
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 12}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
SESSION_COOKIE_NAME = 'pops_customer_session'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = not DEVELOPMENT
SESSION_COOKIE_AGE = 60 * 60 * 12
CSRF_COOKIE_NAME = 'pops_customer_csrf'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = not DEVELOPMENT
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'] if DEVELOPMENT else [FRONTEND_URL]
CSRF_FAILURE_VIEW = 'customer_site.views.csrf_failure'
SECURE_SSL_REDIRECT = not DEVELOPMENT
SECURE_HSTS_SECONDS = 0 if DEVELOPMENT else 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEVELOPMENT
SECURE_HSTS_PRELOAD = False
SECURE_CONTENT_TYPE_NOSNIFF = True
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend' if DEVELOPMENT else 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_FILE_PATH = STATE / 'mail'
EMAIL_HOST = os.environ.get('CUSTOMER_EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('CUSTOMER_EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('CUSTOMER_EMAIL_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('CUSTOMER_EMAIL_PASSWORD', '')
EMAIL_USE_TLS = not DEVELOPMENT
EMAIL_TIMEOUT = 10
DEFAULT_FROM_EMAIL = os.environ.get('CUSTOMER_FROM_EMAIL', 'POPS local preview <noreply@localhost>')
if not DEVELOPMENT and (not EMAIL_HOST or not os.environ.get('CUSTOMER_FROM_EMAIL')):
    raise RuntimeError('Configure verified email delivery before deployment.')
PASSWORD_RESET_TIMEOUT = 3600
DATA_UPLOAD_MAX_MEMORY_SIZE = 16_384
USE_TZ = True
TIME_ZONE = 'UTC'
