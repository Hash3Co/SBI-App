from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserSession, LoginAttempt

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'get_full_name_display', 'role', 'is_verified', 'is_active', 'last_login', 'failed_login_attempts')
    list_filter = ('role', 'is_verified', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    readonly_fields = ('last_login', 'created_at', 'updated_at', 'failed_login_attempts', 'last_login_ip')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'location_region')}),
        (_('Role & Status'), {'fields': ('role', 'is_verified', 'verification_token')}),
        (_('Security'), {'fields': ('failed_login_attempts', 'last_login_ip', 'is_locked', 'locked_until')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    ordering = ('-created_at',)
    
    actions = ['verify_users', 'lock_users', 'unlock_users']
    
    def get_full_name_display(self, obj):
        """Display user's full name from first_name and last_name"""
        return f"{obj.first_name} {obj.last_name}".strip() or "N/A"
    get_full_name_display.short_description = "Full Name"
    
    def verify_users(self, request, queryset):
        updated = queryset.update(is_verified=True, verification_token=None)
        self.message_user(request, f'{updated} users verified successfully.')
    verify_users.short_description = "Verify selected users"
    
    def lock_users(self, request, queryset):
        updated = queryset.update(is_locked=True)
        self.message_user(request, f'{updated} users locked.')
    lock_users.short_description = "Lock selected users"
    
    def unlock_users(self, request, queryset):
        updated = queryset.update(is_locked=False, locked_until=None, failed_login_attempts=0)
        self.message_user(request, f'{updated} users unlocked.')
    unlock_users.short_description = "Unlock selected users"


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_token', 'is_active', 'expires_at', 'last_activity', 'ip_address')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__email', 'session_token', 'ip_address')
    readonly_fields = ('session_token', 'device_info', 'user_agent', 'created_at', 'last_activity')
    
    actions = ['terminate_sessions']
    
    def terminate_sessions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} sessions terminated.')
    terminate_sessions.short_description = "Terminate selected sessions"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'ip_address', 'success', 'attempted_at')
    list_filter = ('success', 'attempted_at')
    search_fields = ('email', 'ip_address')
    readonly_fields = ('email', 'ip_address', 'attempted_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False