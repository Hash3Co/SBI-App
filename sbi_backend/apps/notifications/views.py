# apps/notifications/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from .models import Notification, PushDevice, NotificationPreference
from .models import Conversation, Message
from .serializers import (
    NotificationSerializer, PushDeviceSerializer,
    NotificationPreferenceSerializer,
    ConversationSerializer, ConversationDetailSerializer,
    MessageSerializer
)
from apps.accounts.models import UserActivity
import logging

logger = logging.getLogger(__name__)

# ============ NOTIFICATION VIEWS ============

class NotificationListView(generics.ListAPIView):
    """Get user's notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            return Notification.objects.filter(user=self.request.user).order_by('-created_at')
        except Exception as e:
            logger.error(f"Error in NotificationListView: {str(e)}")
            return Notification.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({
                    'notifications': serializer.data,
                    'unread_count': Notification.objects.filter(user=request.user, is_read=False).count()
                })
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'notifications': serializer.data,
                'unread_count': Notification.objects.filter(user=request.user, is_read=False).count()
            })
        except Exception as e:
            logger.error(f"Error in NotificationListView.list: {str(e)}")
            return Response({
                'notifications': [],
                'unread_count': 0
            })

class NotificationMarkReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            notification = Notification.objects.get(id=id, user=request.user)
            notification.mark_as_read()
            return Response({
                'message': 'Notification marked as read',
                'notification': NotificationSerializer(notification).data
            })
        except Notification.DoesNotExist:
            return Response({
                'error': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)

class NotificationMarkAllReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'message': f'{count} notifications marked as read',
            'count': count
        })

class UnreadCountView(APIView):
    """Get unread notification count"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            count = Notification.objects.filter(user=request.user, is_read=False).count()
            return Response({'count': count})
        except Exception as e:
            logger.error(f"Error in UnreadCountView: {str(e)}")
            return Response({'count': 0})
        
# ============ PUSH DEVICE VIEWS ============

class PushDeviceRegisterView(generics.CreateAPIView):
    """Register a push notification device"""
    serializer_class = PushDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PushDeviceListView(generics.ListAPIView):
    """Get user's push devices"""
    serializer_class = PushDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PushDevice.objects.filter(user=self.request.user, is_active=True)

class PushDeviceDeleteView(APIView):
    """Delete a push device"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, id):
        try:
            device = PushDevice.objects.get(id=id, user=request.user)
            device.is_active = False
            device.save()
            return Response({'message': 'Device removed'})
        except PushDevice.DoesNotExist:
            return Response({
                'error': 'Device not found'
            }, status=status.HTTP_404_NOT_FOUND)

# ============ NOTIFICATION PREFERENCES ============

class NotificationPreferencesView(generics.RetrieveUpdateAPIView):
    """Get and update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return NotificationPreference.get_or_create_default(self.request.user)

# ============ MESSAGING VIEWS ============

class ConversationListView(generics.ListCreateAPIView):
    """List user's conversations or create a new one"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).order_by('-last_message_at')
    
    def create(self, request, *args, **kwargs):
        # Get participants from request
        participant_ids = request.data.get('participants', [])
        if not participant_ids:
            return Response({
                'error': 'Participants are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add current user if not already included
        if str(request.user.id) not in participant_ids:
            participant_ids.append(str(request.user.id))
        
        # Check if conversation already exists
        existing = Conversation.objects.filter(participants__id__in=participant_ids).distinct()
        for conv in existing:
            if set(conv.participants.values_list('id', flat=True)) == set(participant_ids):
                return Response({
                    'message': 'Conversation already exists',
                    'conversation': ConversationSerializer(conv, context={'request': request}).data
                })
        
        # Create new conversation
        conversation = Conversation.objects.create()
        conversation.participants.set(participant_ids)
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            action='create_conversation',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            details={'conversation_id': str(conversation.id)}
        )
        
        return Response({
            'message': 'Conversation created',
            'conversation': ConversationSerializer(conversation, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

class ConversationDetailView(generics.RetrieveUpdateAPIView):
    """Get conversation details"""
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        conversation = self.get_object()
        # Mark all messages as read
        conversation.mark_all_read(request.user)
        return super().retrieve(request, *args, **kwargs)

class MessageListView(generics.ListCreateAPIView):
    """List messages in a conversation or send a new message"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id).order_by('created_at')
        return Message.objects.filter(sender=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation_id')
        if not conversation_id:
            raise serializers.ValidationError('conversation_id is required')
        
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if self.request.user not in conversation.participants.all():
                raise serializers.ValidationError('You are not a participant in this conversation')
            
            message = serializer.save(sender=self.request.user, conversation=conversation)
            
            # Update conversation last message time
            conversation.last_message_at = timezone.now()
            conversation.save()
            
            # Create notification for other participants
            for participant in conversation.participants.all():
                if participant != self.request.user:
                    Notification.create_notification(
                        user=participant,
                        type='message',
                        title=f'New message from {self.request.user.full_name}',
                        message=message.content[:100],
                        data={
                            'conversation_id': str(conversation.id),
                            'sender_id': str(self.request.user.id),
                            'sender_name': self.request.user.full_name
                        },
                        action_url=f'/chat/{conversation.id}',
                        action_label='View Message'
                    )
            
            # Log activity
            UserActivity.objects.create(
                user=self.request.user,
                action='send_message',
                ip_address=self.request.META.get('REMOTE_ADDR'),
                user_agent=self.request.META.get('HTTP_USER_AGENT'),
                details={'conversation_id': str(conversation.id)}
            )
            
        except Conversation.DoesNotExist:
            raise serializers.ValidationError('Conversation not found')

class MessageMarkReadView(APIView):
    """Mark a message as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            message = Message.objects.get(id=id)
            if request.user not in message.conversation.participants.all():
                return Response({
                    'error': 'You are not a participant in this conversation'
                }, status=status.HTTP_403_FORBIDDEN)
            
            message.mark_as_read()
            return Response({
                'message': 'Message marked as read'
            })
        except Message.DoesNotExist:
            return Response({
                'error': 'Message not found'
            }, status=status.HTTP_404_NOT_FOUND)

class ConversationMarkReadView(APIView):
    """Mark all messages in a conversation as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            conversation = Conversation.objects.get(id=id)
            if request.user not in conversation.participants.all():
                return Response({
                    'error': 'You are not a participant in this conversation'
                }, status=status.HTTP_403_FORBIDDEN)
            
            conversation.mark_all_read(request.user)
            return Response({
                'message': 'All messages marked as read'
            })
        except Conversation.DoesNotExist:
            return Response({
                'error': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)

class UnreadMessagesCountView(APIView):
    """Get unread messages count"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get all conversations user is in
        conversations = Conversation.objects.filter(participants=request.user)
        
        total_unread = 0
        for conv in conversations:
            total_unread += conv.get_unread_count(request.user)
        
        return Response({
            'unread_count': total_unread
        })

    