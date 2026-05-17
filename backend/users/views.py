from rest_framework import mixins, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer
from .tokens import CustomTokenObtainPairSerializer


class UserViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Plus de création/suppression/mise à jour globale sur tous les utilisateurs :
    inscription = POST /api/register/, profil = /api/users/profile/.
    Liste réservée au staff ; un utilisateur authentifié ne peut charger que lui-même (hors admin).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if self.action == 'list':
            if user.is_staff:
                return CustomUser.objects.all().order_by('id')
            return CustomUser.objects.none()
        if user.is_staff:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(pk=user.pk)

    @action(detail=False, methods=['get', 'patch'], url_path='profile', permission_classes=[IsAuthenticated])
    def profile(self, request):
        user = request.user

        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['patch'], url_path='profile/update', permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# 🎯 REGISTER ENDPOINT
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/register/
    Endpoint d'inscription pour créer un nouvel utilisateur.
    
    Body:
    {
        "username": "john_doe",
        "email": "john@example.com",  # Optionnel
        "password": "SecurePassword123",
        "password_confirm": "SecurePassword123",
        "role": "client"  # ou "coach"
    }
    
    Response:
    {
        "user": {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "role": "client"
        },
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        refresh = CustomTokenObtainPairSerializer.get_token(user)

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
