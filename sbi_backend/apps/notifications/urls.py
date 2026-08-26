# apps/notifications/urls.py
from django.urls import path
from .views import (
    # Notifications
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    UnreadCountView,
    
    # Push Devices
    PushDeviceRegisterView,
    PushDeviceListView,
    PushDeviceDeleteView,
    
    # Preferences
    NotificationPreferencesView,
    
    # Messaging
    ConversationListView,
    ConversationDetailView,
    MessageListView,
    MessageMarkReadView,
    ConversationMarkReadView,
    UnreadMessagesCountView,
)

urlpatterns = [
    # Notifications
    path('', NotificationListView.as_view(), name='notifications'),
    path('unread-count/', UnreadCountView.as_view(), name='unread_count'),
    path('<uuid:id>/read/', NotificationMarkReadView.as_view(), name='mark_read'),
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='mark_all_read'),
    
    # Push Devices
    path('devices/register/', PushDeviceRegisterView.as_view(), name='register_device'),
    path('devices/', PushDeviceListView.as_view(), name='devices'),
    path('devices/<uuid:id>/', PushDeviceDeleteView.as_view(), name='delete_device'),
    
    # Preferences
    path('preferences/', NotificationPreferencesView.as_view(), name='preferences'),
    
    # Messaging
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<uuid:id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<uuid:id>/mark-read/', ConversationMarkReadView.as_view(), name='conversation_mark_read'),
    path('messages/', MessageListView.as_view(), name='messages'),
    path('messages/unread-count/', UnreadMessagesCountView.as_view(), name='unread_messages_count'),
    path('messages/<uuid:id>/read/', MessageMarkReadView.as_view(), name='mark_message_read'),
]