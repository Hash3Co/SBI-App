from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from django.views.generic import RedirectView


# API Documentation (Swagger)
schema_view = get_schema_view(
    openapi.Info(
        title="SBI Backend API",
        default_version='v1',
        description="Small Business Investment Platform API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def health(request):
    return JsonResponse({'status': 'ok'})

def home(request):
    return JsonResponse({
        "status": "success",
        "message": "SBI Backend API Running"
    })

# ADD THIS FUNCTION
def api_root(request):
    return JsonResponse({
        "status": "success",
        "message": "SBI Backend API",
        "version": "v1",
        "endpoints": {
            "docs": "/api/docs/",
            "redoc": "/api/redoc/",
            "health": "/api/health/",
            "auth": "/api/auth/",
            "sme": "/api/sme/",
            "investor": "/api/investor/",
            "matching": "/api/matching/",
            "training": "/api/training/",
            "payment": "/api/payment/",
            "marketplace": "/api/marketplace/",
            "analytics": "/api/analytics/"
        }
    })

urlpatterns = [
    # Home
    path('', home),
    
    # ADD THIS LINE - API Root
    path('api/', api_root, name='api-root'),
    
    # Admin
    path('admin/', admin.site.urls),
        
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Health check
    path('api/health/', health, name='health'),

    # App Routes - Following frontend API_ENDPOINTS structure
    path('api/auth/', include('apps.accounts.urls')),
    path('api/sme/', include('apps.sme.urls')),
    path('api/investor/', include('apps.investor.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/training/', include('apps.training.urls')),
    path('api/payment/', include('apps.payments.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]