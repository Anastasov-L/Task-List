from rest_framework.permissions import BasePermission, SAFE_METHODS
from users.models import User

def is_admin(user):
    return user.is_authenticated and getattr(user, 'user_type', None) == 'admin'


class IsOwnerOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or is_admin(request.user)


class IsAssigneeOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.assignee == request.user or is_admin(request.user)
