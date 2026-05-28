from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import hashlib
import logging


from .models import User, LoginAttempt, UserSession
from .serializers import (
    UserSerializer, LoginSerializer, RegisterSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, UserProfileSerializer
)
from .permissions import IsSME, IsInvestor, IsAdmin
from sbi_backend.utils.security import validate_password_strength
from sbi_backend.utils.encryption import hash_device_fingerprint
from sbi_backend.middleware.rate_limit_middleware import rate_limit


logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    """User registration"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    @rate_limit('register', '3/hour')
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login"""
    permission_classes = [permissions.AllowAny]
    
    @rate_limit('login', '5/minute')
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        role = serializer.validated_data.get('role')
        device_fingerprint = serializer.validated_data.get('device_fingerprint')
        
        # Record login attempt
        LoginAttempt.objects.create(
            email=email,
            ip_address=self.get_client_ip(request),
            success=False
        )
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        
        if not user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check role match
        if role and user.role != role:
            return Response({
                'error': f'Account is registered as {user.role}, not {role}'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if account is verified
        if not user.is_verified:
            return Response({
                'error': 'Please verify your email before logging in'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create session
        session = UserSession.objects.create(
            user=user,
            session_token=hashlib.sha256(
                f"{user.id}{timezone.now()}".encode()
            ).hexdigest(),
            device_info=request.data.get('device_info', {}),
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Record successful login
        LoginAttempt.objects.create(
            email=email,
            ip_address=self.get_client_ip(request),
            success=True
        )
        
        # Cache user data
        cache.set(f"user_{user.id}", user, timeout=300)
        
        # Store device fingerprint
        if device_fingerprint:
            hashed_fingerprint = hash_device_fingerprint(device_fingerprint)
            cache.set(f"session_{session.id}_fingerprint", hashed_fingerprint, timeout=604800)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'session_token': session.session_token
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class LogoutView(APIView):
    """User logout"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Invalidate session
        session_token = request.data.get('session_token')
        if session_token:
            UserSession.objects.filter(
                session_token=session_token,
                user=request.user
            ).update(is_active=False)
        
        # Blacklist refresh token
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        
        # Clear cache
        cache.delete(f"user_{request.user.id}")
        
        return Response({'message': 'Logged out successfully'})


class RefreshTokenView(APIView):
    """Refresh access token"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            return Response({
                'access_token': access_token
            })
        except Exception:
            return Response({'error': 'Invalid refresh token'}, status=401)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect'}, status=400)
        
        # Validate new password strength
        is_valid, error = validate_password_strength(new_password)
        if not is_valid:
            return Response({'error': error}, status=400)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class ForgotPasswordView(APIView):
    """Request password reset"""
    permission_classes = [permissions.AllowAny]
    
    @rate_limit('forgot_password', '3/hour')
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # Generate reset token
            reset_token = hashlib.sha256(
                f"{user.id}{user.email}{timezone.now()}".encode()
            ).hexdigest()
            
            user.reset_token = reset_token
            user.reset_token_expires = timezone.now() + timedelta(hours=24)
            user.save()
            
            # Send email (implement email sending)
            # send_reset_email(user.email, reset_token)
            
            return Response({
                'message': 'Password reset link sent to your email'
            })
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist
            return Response({
                'message': 'If an account exists with this email, a reset link will be sent'
            })


class ResetPasswordView(APIView):
    """Reset password with token"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(
                reset_token=token,
                reset_token_expires__gt=timezone.now()
            )
            
            # Validate password strength
            is_valid, error = validate_password_strength(new_password)
            if not is_valid:
                return Response({'error': error}, status=400)
            
            user.set_password(new_password)
            user.reset_token = None
            user.reset_token_expires = None
            user.save()
            
            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=400)


class VerifyEmailView(APIView):
    """Verify user email"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        try:
            user = User.objects.get(verification_token=token)
            user.is_verified = True
            user.verification_token = None
            user.save()
            
            return Response({'message': 'Email verified successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid verification token'}, status=400)