# sbi_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from apps.accounts.views import health_check

# Welcome/root endpoint
def welcome(request):
    return JsonResponse({
        'message': 'Welcome to NEXUS4IR Backend API',
        'version': 'v1',
        'status': 'running',
        'endpoints': {
            'health': '/api/health/',
            'admin': '/admin/',
            'docs': '/api/docs/',
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'refresh': '/api/auth/refresh/',
                'profile': '/api/auth/profile/',
                'update_profile': '/api/auth/profile/update/',
            },
            'sme': {
                'profile': '/api/sme/profile/',
                'update': '/api/sme/profile/update/',
                'readiness': '/api/sme/readiness-score/',
                'matches': '/api/sme/matches/',
                'documents': '/api/sme/documents/',
            },
            'investor': {
                'profile': '/api/investor/profile/',
                'update': '/api/investor/profile/update/',
                'portfolio': '/api/investor/portfolio/',
                'matches': '/api/investor/matches/',
                'impact': '/api/investor/impact-metrics/',
            },
            'matching': {
                'matches': '/api/matching/',
                'suggestions': '/api/matching/suggestions/',
                'accept': '/api/matching/accept/<id>/',
                'reject': '/api/matching/reject/<id>/',
                'connect': '/api/matching/connect/<id>/',
                'preferences': '/api/matching/preferences/',
                'stats': '/api/matching/stats/',
            },
            'training': {
                'courses': '/api/training/courses/',
                'enroll': '/api/training/courses/<id>/enroll/',
                'progress': '/api/training/courses/<id>/progress/',
                'quiz': '/api/training/quiz/submit/',
                'certificate': '/api/training/certificate/<course_id>/',
            },
            'payment': {
                'subscriptions': '/api/payment/subscriptions/',
                'current': '/api/payment/subscriptions/current/',
                'create_intent': '/api/payment/create-intent/',
                'confirm': '/api/payment/confirm/',
                'history': '/api/payment/history/',
                'methods': '/api/payment/methods/',
            },
            'marketplace': {
                'resources': '/api/marketplace/resources/',
                'my_resources': '/api/marketplace/resources/my/',
                'categories': '/api/marketplace/categories/',
                'saved': '/api/marketplace/saved/',
                'trade_requests': '/api/marketplace/trade-requests/',
                'stats': '/api/marketplace/resources/stats/',
                'recommendations': '/api/marketplace/resources/recommendations/',
            },
        }
    })

# API welcome
def api_welcome(request):
    return JsonResponse({
        'message': 'NEXUS4IR API v1',
        'version': 'v1',
        'status': 'running',
        'endpoints': {
            'health': '/api/health/',
            'auth': '/api/auth/',
            'sme': '/api/sme/',
            'investor': '/api/investor/',
            'matching': '/api/matching/',
            'training': '/api/training/',
            'payment': '/api/payment/',
            'marketplace': '/api/marketplace/',
        }
    })

urlpatterns = [
    # Root endpoints
    path('', welcome, name='welcome'),
    path('api/', api_welcome, name='api_welcome'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Health Check
    path('api/health/', health_check, name='health_check'),
    
    # App URLs - All under /api/
    path('api/auth/', include('apps.accounts.urls')),
    path('api/sme/', include('apps.sme.urls')),
    path('api/investor/', include('apps.investor.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/training/', include('apps.training.urls')),
    path('api/payment/', include('apps.payments.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)