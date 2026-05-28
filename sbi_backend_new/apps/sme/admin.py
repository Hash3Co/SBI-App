from django.contrib import admin
from .models import SMEProfile, SMEDocument, SMEActivityLog

@admin.register(SMEProfile)
class SMEProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'industry', 'location', 'readiness_score', 'verification_status', 'created_at')
    list_filter = ('industry', 'verification_status', 'employee_count', 'created_at')
    search_fields = ('business_name', 'user__email', 'registration_number', 'location')
    readonly_fields = ('id', 'readiness_score', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Business Information', {
            'fields': ('user', 'business_name', 'registration_number', 'industry', 'sub_industry')
        }),
        ('Location', {
            'fields': ('location', 'city', 'country', 'region')
        }),
        ('Business Details', {
            'fields': ('description', 'founded_year', 'employee_count')
        }),
        ('Financial Information', {
            'fields': ('funding_needed', 'funding_purpose', 'annual_revenue', 'profit_margin')
        }),
        ('Readiness', {
            'fields': ('readiness_score', 'readiness_details')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verified_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['verify_smes', 'reject_smes', 'recalculate_readiness']
    
    def verify_smes(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(verification_status='verified', verified_at=timezone.now())
        self.message_user(request, f'{updated} SMEs verified.')
    verify_smes.short_description = "Verify selected SMEs"
    
    def reject_smes(self, request, queryset):
        updated = queryset.update(verification_status='rejected')
        self.message_user(request, f'{updated} SMEs rejected.')
    reject_smes.short_description = "Reject selected SMEs"
    
    def recalculate_readiness(self, request, queryset):
        from .services import calculate_readiness_score
        for sme in queryset:
            score_data = calculate_readiness_score(sme)
            sme.readiness_score = score_data['overall_score']
            sme.readiness_details = score_data
            sme.save()
        self.message_user(request, f'{queryset.count()} readiness scores recalculated.')
    recalculate_readiness.short_description = "Recalculate readiness scores"


@admin.register(SMEDocument)
class SMEDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'sme', 'document_type', 'file_size', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('title', 'sme__business_name')
    readonly_fields = ('id', 'file_size', 'file_type', 'uploaded_at')
    
    actions = ['verify_documents']
    
    def verify_documents(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} documents verified.')
    verify_documents.short_description = "Verify selected documents"


@admin.register(SMEActivityLog)
class SMEActivityLogAdmin(admin.ModelAdmin):
    list_display = ('sme', 'action', 'created_at', 'ip_address')
    list_filter = ('action', 'created_at')
    search_fields = ('sme__business_name', 'action')
    readonly_fields = ('sme', 'action', 'details', 'ip_address', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False