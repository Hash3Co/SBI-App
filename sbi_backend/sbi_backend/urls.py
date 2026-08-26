# sbi_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.accounts.views import health_check

# Swagger Schema
schema_view = get_schema_view(
    openapi.Info(
        title="NEXUS4IR API",
        default_version='v1',
        description="NEXUS4IR Backend API",
        contact=openapi.Contact(email="support@nexus4ir.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health Check
    path('api/health/', health_check, name='health_check'),
    
    # API Routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/sme/', include('apps.sme.urls')),
    path('api/investor/', include('apps.investor.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/training/', include('apps.training.urls')),
    path('api/payment/', include('apps.payments.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)