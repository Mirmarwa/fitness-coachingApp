from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db import models

from .models import Coach, Subscription, Message, Appointment
from .serializers import CoachSerializer, SubscriptionSerializer, MessageSerializer, AppointmentSerializer
from custom_permissions import IsAppointmentOwnerOrParticipant, IsMessageParticipant

User = get_user_model()


class CoachViewSet(viewsets.ModelViewSet):
    queryset = Coach.objects.all()
    serializer_class = CoachSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='subscribe')
    def subscribe(self, request):
        coach_id = request.data.get('coach_id')
        duration_days = request.data.get('duration_days', 30)  # Default 30 days

        try:
            coach = User.objects.get(id=coach_id, role='coach')
        except User.DoesNotExist:
            return Response({'error': 'Coach not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user already has an active subscription
        active_subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()

        if active_subscription:
            return Response({'error': 'You already have an active subscription'}, status=status.HTTP_400_BAD_REQUEST)

        end_date = timezone.now() + timedelta(days=duration_days)

        subscription = Subscription.objects.create(
            user=request.user,
            coach=coach,
            end_date=end_date,
            status='active'
        )

        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='status')
    def get_status(self, request):
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()

        if subscription:
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        else:
            return Response({'message': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsMessageParticipant]

    def get_queryset(self):
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='contacts')
    def contacts(self, request):
        messages = self.get_queryset().order_by('-created_at')
        contacts_map = {}

        for message in messages:
            partner = message.sender if message.sender != request.user else message.receiver
            if partner.id not in contacts_map:
                contacts_map[partner.id] = {
                    'id': partner.id,
                    'name': partner.username,
                    'lastMessage': message.content,
                    'timestamp': message.created_at,
                }

        contacts = sorted(contacts_map.values(), key=lambda item: item['timestamp'], reverse=True)
        return Response(contacts)

    @action(detail=False, methods=['get'], url_path='conversation/(?P<user_id>\d+)')
    def conversation(self, request, user_id=None):
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            (models.Q(sender=request.user) & models.Q(receiver=other_user)) |
            (models.Q(sender=other_user) & models.Q(receiver=request.user))
        ).order_by('created_at')

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='send')
    def send_message(self, request):
        receiver_id = request.data.get('receiver_id')
        content = request.data.get('content')

        if not content or not content.strip():
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)

        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            content=content.strip()
        )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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

    @action(detail=True, methods=['post'], url_path='book')
    def book_slot(self, request, pk=None):
        appointment = self.get_object()

        if request.user.role != 'client':
            return Response({'error': 'Seul un client peut réserver un créneau.'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status != 'available':
            return Response({'error': 'Ce créneau n’est pas disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.client = request.user
        appointment.status = 'booked'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm_appointment(self, request, pk=None):
        appointment = self.get_object()

        if request.user != appointment.coach:
            return Response({'error': 'Seul le coach peut confirmer ce rendez-vous.'}, status=status.HTTP_403_FORBIDDEN)

        appointment.status = 'confirmed'
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
