# apps/accounts/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from supabase import create_client
from django.conf import settings

User = get_user_model()

class SupabaseAuthBackend(ModelBackend):
    """
    Authenticate users using Supabase
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Initialize Supabase client
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SECRET_KEY
            )
            
            # Try to sign in with Supabase
            response = supabase.auth.sign_in_with_password({
                "email": username,
                "password": password
            })
            
            if response.user:
                # Get or create user in Django
                user, created = User.objects.get_or_create(
                    email=response.user.email,
                    defaults={
                        'username': response.user.email.split('@')[0],
                        'supabase_id': response.user.id,
                    }
                )
                return user
                
        except Exception as e:
            return None
        
        return None