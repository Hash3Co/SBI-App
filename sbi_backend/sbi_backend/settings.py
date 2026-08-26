# sbi_backend/settings.py
import os
from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv
import logging

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_URLCONF = 'sbi_backend.urls'

# ============ ENVIRONMENT ============
ENVIRONMENT = config('ENVIRONMENT', default='development')
SECRET_KEY = config('SECRET_KEY')
DEBUG = os.getenv("DEBUG", "False") == "True"

# ============ SECURE ALLOWED HOSTS ============
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='127.0.0.1,localhost,*.onrender.com,*.render.com'
).split(',')

# ============ SUPABASE CONFIGURATION ============
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_PUBLISHABLE_KEY = config('SUPABASE_PUBLISHABLE_KEY')
SUPABASE_SECRET_KEY = config('SUPABASE_SECRET_KEY')
SUPABASE_JWKS_URL = config('SUPABASE_JWKS_URL')

# ============ DATABASE - SUPABASE ============

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='postgres'),
        'USER': config('DB_USER', default='postgres.irjrjnnbygdwbtjqrjwh'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config(
            'DB_HOST',
            default='aws-0-eu-west-3.pooler.supabase.com'
        ),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
        'CONN_MAX_AGE': 600,
    }
}

# Shards for compatibility (all point to same Supabase DB)
DATABASES['shard_southern_africa'] = DATABASES['default'].copy()
DATABASES['shard_africa_other'] = DATABASES['default'].copy()

print(f"\n{'='*50}")
print("Connected to Supabase")
print(f"   URL: {SUPABASE_URL}")
print(f"   Host: {DATABASES['default']['HOST']}")
print(f"   Database: {DATABASES['default']['NAME']}")
print(f"   Environment: {ENVIRONMENT.upper()}")
print(f"{'='*50}\n")

# ============ SHARD CONFIGURATION ============
SHARD_REGIONS = {
    'lesotho': 'shard_southern_africa',
    'south africa': 'shard_southern_africa',
    'za': 'shard_southern_africa',
    'ls': 'shard_southern_africa',
    'default': 'default',
}

DATABASE_ROUTERS = ['sbi_backend.database_router.ShardRouter']


# ============ SECURITY MIDDLEWARE ============
MIDDLEWARE = [
    # Security first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    
    # CORS
    'corsheaders.middleware.CorsMiddleware',
    
    # Session & Auth
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Security
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.http.ConditionalGetMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    
    
    # Axes for login protection
    'axes.middleware.AxesMiddleware',
    
    # OTP
    'django_otp.middleware.OTPMiddleware',
    
    # User Agent
    'django_user_agents.middleware.UserAgentMiddleware',
    
    # Security Headers
    'django.middleware.security.SecurityMiddleware',
]

RATELIMIT_VIEW = 'django_ratelimit.decorators.ratelimit'

# ============ INSTALLED APPS ============
INSTALLED_APPS = [
    # Admin Interface
    'admin_interface',
    'colorfield',
    'import_export',
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    
    # Security Apps
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
    'axes',
    'django_bleach',
    
    # Third Party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_yasg',
    'django_filters',
    'django_extensions',
    'django_user_agents',
    
    # Custom Apps
    'apps.accounts',
    'apps.sme',
    'apps.investor',
    'apps.matching',
    'apps.training',
    'apps.payments',
    'apps.marketplace',
    'apps.notifications',
]

# ============ CORS SECURITY ============
CORS_ALLOWED_ORIGINS = [
    'https://sbi-app.onrender.com',
    'https://nexus4ir.onrender.com',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:19000',
    'exp://192.168.1.100:19000',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-device-fingerprint',
    'x-request-id',
    'x-timestamp',
    'x-app-version',
    'x-platform',
]
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_PREFLIGHT_MAX_AGE = 86400

# ============ CSRF SECURITY ============
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False
CSRF_FAILURE_VIEW = 'django.views.csrf.csrf_failure'

# ============ SESSION SECURITY ============
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 86400  # 24 hours

# ============ SECURITY HEADERS ============
SECURE_SSL_REDIRECT = not DEBUG
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

X_FRAME_OPTIONS = 'DENY'
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'login': '5/minute',
        'register': '3/hour',
        'reset_password': '3/hour',
        'verify_email': '10/hour',
    },
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),
    #'EXCEPTION_HANDLER': 'apps.accounts.exceptions.custom_exception_handler',
}

# ============ JWT SECURITY ============
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# ============ AXES - BRUTE FORCE PROTECTION ============
AXES_ENABLED = True

# Lock account/IP after failed attempts
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1  # 1 hour

AXES_LOCK_OUT_AT_FAILURE = True
AXES_LOCK_OUT_BY_IP = True
AXES_LOCK_OUT_BY_USER = True
# Reset failed-attempt counter after successful login
AXES_RESET_ON_SUCCESS = True

# Development whitelist
AXES_WHITELIST = ['127.0.0.1', '::1']
AXES_BLACKLIST = []

# Use Django cache
AXES_CACHE = 'default'

# ============ OTP - TWO FACTOR AUTH ============
OTP_TOTP_ISSUER = 'NEXUS4IR'
OTP_TOTP_DIGITS = 6
OTP_TOTP_INTERVAL = 30
OTP_TOTP_DRIFT = 1

# ============ AUTHENTICATION BACKENDS ============
AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ============ PASSWORD VALIDATION - STRONG ============
AUTH_PASSWORD_VALIDATORS = [
    
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 7}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    
]

# ============ BLEACH - HTML SANITIZATION ============
BLEACH_ALLOWED_TAGS = ['p', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br']
BLEACH_ALLOWED_ATTRIBUTES = ['href', 'title', 'target']
BLEACH_ALLOWED_STYLES = []
BLEACH_STRIP_TAGS = True
BLEACH_STRIP_COMMENTS = True

# ============ LOGGING - SECURE ============
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'secure': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'secure',
        },
        'security': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'security.log'),
            'formatter': 'secure',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.security': {
            'handlers': ['security'],
            'level': 'WARNING',
            'propagate': False,
        },
        'axes': {
            'handlers': ['security'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps.accounts': {
            'handlers': ['console', 'security'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# ============ CACHING ============
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'sbi-cache',
    }
}

# ============ TEMPLATES ============
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'sbi_backend.context_processors.admin_dashboard_stats',
            ],
        },
    },
]

# ============ STATIC & MEDIA ============
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload security
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# ============ INTERNATIONALIZATION ============
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Maseru'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# ============ WSGI ============
WSGI_APPLICATION = 'sbi_backend.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============ EMAIL SECURITY ============
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@nexus4ir.com')
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# ============ STRIPE ============
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# ============ CSP HEADERS ============
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'", "https:", "data:")
CSP_CONNECT_SRC = ("'self'", "https://*.onrender.com")

# ============ SILK PROFILING (Development Only) ============
if DEBUG:
    INSTALLED_APPS.append('silk')
    MIDDLEWARE.insert(0, 'silk.middleware.SilkyMiddleware')
    SILKY_PYTHON_PROFILER = True
    SILKY_PYTHON_PROFILER_BINARY = True
    SILKY_MAX_REQUEST_BODY_SIZE = 1024
    SILKY_MAX_RESPONSE_BODY_SIZE = 1024
    SILKY_META = True

print(f"\n{'='*60}")
print(f"Environment: {ENVIRONMENT.upper()}")
print(f"Debug Mode: {DEBUG}")
print(f"Database: {DATABASES['default']['HOST']}")
print(f"Database Type: PostgreSQL")
print(f"Security: {'Enabled' if not DEBUG else 'Limited (Dev Mode)'}")
print(f"{'='*60}\n")