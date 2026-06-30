from django.contrib import admin
from .models import MarketplaceResource, TradeRequest

@admin.register(MarketplaceResource)
class MarketplaceResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource_type', 'country', 'price', 'seller', 'is_available', 'created_at')
    list_filter = ('resource_type', 'country', 'is_available', 'created_at')
    search_fields = ('title', 'description', 'seller', 'seller_email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Resource Details', {
            'fields': ('title', 'resource_type', 'description')
        }),
        ('Location', {
            'fields': ('country', 'city')
        }),
        ('Pricing & Seller', {
            'fields': ('price', 'seller', 'seller_email', 'seller_phone')
        }),
        ('Media', {
            'fields': ('images',)
        }),
        ('Status', {
            'fields': ('is_available',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['mark_available', 'mark_unavailable']
    
    def mark_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} resources marked as available.')
    mark_available.short_description = "Mark as available"
    
    def mark_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} resources marked as unavailable.')
    mark_unavailable.short_description = "Mark as unavailable"


@admin.register(TradeRequest)
class TradeRequestAdmin(admin.ModelAdmin):
    list_display = ('resource', 'requester', 'proposed_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('resource__title', 'requester__email', 'message')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    actions = ['accept_requests', 'reject_requests']
    
    def accept_requests(self, request, queryset):
        updated = queryset.update(status='accepted')
        self.message_user(request, f'{updated} trade requests accepted.')
    accept_requests.short_description = "Accept selected requests"
    
    def reject_requests(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} trade requests rejected.')
    reject_requests.short_description = "Reject selected requests"