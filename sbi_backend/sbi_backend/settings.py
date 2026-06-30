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

# ============ ENVIRONMENT ============
ENVIRONMENT = config('ENVIRONMENT', default='development')
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='127.0.0.1,localhost,*.onrender.com,192.168.56.1,192.168.43.224'
).split(',')

# ============ SUPABASE CONFIGURATION ============
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_PUBLISHABLE_KEY = config('SUPABASE_PUBLISHABLE_KEY')
SUPABASE_SECRET_KEY = config('SUPABASE_SECRET_KEY')
SUPABASE_JWKS_URL = config('SUPABASE_JWKS_URL')

# ============ DATABASE - SUPABASE ============
# Try DATABASE_URL first
DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    # Use DATABASE_URL
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    # Use individual parameters
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='postgres'),
            'USER': config('DB_USER', default='postgres.irjrjnnbygdwbtjqrjwh'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST': config('DB_HOST', default='aws-0-eu-west-3.pooler.supabase.com'),
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
print(f"✅ Connected to Supabase")
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

# ============ CELERY ============
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

# ============ AUTHENTICATION ============
AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ============ SECURITY ============
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

# ============ SESSION ============
SESSION_COOKIE_SECURE = False if DEBUG else True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

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
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG' if DEBUG else 'INFO',
    },
}

# ============ EMAIL ============
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@sbiapp.com')
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')

# ============ INTERNATIONALIZATION ============
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Maseru'
USE_I18N = True
USE_TZ = True

# ============ WSGI ============
WSGI_APPLICATION = 'sbi_backend.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

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

# ============ STRIPE CONFIGURATION ============
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# If you want to make it optional for development
if not STRIPE_SECRET_KEY:
    print("⚠️  WARNING: STRIPE_SECRET_KEY not set. Stripe features will not work.")

# Debug - print ALLOWED_HOSTS
print(f"🔍 ALLOWED_HOSTS = {ALLOWED_HOSTS}")