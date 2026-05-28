from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import hashlib
import json

from .security import DeviceFingerprintAuth, SessionValidator, TokenBlacklist
from .models import LoginAttempt, User
from core.utils.security import (
    validate_email, validate_password_strength,
    detect_sql_injection, detect_xss, sanitize_input
)


class SecureLoginView(APIView):
    """Enhanced secure login with device fingerprinting"""
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        # Sanitize inputs first
        email = sanitize_input(request.data.get('email', ''))
        password = request.data.get('password', '')
        device_fingerprint = request.data.get('device_fingerprint', '')
        device_info = request.data.get('device_info', {})
        
        # Validate email format
        if not validate_email(email):
            return Response({
                'error': 'Invalid email format',
                'code': 'INVALID_EMAIL'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for brute force
        ip_address = self.get_client_ip(request)
        recent_attempts = LoginAttempt.objects.filter(
            ip_address=ip_address,
            attempted_at__gte=timezone.now() - timedelta(minutes=15)
        ).count()
        
        if recent_attempts >= 5:
            cache.set(f"blocked_ip_{ip_address}", True, timeout=900)  # 15 min block
            return Response({
                'error': 'Too many failed attempts. Try again later.',
                'code': 'RATE_LIMIT_EXCEEDED'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Check if IP is blocked
        if cache.get(f"blocked_ip_{ip_address}"):
            return Response({
                'error': 'IP address temporarily blocked',
                'code': 'IP_BLOCKED'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Record attempt
        LoginAttempt.objects.create(
            email=email,
            ip_address=ip_address,
            success=False,
            device_fingerprint=device_fingerprint
        )
        
        # Authenticate user
        try:
            user = User.objects.get(email=email)
            
            # Check if account is locked
            if user.failed_login_attempts >= 5:
                lockout_until = cache.get(f"lockout_user_{user.id}")
                if lockout_until and lockout_until > timezone.now():
                    return Response({
                        'error': 'Account temporarily locked. Try again later.',
                        'code': 'ACCOUNT_LOCKED'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            if not user.check_password(password):
                user.failed_login_attempts += 1
                user.save()
                
                if user.failed_login_attempts >= 5:
                    cache.set(f"lockout_user_{user.id}", timezone.now() + timedelta(minutes=30), timeout=1800)
                
                return Response({
                    'error': 'Invalid credentials',
                    'code': 'INVALID_CREDENTIALS'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Reset failed attempts on success
            user.failed_login_attempts = 0
            user.last_login = timezone.now()
            user.last_login_ip = ip_address
            user.save()
            
            # Create session
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims
            refresh['device_fingerprint'] = device_fingerprint
            refresh['ip_address'] = ip_address
            
            # Store session in cache with fingerprint
            session_data = {
                'user_id': str(user.id),
                'device_fingerprint': device_fingerprint,
                'ip_address': ip_address,
                'created_at': timezone.now().isoformat()
            }
            cache.set(
                f"session_{refresh.access_token}",
                session_data,
                timeout=900  # 15 minutes
            )
            
            # Store device fingerprint for validation
            cache.set(
                f"device_fingerprint_{user.id}",
                device_fingerprint,
                timeout=3600
            )
            
            # Record successful login
            LoginAttempt.objects.create(
                email=email,
                ip_address=ip_address,
                success=True,
                device_fingerprint=device_fingerprint
            )
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'role': user.role,
                    'is_verified': user.is_verified
                }
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials',
                'code': 'INVALID_CREDENTIALS'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class SecureLogoutView(APIView):
    """Secure logout with token blacklisting"""
    authentication_classes = [DeviceFingerprintAuth]
    
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(' ')[1]
            # Blacklist the token
            TokenBlacklist.blacklist_token(token)
        
        # Clear device fingerprint cache
        cache.delete(f"device_fingerprint_{request.user.id}")
        
        # Invalidate all user sessions
        from .models import UserSession
        UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        return Response({'message': 'Logged out successfully'})


class TokenRefreshView(APIView):
    """Secure token refresh with validation"""
    authentication_classes = []
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        device_fingerprint = request.headers.get('X-Device-Fingerprint')
        
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken(refresh_token)
            
            # Validate device fingerprint
            if refresh.get('device_fingerprint') != device_fingerprint:
                return Response({
                    'error': 'Device fingerprint mismatch'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if refresh token is blacklisted
            if TokenBlacklist.is_blacklisted(refresh_token):
                return Response({
                    'error': 'Token has been revoked'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            new_access = str(refresh.access_token)
            
            # Store new session
            cache.set(
                f"session_{new_access}",
                {
                    'user_id': refresh.get('user_id'),
                    'device_fingerprint': device_fingerprint,
                    'refreshed_at': timezone.now().isoformat()
                },
                timeout=900
            )
            
            return Response({'access': new_access})
            
        except Exception as e:
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)