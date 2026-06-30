# sbi_backend/settings.py
import os
from pathlib import Path
from decouple import config
from datetime import timedelta
from celery.schedules import crontab
import dj_database_url
from dotenv import load_dotenv

APPEND_SLASH = True

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

ROOT_URLCONF = 'sbi_backend.urls'

# ============ ENVIRONMENT CONFIGURATION ============
ENVIRONMENT = config('ENVIRONMENT', default='development')

# SECURITY
SECRET_KEY = config('SECRET_KEY', default='django-insecure-test-key-change-in-production-12345678901234567890')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='127.0.0.1,localhost,*.onrender.com,192.168.56.1,192.168.43.224'
).split(',')

# ============ DATABASE CONFIGURATION - SUPABASE ONLY ============
# Primary database connection using DATABASE_URL
DATABASE_URL = config('DATABASE_URL', default='')

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Please set it to your Supabase PostgreSQL connection string."
    )

# Configure default database
DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=600,
        ssl_require=True,
        engine='django.db.backends.postgresql'
    )
}

# Since we're using a single Supabase database, all shards point to the same DB
# This maintains compatibility with existing sharding code
DATABASES['shard_southern_africa'] = DATABASES['default'].copy()
DATABASES['shard_africa_other'] = DATABASES['default'].copy()

print(f"\n{'='*50}")
print(f"✅ Connected to Supabase PostgreSQL")
print(f"   Host: {DATABASES['default']['HOST']}")
print(f"   Database: {DATABASES['default']['NAME']}")
print(f"   Environment: {ENVIRONMENT}")
print(f"{'='*50}\n")

# ============ SHARD CONFIGURATION ============
# Keep the shard configuration for compatibility
# All shards now point to the same Supabase database
SHARD_REGIONS = {
    'lesotho': 'shard_southern_africa',
    'south africa': 'shard_southern_africa',
    'za': 'shard_southern_africa',
    'ls': 'shard_southern_africa',
    'default': 'default',
}

# Database Router for Sharding
DATABASE_ROUTERS = ['sbi_backend.database_router.ShardRouter']

# ============ CELERY CONFIGURATION ============
# Use Redis for production, memory for development
if ENVIRONMENT == 'production':
    CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
else:
    CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='memory://')
    CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='cache+memory://')

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Maseru'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULE = {
    'update-daily-metrics': {
        'task': 'sbi_backend.celery.update_daily_metrics',
        'schedule': crontab(hour=0, minute=0),
    },
    'generate-weekly-report': {
        'task': 'sbi_backend.celery.generate_weekly_report',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
    'generate-monthly-report': {
        'task': 'sbi_backend.celery.generate_monthly_report',
        'schedule': crontab(hour=10, minute=0, day_of_month=1),
    },
    'cleanup-old-activities': {
        'task': 'sbi_backend.celery.cleanup_old_activities',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),
    },
}

# ============ INSTALLED APPS ============
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    'drf_yasg',
    'django_filters',
    'storages',
    'django_extensions',
    
    # Celery
    'django_celery_beat',
    'django_celery_results',
    
    # OAuth
    'oauth2_provider',
    
    # Custom apps
    'apps.accounts',
    'apps.sme',
    'apps.investor',
    'apps.matching',
    'apps.training',
    'apps.payments',
    'apps.marketplace',
    'apps.analytics',
]

# ============ MIDDLEWARE ============
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ============ CORS ============
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:8000').split(',')
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

# ============ REST FRAMEWORK ============
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
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
    },
}

# ============ PASSWORD VALIDATION ============
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# ============ JWT SETTINGS ============
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

# ============ CSRF SETTINGS ============
CSRF_COOKIE_SECURE = False if DEBUG else True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ============ CACHING ============
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'sbi-cache',
    }
}

# ============ SESSION SETTINGS ============
SESSION_COOKIE_SECURE = False if DEBUG else True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# ============ DATA UPLOAD SETTINGS ============
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
DATA_UPLOAD_MAX_NUMBER_FILES = 10
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# ============ OAUTH2 ============
OAUTH2_PROVIDER = {
    'SCOPES': {
        'read': 'Read access',
        'write': 'Write access',
        'admin': 'Admin access',
    },
    'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,
    'REFRESH_TOKEN_EXPIRE_SECONDS': 86400 * 7,
}

# ============ STORAGE ============
if ENVIRONMENT == 'production':
    # Production: Use S3 or Supabase Storage
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='sbi-media')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='af-south-1')
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
else:
    # Development: Use local storage
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# ============ STRIPE ============
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# ============ SECURITY HEADERS ============
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 0 if DEBUG else 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = False if DEBUG else True
SECURE_HSTS_PRELOAD = False if DEBUG else True
SECURE_SSL_REDIRECT = False if DEBUG else True

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
            ],
        },
    },
]

# ============ STATIC & MEDIA ============
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ============ LOGGING ============
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'security': {
            'format': '[SECURITY] {asctime} {levelname} {message}',
            'style': '{',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if DEBUG else 'simple',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'security.log'),
            'formatter': 'security',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG' if DEBUG else 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING' if DEBUG else 'ERROR',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'ERROR',
            'propagate': False,
        },
    },
}

# ============ EMAIL ============
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@sbiapp.com')
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# ============ INTERNATIONALIZATION ============
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Maseru'
USE_I18N = True
USE_TZ = True

# ============ WSGI ============
WSGI_APPLICATION = 'sbi_backend.wsgi.application'

# ============ DEFAULT PRIMARY KEY ============
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============ SUPABASE CONFIGURATION ============
SUPABASE_URL = config('SUPABASE_URL', default='')
SUPABASE_KEY = config('SUPABASE_KEY', default='')
SUPABASE_SERVICE_KEY = config('SUPABASE_SERVICE_KEY', default='')

# Debug - print ALLOWED_HOSTS
print(f"🔍 ALLOWED_HOSTS = {ALLOWED_HOSTS}")