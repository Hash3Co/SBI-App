# apps/investor/admin.py
from django.contrib import admin
from .models import InvestorProfile, Investment, InvestorActivityLog

@admin.register(InvestorProfile)
class InvestorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'user', 'company_name', 'verification_status', 'portfolio_value')
    list_filter = ('verification_status',)
    search_fields = ('full_name', 'company_name', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'portfolio_value')

    
@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'investor', 'sme', 'amount', 'equity', 'status', 'date')
    list_filter = ('status', 'date')
    search_fields = ('investor__email', 'sme__email', 'investor__full_name', 'sme__full_name')
    readonly_fields = ('id', 'date', 'created_at', 'updated_at')

@admin.register(InvestorActivityLog)
class InvestorActivityLogAdmin(admin.ModelAdmin):
    list_display = ('investor', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('investor__email', 'investor__full_name')
    readonly_fields = ('id', 'investor', 'action', 'details', 'ip_address', 'user_agent', 'created_at')