from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """Accès réservé aux comptes avec is_staff=True (administration applicative)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )
