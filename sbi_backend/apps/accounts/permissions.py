# apps/accounts/permissions.py
from rest_framework import permissions

class IsAuthenticated(permissions.BasePermission):
    """Allow access only to authenticated users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated


class IsSME(permissions.BasePermission):
    """Allow access only to SME users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'sme'


class IsInvestor(permissions.BasePermission):
    """Allow access only to Investor users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'investor'


class IsAdmin(permissions.BasePermission):
    """Allow access only to Admin users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwner(permissions.BasePermission):
    """Allow access only to object owner"""
    def has_object_permission(self, request, view, obj):
        # Check if the object has a 'user' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # Check if the object has a 'created_by' attribute
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        # Check if the object itself is the user
        if hasattr(obj, 'id') and obj == request.user:
            return True
        return False


class IsSMEOrOwner(permissions.BasePermission):
    """Allow access if user is SME or the object owner"""
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'sme':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsInvestorOrOwner(permissions.BasePermission):
    """Allow access if user is Investor or the object owner"""
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'investor':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False