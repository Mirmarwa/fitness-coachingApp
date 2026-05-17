from rest_framework import permissions


class IsCoachOwnerOrReadOnly(permissions.BasePermission):
    """Autorise la lecture publique, mais la modification/suppression seulement au coach propriétaire."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Lecture seule autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        # Écriture/suppression autorisée si l'objet appartient au coach connecté ou si l'utilisateur est staff
        return (hasattr(obj, 'coach') and obj.coach == request.user) or request.user.is_staff


class IsAppointmentOwnerOrParticipant(permissions.BasePermission):
    """Autorise l'accès aux rendez-vous seulement si l'utilisateur y participe."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # L'utilisateur doit être le coach ou le client du rendez-vous
        return obj.coach == request.user or obj.client == request.user


class IsMessageParticipant(permissions.BasePermission):
    """Autorise l'accès aux messages seulement si l'utilisateur est expéditeur ou destinataire."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user or obj.receiver == request.user


class IsCoachProfileOwnerOrReadOnly(permissions.BasePermission):
    """
    Catalogue coach : lectures (liste, détail) ouvertes.
    Modifications réservées au compte Django lié à ce Coach (coach.user).
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        linked_user = getattr(obj, 'user', None)
        return linked_user is not None and linked_user.pk == request.user.pk
