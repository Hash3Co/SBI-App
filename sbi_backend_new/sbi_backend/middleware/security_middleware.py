from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
import re
import json

from sbi_backend.utils.security import detect_sql_injection, detect_xss, sanitize_input


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add comprehensive security headers to all responses"""
    
    def process_response(self, request, response):
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Enable XSS protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # HTTP Strict Transport Security (HSTS)
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Content Security Policy
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com"
        
        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=(), payment=(self "https://js.stripe.com")'
        
        # Cache Control for sensitive pages
        if request.path.startswith('/api/auth/') or request.path.startswith('/api/payments/'):
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
            response['Pragma'] = 'no-cache'
        
        return response


class RequestValidationMiddleware(MiddlewareMixin):
    """Validate all incoming requests for injection attacks"""
    
    def process_request(self, request):
        # Check GET parameters
        for key, value in request.GET.items():
            if detect_sql_injection(str(value)) or detect_xss(str(value)):
                return JsonResponse({
                    'error': 'Invalid characters detected in request',
                    'code': 'INVALID_INPUT'
                }, status=400)
        
        # Check POST/PUT/PATCH data
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.content_type == 'application/json':
                    data = json.loads(request.body)
                    self._validate_data(data)
                else:
                    for key, value in request.POST.items():
                        if detect_sql_injection(str(value)) or detect_xss(str(value)):
                            return JsonResponse({
                                'error': 'Invalid characters detected in request',
                                'code': 'INVALID_INPUT'
                            }, status=400)
            except Exception:
                pass
        
        return None
    
    def _validate_data(self, data, path=""):
        """Recursively validate nested data"""
        if isinstance(data, dict):
            for key, value in data.items():
                self._validate_data(value, f"{path}.{key}")
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                self._validate_data(item, f"{path}[{idx}]")
        elif isinstance(data, str):
            if detect_sql_injection(data) or detect_xss(data):
                raise ValueError(f"Invalid input at {path}")


class RateLimitMiddleware(MiddlewareMixin):
    """Rate limiting by IP and user"""
    
    def process_request(self, request):
        # Get client identifier
        if request.user and request.user.is_authenticated:
            client_id = f"user_{request.user.id}"
        else:
            client_id = f"ip_{self.get_client_ip(request)}"
        
        # Define rate limits per endpoint
        rate_limits = {
            '/api/auth/login': ('5', 'minute'),
            '/api/auth/register': ('3', 'hour'),
            '/api/auth/forgot-password': ('3', 'hour'),
            '/api/auth/refresh': ('10', 'minute'),
            '/api/payments/': ('20', 'hour'),
            '/api/matching/': ('50', 'hour'),
            'default': ('100', 'hour')
        }
        
        # Get rate limit for path - fix variable scope issue (set default explicitly)
        limit, period = rate_limits['default']  # Get default safely
        for path, rate in rate_limits.items():
            if request.path.startswith(path):
                limit, period = rate
                break
        
        # Convert period to seconds
        if period == 'minute':
            timeout = 60
        elif period == 'hour':
            timeout = 3600
        elif period == 'day':
            timeout = 86400
        else:
            timeout = 3600
        
        cache_key = f"rate_limit_{client_id}_{request.path}"
        current = cache.get(cache_key, 0)
        
        if current >= int(limit):
            return JsonResponse({
                'error': f'Rate limit exceeded. Try again in {timeout} seconds.',
                'code': 'RATE_LIMIT_EXCEEDED'
            }, status=429)
        
        cache.set(cache_key, current + 1, timeout)
        return None
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class SessionValidationMiddleware(MiddlewareMixin):
    """Validate session and device fingerprint on every request"""
    
    def process_request(self, request):
        # Skip for public endpoints
        public_paths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/swagger/', '/redoc/']
        if any(request.path.startswith(path) for path in public_paths):
            return None
        
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        device_fingerprint = request.headers.get('X-Device-Fingerprint')
        request_id = request.headers.get('X-Request-ID')
        timestamp = request.headers.get('X-Timestamp')
        
        # Validate request ID (prevent replay attacks)
        if request_id and cache.get(f"used_request_id_{request_id}"):
            return JsonResponse({
                'error': 'Request replay detected',
                'code': 'REPLAY_ATTACK'
            }, status=403)
        
        if request_id:
            cache.set(f"used_request_id_{request_id}", True, timeout=300)
        
        # Validate timestamp (prevent replay attacks)
        if timestamp:
            try:
                request_time = int(timestamp)
                current_time = int(timezone.now().timestamp())
                if abs(current_time - request_time) > 300:  # 5 minutes tolerance
                    return JsonResponse({
                        'error': 'Request timestamp out of range',
                        'code': 'INVALID_TIMESTAMP'
                    }, status=403)
            except (ValueError, TypeError):
                pass
        
        # Validate session
        session_data = cache.get(f"session_{token}")
        if session_data:
            stored_fingerprint = session_data.get('device_fingerprint')
            if stored_fingerprint and device_fingerprint and stored_fingerprint != device_fingerprint:
                # Possible session hijacking
                cache.delete(f"session_{token}")
                return JsonResponse({
                    'error': 'Session validation failed',
                    'code': 'SESSION_INVALID'
                }, status=401)
        
        return None