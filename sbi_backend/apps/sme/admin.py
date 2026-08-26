# apps/sme/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import SMEProfile, SMEOnboarding, SMEDocument, SMEActivityLog

@admin.register(SMEProfile)
class SMEProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'business_name', 'user', 'industry', 'location', 'verification_status', 'readiness_score')
    list_filter = ('industry', 'verification_status', 'location')
    search_fields = ('business_name', 'user__email', 'user__full_name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at', 'readiness_score')
    
    fieldsets = (
        ('Business Information', {
            'fields': ('user', 'business_name', 'industry', 'location', 'description')
        }),
        ('Financial Information', {
            'fields': ('founded_year', 'employee_count', 'funding_needed', 'funding_purpose')
        }),
        ('Status & Score', {
            'fields': ('verification_status', 'readiness_score')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(SMEOnboarding)
class SMEOnboardingAdmin(admin.ModelAdmin):
    list_display = ('sme', 'step', 'completed', 'completed_at')
    list_filter = ('step', 'completed')
    search_fields = ('sme__email', 'sme__full_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(SMEDocument)
class SMEDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'sme', 'document_type', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('name', 'sme__email', 'sme__business_name')
    readonly_fields = ('id', 'uploaded_at')

@admin.register(SMEActivityLog)
class SMEActivityLogAdmin(admin.ModelAdmin):
    list_display = ('sme', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('sme__email', 'sme__full_name')
    readonly_fields = ('id', 'sme', 'action', 'details', 'ip_address', 'user_agent', 'created_at')