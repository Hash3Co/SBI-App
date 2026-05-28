from rest_framework import permissions

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
        return obj.user == request.user


class IsVerified(permissions.BasePermission):
    """Allow access only to verified users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified