from django.core.cache import cache
from django.http import JsonResponse
from functools import wraps

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        ip = request.META.get('REMOTE_ADDR', 'unknown')
        key = f"rate_limit_{ip}"

        current = cache.get(key, 0)

        if current >= 1000:  # increase limit (100 is too low)
            return JsonResponse({"error": "Rate limit exceeded"}, status=429)

        cache.set(key, current + 1, 3600)

        return self.get_response(request)

def rate_limit(key_prefix, rate_limit_str='100/hour'):

    def decorator(view_func):

        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):

            # SAFE request access - request is the second argument for class methods
            user = getattr(request, "user", None)

            if user and user.is_authenticated:
                client_id = f"user_{user.id}"
            else:
                client_id = f"ip_{request.META.get('REMOTE_ADDR')}"

            cache_key = f"rate_limit_{key_prefix}_{client_id}"

            limit, period = rate_limit_str.split('/')
            limit = int(limit)

            timeout = {
                "minute": 60,
                "hour": 3600,
                "day": 86400
            }.get(period, 3600)

            current = cache.get(cache_key, 0)

            if current >= limit:
                return JsonResponse(
                    {"error": "Rate limit exceeded"},
                    status=429
                )

            cache.set(cache_key, current + 1, timeout)

            return view_func(self, request, *args, **kwargs)

        return wrapped_view

    return decorator