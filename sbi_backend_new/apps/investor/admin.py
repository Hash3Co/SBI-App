from django.contrib import admin
from .models import InvestorProfile, Investment
from django.db.models import Count

@admin.register(InvestorProfile)
class InvestorProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company_name', 'user', 'location', 'portfolio_value', 'active_investments', 'verification_status')
    list_filter = ('verification_status', 'country', 'created_at')
    search_fields = ('full_name', 'company_name', 'user__email', 'location')
    readonly_fields = ('id', 'portfolio_value', 'total_invested', 'active_investments', 'jobs_created', 'smes_supported', 'co2_reduced', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'full_name', 'company_name')
        }),
        ('Location', {
            'fields': ('location', 'city', 'country')
        }),
        ('Investment Preferences', {
            'fields': ('investment_interests', 'preferred_industries', 'funding_range_min', 'funding_range_max')
        }),
        ('Portfolio', {
            'fields': ('portfolio_value', 'total_invested', 'active_investments')
        }),
        ('Impact Metrics', {
            'fields': ('jobs_created', 'smes_supported', 'co2_reduced')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verified_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['verify_investors', 'recalculate_impact']
    
    def verify_investors(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(verification_status='verified', verified_at=timezone.now())
        self.message_user(request, f'{updated} investors verified.')
    verify_investors.short_description = "Verify selected investors"
    
    def recalculate_impact(self, request, queryset):
        from django.db.models import Sum
        for investor in queryset:
            investments = Investment.objects.filter(investor=investor, status='completed')
            stats = investments.aggregate(
                total=Sum('amount'),
                jobs=Sum('sme__jobs_created'),
                smes=Count('id')
            )
            investor.total_invested = stats['total'] or 0
            investor.jobs_created = stats['jobs'] or 0
            investor.smes_supported = stats['smes'] or 0
            investor.save()
        self.message_user(request, f'{queryset.count()} impact metrics recalculated.')
    recalculate_impact.short_description = "Recalculate impact metrics"


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('investor', 'sme', 'amount', 'status', 'investment_date', 'roi_percentage')
    list_filter = ('status', 'investment_date', 'created_at')
    search_fields = ('investor__full_name', 'sme__business_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Parties', {
            'fields': ('investor', 'sme')
        }),
        ('Investment Details', {
            'fields': ('amount', 'equity_percentage', 'status', 'investment_date', 'completed_at')
        }),
        ('Performance', {
            'fields': ('current_value', 'roi_percentage')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )