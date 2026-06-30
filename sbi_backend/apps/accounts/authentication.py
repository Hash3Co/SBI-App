# apps/accounts/authentication.py
import jwt
import requests
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import json

User = get_user_model()

class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authentication class that validates JWT tokens from Supabase
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
            
        try:
            # Extract token
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return None
                
            token = parts[1]
            
            # Verify token with Supabase JWKS
            user_data = self.verify_token(token)
            
            if not user_data:
                raise AuthenticationFailed('Invalid token')
            
            # Get or create user in Django
            user = self.get_or_create_user(user_data)
            
            return (user, None)
            
        except Exception as e:
            raise AuthenticationFailed(f'Authentication error: {str(e)}')
    
    def verify_token(self, token):
        """
        Verify JWT token using Supabase JWKS endpoint
        """
        try:
            # Get JWKS from Supabase
            jwks_url = settings.SUPABASE_JWKS_URL
            response = requests.get(jwks_url)
            jwks = response.json()
            
            # Decode and verify token
            unverified_header = jwt.get_unverified_header(token)
            
            # Find the matching key
            rsa_key = None
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'n': key['n'],
                        'e': key['e'],
                    }
                    break
            
            if not rsa_key:
                raise AuthenticationFailed('Public key not found')
            
            # Verify the token
            decoded = jwt.decode(
                token,
                rsa_key,
                algorithms=['RS256'],
                audience='authenticated',
                issuer=f'{settings.SUPABASE_URL}/auth/v1'
            )
            
            return decoded
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Token verification failed: {str(e)}')
    
    def get_or_create_user(self, user_data):
        """
        Get or create a Django user from Supabase user data
        """
        # Extract user data from JWT claims
        supabase_id = user_data.get('sub')
        email = user_data.get('email')
        user_metadata = user_data.get('user_metadata', {})
        
        if not email:
            raise AuthenticationFailed('Email not found in token')
        
        # Try to get existing user
        try:
            user = User.objects.get(email=email)
            # Update Supabase ID if not set
            if not user.supabase_id:
                user.supabase_id = supabase_id
                user.save()
            return user
        except User.DoesNotExist:
            # Create new user
            username = email.split('@')[0]
            # Make username unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,  # Password managed by Supabase
                supabase_id=supabase_id,
                first_name=user_metadata.get('full_name', '').split()[0] if user_metadata.get('full_name') else '',
                last_name=' '.join(user_metadata.get('full_name', '').split()[1:]) if user_metadata.get('full_name') else '',
            )
            return user