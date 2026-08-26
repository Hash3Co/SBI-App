# apps/accounts/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the error
    logger.error(f"Exception: {exc}")
    logger.error(f"Context: {context}")
    
    # If response is None, create a custom response
    if response is None:
        return Response({
            'error': str(exc),
            'message': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Customize error response format
    if response.status_code == 400:
        response.data = {
            'errors': response.data,
            'message': 'Validation failed'
        }
    elif response.status_code == 401:
        response.data = {
            'error': 'Authentication failed',
            'message': 'Please login again'
        }
    elif response.status_code == 403:
        response.data = {
            'error': 'Permission denied',
            'message': 'You do not have permission to perform this action'
        }
    elif response.status_code == 404:
        response.data = {
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }
    elif response.status_code == 500:
        response.data = {
            'error': 'Server error',
            'message': 'An unexpected error occurred'
        }
    
    return response