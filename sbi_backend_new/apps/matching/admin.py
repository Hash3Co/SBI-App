from django.contrib import admin
from .models import Match, MatchMessage, MatchingQueue


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('sme', 'investor', 'match_score', 'status', 'created_at')
    list_filter = ('status', 'match_score', 'created_at')
    search_fields = ('sme__business_name', 'investor__full_name')
    readonly_fields = ('id', 'match_reasoning', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Parties', {
            'fields': ('sme', 'investor')
        }),
        ('Match Details', {
            'fields': ('match_score', 'match_reasoning', 'status')
        }),
        ('Communication', {
            'fields': ('last_message_at', 'messages_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['accept_matches', 'reject_matches']
    
    def accept_matches(self, request, queryset):
        updated = queryset.update(status='accepted')
        self.message_user(request, f'{updated} matches accepted.')
    accept_matches.short_description = "Accept selected matches"
    
    def reject_matches(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} matches rejected.')
    reject_matches.short_description = "Reject selected matches"


@admin.register(MatchMessage)
class MatchMessageAdmin(admin.ModelAdmin):
    list_display = ('match', 'sender', 'message_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('match__sme__business_name', 'match__investor__full_name', 'message')
    readonly_fields = ('id', 'created_at')
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'


@admin.register(MatchingQueue)
class MatchingQueueAdmin(admin.ModelAdmin):
    list_display = ('entity_type', 'entity_id', 'status', 'created_at', 'processed_at')
    list_filter = ('entity_type', 'status', 'created_at')
    readonly_fields = ('id', 'entity_type', 'entity_id', 'created_at', 'processed_at')
    
    actions = ['process_queue']
    
    def process_queue(self, request, queryset):
        from .tasks import process_match_queue
        process_match_queue.delay()
        self.message_user(request, 'Matching queue processing started.')
    process_queue.short_description = "Process selected queue items"