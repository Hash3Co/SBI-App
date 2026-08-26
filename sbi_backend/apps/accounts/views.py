# apps/accounts/views.py
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import connection
from django.core.cache import cache
from .models import User, UserActivity
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    UpdateProfileSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    UserActivitySerializer
)
import logging

logger = logging.getLogger(__name__)

# ============ HEALTH CHECK ============
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    db_healthy = False
    cache_healthy = False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_healthy = True
    except Exception:
        db_healthy = False
    
    try:
        cache.set('health_check', 'ok', 10)
        cache_healthy = cache.get('health_check') == 'ok'
    except Exception:
        cache_healthy = False
    
    return Response({
        'status': 'healthy' if db_healthy and cache_healthy else 'unhealthy',
        'message': 'NEXUS4IR Backend API',
        'version': 'v1',
        'database': 'connected' if db_healthy else 'disconnected',
        'cache': 'connected' if cache_healthy else 'disconnected',
        'environment': 'production',
        'endpoints': {
            'docs': '/api/docs/',
            'redoc': '/api/redoc/',
            'health': '/api/health/',
            'auth': '/api/auth/',
            'sme': '/api/sme/',
            'investor': '/api/investor/',
            'matching': '/api/matching/',
            'training': '/api/training/',
            'payment': '/api/payment/',
            'marketplace': '/api/marketplace/',
        }
    })

# ============ REGISTER VIEW ============
class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"📝 Registration attempt for: {request.data.get('email')}")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"❌ Validation errors: {serializer.errors}")
                return Response({
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            # Create profile based on role
            if user.role == 'sme':
                try:
                    from apps.sme.models import SMEProfile
                    SMEProfile.objects.create(
                        user=user,
                        business_name=f"{user.full_name}'s Business",
                        industry='Technology',
                        location=''
                    )
                except Exception as e:
                    logger.warning(f"Could not create SME profile: {e}")
            
            elif user.role == 'investor':
                try:
                    from apps.investor.models import InvestorProfile
                    InvestorProfile.objects.create(
                        user=user,
                        full_name=user.full_name,
                        company_name='',
                        location=''
                    )
                except Exception as e:
                    logger.warning(f"Could not create Investor profile: {e}")
            
            # Log activity
            try:
                UserActivity.objects.create(
                    user=user,
                    action='register',
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )
            except Exception as e:
                logger.warning(f"Could not log activity: {e}")
            
            logger.info(f"✅ User registered successfully: {user.email}")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"❌ Registration error: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Registration failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ============ LOGIN VIEW ============
class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            logger.info(f"🔐 Login attempt for: {request.data.get('email')}")
            
            serializer = LoginSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Authenticate
            user = authenticate(email=email, password=password)
            
            if not user:
                logger.warning(f"❌ Invalid credentials for: {email}")
                return Response({
                    'error': 'Invalid credentials',
                    'message': 'Email or password is incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'error': 'Account is deactivated',
                    'message': 'This account has been deactivated'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Log activity
            try:
                UserActivity.objects.create(
                    user=user,
                    action='login',
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )
            except Exception as e:
                logger.warning(f"Could not log activity: {e}")
            
            logger.info(f"✅ User logged in: {email}")
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            logger.error(f"❌ Login error: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Login failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ============ LOGOUT VIEW ============
class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    logger.error(f"Token blacklist error: {e}")
            
            # Log activity
            try:
                UserActivity.objects.create(
                    user=request.user,
                    action='logout',
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )
            except Exception as e:
                logger.warning(f"Could not log activity: {e}")
            
            return Response({'message': 'Logout successful'})
            
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response({'message': 'Logout successful'})

# ============ PROFILE VIEW ============
class ProfileView(generics.RetrieveAPIView):
    """Get current user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# ============ UPDATE PROFILE VIEW ============
class UpdateProfileView(generics.UpdateAPIView):
    """Update user profile"""
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# ============ CHANGE PASSWORD VIEW ============
class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        try:
            UserActivity.objects.create(
                user=user,
                action='change_password',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
        except Exception as e:
            logger.warning(f"Could not log activity: {e}")
        
        return Response({'message': 'Password updated successfully'})

# ============ FORGOT PASSWORD VIEW ============
class ForgotPasswordView(APIView):
    """Request password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            import secrets
            reset_token = secrets.token_urlsafe(32)
            user.reset_token = reset_token
            user.save()
            
            reset_url = f"https://sbi-app.onrender.com/reset-password?token={reset_token}"
            send_mail(
                'Password Reset',
                f'Click here to reset your password: {reset_url}',
                'noreply@nexus4ir.com',
                [email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass
        
        return Response({
            'message': 'If an account exists, instructions will be sent'
        })

# ============ RESET PASSWORD VIEW ============
class ResetPasswordView(APIView):
    """Reset password with token"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(reset_token=token)
            user.set_password(new_password)
            user.reset_token = None
            user.save()
            
            return Response({'message': 'Password reset successful'})
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)

# ============ VERIFY TOKEN VIEW ============
class VerifyTokenView(APIView):
    """Verify JWT token"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = request.auth
        if token:
            return Response({
                'valid': True,
                'message': 'Token is valid'
            })
        return Response({
            'valid': False,
            'message': 'No token provided'
        }, status=status.HTTP_401_UNAUTHORIZED)

# ============ USER ACTIVITY VIEW ============
class UserActivityView(generics.ListAPIView):
    """Get user activity logs"""
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserActivity.objects.all().order_by('-created_at')
        return UserActivity.objects.filter(user=self.request.user).order_by('-created_at')