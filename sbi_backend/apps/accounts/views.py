# apps/accounts/views.py
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.db import connection
from django.core.cache import cache
from .models import User, UserActivity
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    UpdateProfileSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    UserActivitySerializer
)
import logging

logger = logging.getLogger(__name__)

# Health Check
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    db_healthy = False
    cache_healthy = False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_healthy = True
    except Exception:
        db_healthy = False
    
    try:
        cache.set('health_check', 'ok', 10)
        cache_healthy = cache.get('health_check') == 'ok'
    except Exception:
        cache_healthy = False
    
    return Response({
        'status': 'healthy' if db_healthy and cache_healthy else 'unhealthy',
        'message': 'SBI Backend API',
        'version': 'v1',
        'database': 'connected' if db_healthy else 'disconnected',
        'cache': 'connected' if cache_healthy else 'disconnected',
        'endpoints': {
            'docs': '/api/docs/',
            'redoc': '/api/redoc/',
            'health': '/api/health/',
            'auth': '/api/auth/',
            'sme': '/api/sme/',
            'investor': '/api/investor/',
            'matching': '/api/matching/',
            'training': '/api/training/',
            'payment': '/api/payment/',
            'marketplace': '/api/marketplace/',
        }
    })

# Register View
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        UserActivity.objects.create(
            user=user,
            action='register',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

# Login View
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)
        
        if not user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is deactivated'
            }, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        
        UserActivity.objects.create(
            user=user,
            action='login',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

# Logout View
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
        
        UserActivity.objects.create(
            user=request.user,
            action='logout',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return Response({'message': 'Logout successful'})

# Profile View
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# Update Profile View
class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# Change Password View
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        UserActivity.objects.create(
            user=user,
            action='change_password',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return Response({'message': 'Password updated successfully'})

# Forgot Password View
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            reset_token = get_random_string(64)
            user.reset_token = reset_token
            user.save()
            
            reset_url = f"https://sbi-app.onrender.com/reset-password?token={reset_token}"
            send_mail(
                'Password Reset',
                f'Click here to reset your password: {reset_url}',
                'noreply@sbiapp.com',
                [email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass
        
        return Response({
            'message': 'If an account exists, instructions will be sent'
        })

# Reset Password View
class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(reset_token=token)
            user.set_password(new_password)
            user.reset_token = None
            user.save()
            
            return Response({'message': 'Password reset successful'})
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)

# Verify Token View
class VerifyTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = request.auth
        if token:
            return Response({
                'valid': True,
                'message': 'Token is valid'
            })
        return Response({
            'valid': False,
            'message': 'No token provided'
        }, status=status.HTTP_401_UNAUTHORIZED)

# User Activity View
class UserActivityView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserActivity.objects.all().order_by('-created_at')
        return UserActivity.objects.filter(user=self.request.user).order_by('-created_at')