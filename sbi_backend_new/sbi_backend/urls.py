"""
URL configuration for sbi_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions


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

urlpatterns = [
    # Home
    path('', home),
    
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
