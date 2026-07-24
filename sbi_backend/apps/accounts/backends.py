# apps/accounts/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from supabase import create_client
from django.conf import settings

User = get_user_model()

class SupabaseAuthBackend(ModelBackend):
    """Authenticate users using Supabase credentials."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)
            response = supabase.auth.sign_in_with_password({
                "email": username,
                "password": password,
            })

            user_obj = None
            if isinstance(response, dict):
                user_obj = response.get("user") or response.get("data")
            else:
                user_obj = getattr(response, "user", None)

            if not user_obj:
                return None

            if isinstance(user_obj, dict):
                user_email = user_obj.get("email")
                user_id = user_obj.get("id")
            else:
                user_email = getattr(user_obj, "email", None)
                user_id = getattr(user_obj, "id", None)

            if not user_email:
                return None

            user, created = User.objects.get_or_create(
                email=user_email,
                defaults={
                    "username": user_email.split("@")[0],
                    "supabase_id": user_id,
                }
            )
            return user
        except Exception:
            return None
