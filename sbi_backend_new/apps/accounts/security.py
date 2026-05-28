import hashlib
import hmac
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class DeviceFingerprintAuth(BaseAuthentication):
    """Device fingerprint authentication to prevent token theft"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        device_fingerprint = request.headers.get('X-Device-Fingerprint')
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Verify device fingerprint
            stored_fingerprint = cache.get(f"device_fingerprint_{payload['user_id']}")
            if stored_fingerprint and stored_fingerprint != device_fingerprint:
                raise AuthenticationFailed('Device fingerprint mismatch - possible token theft')
            
            from .models import User
            user = User.objects.get(id=payload['user_id'])
            
            # Check if token is blacklisted
            if cache.get(f"blacklisted_token_{token}"):
                raise AuthenticationFailed('Token has been revoked')
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')


class SessionValidator:
    """Validate user session across shards"""
    
    @staticmethod
    def create_session(user, request):
        """Create new session with security metadata"""
        from .models import UserSession
        
        session_token = hashlib.sha256(
            f"{user.id}{timezone.now()}{request.META.get('REMOTE_ADDR')}".encode()
        ).hexdigest()
        
        session = UserSession.objects.create(
            user=user,
            session_token=session_token,
            device_info={
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'platform': request.headers.get('X-Platform', 'unknown'),
                'app_version': request.headers.get('X-App-Version', '1.0.0')
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Store device fingerprint in cache with short expiry
        device_fingerprint = request.headers.get('X-Device-Fingerprint')
        if device_fingerprint:
            cache.set(
                f"device_fingerprint_{user.id}",
                device_fingerprint,
                timeout=3600  # 1 hour
            )
        
        return session
    
    @staticmethod
    def validate_session(session_token, device_fingerprint):
        """Validate session and check for anomalies"""
        from .models import UserSession
        
        try:
            session = UserSession.objects.get(
                session_token=session_token,
                is_active=True,
                expires_at__gt=timezone.now()
            )
            
            # Check for session hijacking
            stored_fingerprint = cache.get(f"device_fingerprint_{session.user.id}")
            if stored_fingerprint and stored_fingerprint != device_fingerprint:
                session.is_active = False
                session.save()
                return False, "Session hijacking detected"
            
            # Update last activity
            session.last_activity = timezone.now()
            session.save()
            
            return True, session
            
        except UserSession.DoesNotExist:
            return False, "Invalid or expired session"


class TokenBlacklist:
    """Blacklist tokens for logout and security"""
    
    @staticmethod
    def blacklist_token(token, expiry=86400):
        """Add token to blacklist"""
        cache.set(f"blacklisted_token_{token}", True, timeout=expiry)
    
    @staticmethod
    def is_blacklisted(token):
        """Check if token is blacklisted"""
        return cache.get(f"blacklisted_token_{token}") is not None
    
    @staticmethod
    def blacklist_all_user_tokens(user_id):
        """Blacklist all tokens for a user (force logout)"""
        cache.set(f"user_tokens_blacklisted_{user_id}", True, timeout=86400)