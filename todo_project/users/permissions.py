from rest_framework.permissions import BasePermission, SAFE_METHODS
from users.models import User

def is_admin(user):
    return getattr(user, 'user_type', None) == 'admin'


class IsAdminUser(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_admin(request.user)


class ReadOnlyOrAdmin(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and is_admin(request.user)
