from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import PermissionDenied
from django.http import Http404
import logging

logger = logging.getLogger('security')

def custom_exception_handler(exc, context):
    """Custom exception handler that matches frontend error format"""
    
    # Call REST framework's default exception handler
    response = exception_handler(exc, context)
    
    if response is not None:
        # Format error response to match frontend expectations
        return Response({
            'error': response.data.get('detail', str(response.data)),
            'code': get_error_code(exc),
            'status': response.status_code
        }, status=response.status_code)
    
    # Handle non-DRF exceptions
    if isinstance(exc, PermissionDenied):
        logger.warning(f"Permission denied: {exc}")
        return Response({
            'error': 'You do not have permission to perform this action',
            'code': 'PERMISSION_DENIED',
            'status': 403
        }, status=status.HTTP_403_FORBIDDEN)
    
    if isinstance(exc, Http404):
        return Response({
            'error': 'Resource not found',
            'code': 'NOT_FOUND',
            'status': 404
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Log unexpected errors for security
    logger.error(f"Unexpected error: {exc}")
    
    return Response({
        'error': 'An unexpected error occurred',
        'code': 'INTERNAL_ERROR',
        'status': 500
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_error_code(exc):
    """Map exception to error code matching frontend"""
    error_mapping = {
        'AuthenticationFailed': 'AUTH_FAILED',
        'NotAuthenticated': 'NOT_AUTHENTICATED',
        'PermissionDenied': 'PERMISSION_DENIED',
        'ValidationError': 'VALIDATION_ERROR',
        'Throttled': 'RATE_LIMIT_EXCEEDED',
        'ParseError': 'PARSE_ERROR',
    }
    
    class_name = exc.__class__.__name__
    return error_mapping.get(class_name, 'UNKNOWN_ERROR')