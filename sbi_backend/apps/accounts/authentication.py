# apps/accounts/authentication.py
import jwt
import requests
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

User = get_user_model()

class SupabaseJWTAuthentication(BaseAuthentication):
    """Authentication class that validates JWT tokens from Supabase"""

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        token = parts[1]
        user_data = self.verify_token(token)
        if not user_data:
            raise AuthenticationFailed("Invalid token")

        user = self.get_or_create_user(user_data)
        return (user, None)

    def verify_token(self, token):
        try:
            jwks_url = settings.SUPABASE_JWKS_URL
            response = requests.get(jwks_url, timeout=10)
            jwks = response.json()
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == unverified_header.get("kid"):
                    rsa_key = {
                        "kty": key.get("kty"),
                        "n": key.get("n"),
                        "e": key.get("e"),
                    }
                    break
            if not rsa_key:
                raise AuthenticationFailed("Public key not found")

            decoded = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience="authenticated",
                issuer=f"{settings.SUPABASE_URL}/auth/v1",
            )
            return decoded
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed(f"Invalid token: {str(exc)}")
        except Exception as exc:
            raise AuthenticationFailed(f"Token verification failed: {str(exc)}")

    def get_or_create_user(self, user_data):
        supabase_id = user_data.get("sub")
        email = user_data.get("email")
        user_metadata = user_data.get("user_metadata", {}) or {}

        if not email:
            raise AuthenticationFailed("Email not found in token")

        try:
            user = User.objects.get(email=email)
            if not getattr(user, "supabase_id", None):
                user.supabase_id = supabase_id
                user.save(update_fields=["supabase_id"])
            return user
        except User.DoesNotExist:
            username = email.split("@")[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,
                supabase_id=supabase_id,
                first_name=user_metadata.get("full_name", "").split()[0] if user_metadata.get("full_name") else "",
                last_name=" ".join(user_metadata.get("full_name", "").split()[1:]) if user_metadata.get("full_name") else "",
            )
            return user
