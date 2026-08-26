# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    health_check, RegisterView, LoginView, LogoutView,
    ProfileView, UpdateProfileView, ChangePasswordView,
    ForgotPasswordView, ResetPasswordView, VerifyTokenView,
    UserActivityView
)

urlpatterns = [
    # Health
    path('health/', health_check, name='health_check'),
    
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', VerifyTokenView.as_view(), name='verify_token'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Password Reset
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # Activity
    path('activity/', UserActivityView.as_view(), name='user_activity'),
]