# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification, PushDevice, NotificationPreference
from .messaging_models import Conversation, Message
from apps.accounts.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'type', 'title', 'message', 'data', 
                  'is_read', 'read_at', 'action_url', 'action_label',
                  'created_at')
        read_only_fields = ('id', 'user', 'created_at', 'read_at')

class PushDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushDevice
        fields = ('id', 'platform', 'device_token', 'device_name', 
                  'is_active', 'last_active', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ('id', 'email_match', 'email_message', 'email_system', 
                  'email_training', 'email_payment', 'email_marketplace',
                  'push_match', 'push_message', 'push_system',
                  'push_training', 'push_payment', 'push_marketplace',
                  'inapp_match', 'inapp_message', 'inapp_system',
                  'inapp_training', 'inapp_payment', 'inapp_marketplace')
        read_only_fields = ('id', 'user')

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'sender_name', 'sender_email',
                  'content', 'attachment_url', 'attachment_type', 
                  'is_read', 'read_at', 'status', 'created_at')
        read_only_fields = ('id', 'sender', 'created_at', 'read_at', 'status')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'match', 'last_message', 
                  'unread_count', 'last_message_at', 'created_at')
        read_only_fields = ('id', 'created_at', 'last_message_at')
    
    def get_last_message(self, obj):
        last_msg = obj.get_last_message()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count(request.user)
        return 0

class ConversationDetailSerializer(ConversationSerializer):
    messages = serializers.SerializerMethodField()
    
    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ('messages',)
    
    def get_messages(self, obj):
        messages = obj.messages.all().order_by('created_at')
        return MessageSerializer(messages, many=True).data