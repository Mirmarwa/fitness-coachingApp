from rest_framework import viewsets, status, mixins
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db import models

from .models import Coach, Subscription, Message, Appointment
from .serializers import (
    CoachSerializer,
    SubscriptionSerializer,
    MessageSerializer,
    MessagePartialUpdateSerializer,
    AppointmentSerializer,
)
from custom_permissions import (
    IsAppointmentOwnerOrParticipant,
    IsMessageParticipant,
    IsCoachProfileOwnerOrReadOnly,
)

User = get_user_model()


class CoachViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Liste / détail lisibles sans compte pour le catalogue.
    Création de fiches coach = inscription (Register) uniquement ;
    PATCH réservée au utilisateur dont le profil Coach est relié (coach.user).
    """
    queryset = Coach.objects.filter(user__isnull=False)
    serializer_class = CoachSerializer
    permission_classes = [IsCoachProfileOwnerOrReadOnly]
    http_method_names = ['get', 'patch', 'put', 'head', 'options']

    def update(self, request, *args, **kwargs):
        """PUT désactivé : PATCH partiel utilisé depuis le front (profil coach)."""
        return Response({'detail': 'La méthode PUT n’est pas supportée pour ce profil.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    Gère les relations client → coach payé
    Créé automatiquement à la première séance payante
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner subscriptions pour le user ou ses clients (si coach)"""
        return Subscription.objects.filter(
            models.Q(user=self.request.user) | models.Q(coach=self.request.user)
        )

    @action(detail=False, methods=['get'], url_path='my-coaches')
    def my_coaches(self, request):
        """GET /api/subscriptions/my-coaches/ - Mes coachs actifs (client)"""
        subscriptions = Subscription.objects.filter(
            user=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-clients')
    def my_clients(self, request):
        """GET /api/subscriptions/my-clients/ - Mes clients actifs (coach)"""
        subscriptions = Subscription.objects.filter(
            coach=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)


class MessageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Création de messages uniquement via POST /messages/send/ (contrôle abonnement).
    Plus de POST sur la collection (/messages/), qui contourne les gardes précédentes.
    PATCH réservée au destinataire pour « is_read » uniquement (sérialiseur dédié).
    """

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsMessageParticipant]
    http_method_names = ['get', 'patch', 'head', 'options', 'post']

    def get_queryset(self):
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return MessagePartialUpdateSerializer
        return MessageSerializer

    def update(self, request, *args, **kwargs):
        return Response({'detail': 'La méthode PUT n’est pas supportée.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.receiver_id != self.request.user.id:
            raise PermissionDenied('Seul le destinataire peut mettre ce message à jour.')
        serializer.save()

    @action(detail=False, methods=['get'], url_path='with-coach')
    def with_coach(self, request):
        """GET /api/messages/with-coach/?coach_id=<id> - Messages avec un coach"""
        coach_id = request.query_params.get('coach_id')
        if not coach_id:
            return Response({'error': 'coach_id required'}, status=400)

        messages = self.get_queryset().filter(
            models.Q(sender_id=coach_id) | models.Q(receiver_id=coach_id)
        )
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'conversation/(?P<user_id>[^/.]+)')
    def conversation(self, request, user_id=None):
        """GET /api/messages/conversation/<user_id>/ - Messages avec un utilisateur"""
        if not user_id:
            return Response({'error': 'user_id required'}, status=400)

        messages = self.get_queryset().filter(
            (models.Q(sender_id=user_id) & models.Q(receiver=request.user)) |
            (models.Q(receiver_id=user_id) & models.Q(sender=request.user))
        ).order_by('created_at')

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='send')
    def send_message(self, request):
        """POST /api/messages/send/ - Envoyer un message"""

        receiver_id = request.data.get('receiver_id')
        content = request.data.get('content')

        if not receiver_id or not content or not content.strip():
            return Response(
                {'error': 'receiver_id and content are required.'},
                status=400
            )

        try:
            receiver = User.objects.get(pk=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'Receiver not found.'}, status=404)

        user = request.user
        has_sub = False
        coach = None

        if user.role == 'client' and getattr(receiver, 'role', '') == 'coach':
            has_sub = Subscription.objects.filter(
                user=user, coach=receiver, status='active', end_date__gt=timezone.now()
            ).exists()
            coach = receiver
        elif user.role == 'coach' and getattr(receiver, 'role', '') == 'client':
            has_sub = Subscription.objects.filter(
                user=receiver, coach=user, status='active', end_date__gt=timezone.now()
            ).exists()
            coach = user

        if not has_sub:
            return Response(
                {'error': 'Vous devez avoir un abonnement actif pour envoyer un message à cet utilisateur.'},
                status=status.HTTP_403_FORBIDDEN
            )

        message = Message.objects.create(
            sender=user,
            receiver=receiver,
            coach=coach,
            content=content.strip()
        )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=201)

    @action(detail=False, methods=['get'], url_path='contacts')
    def contacts(self, request):
        """Contacts avec qui on a discuté ou avec qui on a un abonnement actif"""
        user = request.user
        messages = self.get_queryset().order_by('-created_at')
        contacts_map = {}

        # 1. Ajouter depuis les messages
        for message in messages:
            partner = message.sender if message.sender != user else message.receiver
            coach_user = message.coach
            if not coach_user:
                coach_user = message.sender if getattr(message.sender, 'role', None) == 'coach' else message.receiver if getattr(message.receiver, 'role', None) == 'coach' else None

            if partner.id not in contacts_map:
                contacts_map[partner.id] = {
                    'id': partner.id,
                    'name': partner.get_full_name().strip() or partner.username,
                    'username': partner.username,
                    'lastMessage': message.content,
                    'timestamp': message.created_at,
                    'coach_id': coach_user.id if coach_user else None,
                }

        # 2. Ajouter depuis les abonnements actifs
        if user.role == 'client':
            active_subs = Subscription.objects.filter(user=user, status='active', end_date__gt=timezone.now())
            for sub in active_subs:
                partner = sub.coach
                if partner.id not in contacts_map:
                    contacts_map[partner.id] = {
                        'id': partner.id,
                        'name': partner.get_full_name().strip() or partner.username,
                        'username': partner.username,
                        'lastMessage': 'Nouvel abonnement !',
                        'timestamp': sub.start_date,
                        'coach_id': partner.id,
                    }
        elif user.role == 'coach':
            active_subs = Subscription.objects.filter(coach=user, status='active', end_date__gt=timezone.now())
            for sub in active_subs:
                partner = sub.user
                if partner.id not in contacts_map:
                    contacts_map[partner.id] = {
                        'id': partner.id,
                        'name': partner.get_full_name().strip() or partner.username,
                        'username': partner.username,
                        'lastMessage': 'Nouveau client !',
                        'timestamp': sub.start_date,
                        'coach_id': user.id,
                    }

        contacts = sorted(contacts_map.values(), key=lambda x: x['timestamp'], reverse=True)
        return Response(contacts)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentOwnerOrParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'coach':
            return Appointment.objects.filter(coach=user)
        return Appointment.objects.filter(client=user)

    @action(detail=False, methods=['get'], url_path='my')
    def my_appointments(self, request):
        appointments = self.get_queryset()
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available')
    def available_slots(self, request):
        coach_id = request.query_params.get('coach_id')
        queryset = Appointment.objects.filter(status='available')

        if request.user.role == 'client':
            subscribed_coach_ids = Subscription.objects.filter(
                user=request.user,
                status='active',
                end_date__gt=timezone.now()
            ).values_list('coach_id', flat=True)
            queryset = queryset.filter(coach_id__in=subscribed_coach_ids)

        if coach_id:
            queryset = queryset.filter(coach_id=coach_id)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create')
    def create_slot(self, request):
        if request.user.role != 'coach':
            return Response({'error': 'Seul un coach peut créer un créneau.'}, status=status.HTTP_403_FORBIDDEN)

        date = request.data.get('date')
        time = request.data.get('time')
        notes = request.data.get('notes', '')

        if not date or not time:
            return Response({'error': 'Date et heure sont requises.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment = Appointment.objects.create(
            coach=request.user,
            date=date,
            time=time,
            notes=notes,
            status='available'
        )

        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='book', permission_classes=[IsAuthenticated])
    def book_slot(self, request, pk=None):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Créneau introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'client':
            return Response({'error': 'Seul un client peut réserver un créneau.'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status != 'available':
            return Response({'error': 'Ce créneau n’est pas disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        has_active_subscription = Subscription.objects.filter(
            user=request.user,
            coach=appointment.coach,
            status='active',
            end_date__gt=timezone.now()
        ).exists()

        if not has_active_subscription:
            return Response({'error': 'Vous devez avoir un abonnement actif avec ce coach pour réserver.'}, status=status.HTTP_403_FORBIDDEN)

        # « pending » : RDV réservé par le client, en attente d’acceptation coach (cohérent avec l’UI)
        appointment.client = request.user
        appointment.status = 'pending'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm_appointment(self, request, pk=None):
        appointment = self.get_object()

        if request.user != appointment.coach:
            return Response({'error': 'Seul le coach peut confirmer ce rendez-vous.'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status not in ('pending', 'booked'):
            return Response(
                {
                    'error': (
                        'Seuls les rendez-vous en attente de confirmation du coach peuvent être confirmés '
                        '(statuts « pending » ou « booked » pour les anciennes données).'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = 'confirmed'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
