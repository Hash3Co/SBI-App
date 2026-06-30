from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

class ShardMiddleware(MiddlewareMixin):
    """Route requests to appropriate database shard"""
    
    def process_request(self, request):
        # Extract location from request
        location = None
        
        if request.user.is_authenticated and hasattr(request.user, 'location_region'):
            location = request.user.location_region
        
        elif 'location' in request.GET:
            location = request.GET.get('location')
        
        elif request.method in ['POST', 'PUT', 'PATCH']:
            location = request.POST.get('location')
            if not location and hasattr(request, 'data'):
                location = request.data.get('location')
        
        if location:
            # Get shard from settings
            shard = settings.SHARD_REGIONS.get(location.lower(), 'default')
            request.META['DB_SHARD'] = shard
        
        return None