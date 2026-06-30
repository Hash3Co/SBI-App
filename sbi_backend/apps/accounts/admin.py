from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'get_full_name_display', 'role', 'is_active', 'last_login')
    list_filter = ('role', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    readonly_fields = ('last_login', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'location_region')}),
        (_('Role & Status'), {'fields': ('role', 'is_active')}),
        (_('Permissions'), {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    ordering = ('-created_at',)
    
    def get_full_name_display(self, obj):
        """Display user's full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or "N/A"
    get_full_name_display.short_description = "Full Name"