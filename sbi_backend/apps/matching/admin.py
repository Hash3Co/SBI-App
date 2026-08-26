# apps/matching/admin.py
from django.contrib import admin
from .models import Match, MatchPreference, MatchMessage, MatchingQueue

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'sme', 'investor', 'match_score', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sme__email', 'sme__full_name', 'investor__email', 'investor__full_name')
    readonly_fields = ('id', 'match_score', 'match_breakdown', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Match Information', {
            'fields': ('sme', 'investor', 'match_score', 'match_breakdown', 'status')
        }),
        ('Connection', {
            'fields': ('connected_at',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(MatchPreference)
class MatchPreferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'location', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__email', 'user__full_name', 'location')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(MatchMessage)
class MatchMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'match', 'sender', 'message_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('match__id', 'sender__email', 'message')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'

@admin.register(MatchingQueue)
class MatchingQueueAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'created_at', 'processed_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'user__full_name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'processed_at')