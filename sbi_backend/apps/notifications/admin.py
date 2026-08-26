# apps/notifications/admin.py
from django.contrib import admin
from .models import Notification, PushDevice, NotificationPreference
from .messaging_models import Conversation, Message

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__email', 'user__full_name', 'title', 'message')
    readonly_fields = ('id', 'created_at', 'updated_at', 'read_at')

@admin.register(PushDevice)
class PushDeviceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'platform', 'device_name', 'is_active', 'last_active')
    list_filter = ('platform', 'is_active')
    search_fields = ('user__email', 'device_token', 'device_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    search_fields = ('user__email', 'user__full_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'last_message_at', 'created_at')
    filter_horizontal = ('participants',)
    search_fields = ('participants__email',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_message_at')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'status', 'created_at')
    search_fields = ('sender__email', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at', 'read_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'