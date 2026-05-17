from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from coaching.models import Coach, Subscription
from payments.models import Payment
from .admin_serializers import (
    AdminCoachSerializer,
    AdminPaymentSerializer,
    AdminSubscriptionSerializer,
    AdminUserSerializer,
)
from .permissions import IsStaffUser

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_overview(request):
    """Statistiques globales pour le tableau de bord admin."""
    return Response({
        'users_total': User.objects.count(),
        'coaches_total': Coach.objects.filter(user__isnull=False).count(),
        'clients_total': User.objects.filter(role='client').count(),
        'payments_completed': Payment.objects.filter(status='completed').count(),
        'subscriptions_active': Subscription.objects.filter(
            status='active',
            end_date__gt=timezone.now(),
        ).count(),
        'staff_users': User.objects.filter(is_staff=True).count(),
    })


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_users_list(request):
    role = request.query_params.get('role')
    qs = User.objects.all().order_by('-date_joined')
    if role in ('client', 'coach'):
        qs = qs.filter(role=role)
    return Response(AdminUserSerializer(qs, many=True).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsStaffUser])
def admin_user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        return Response(AdminUserSerializer(user).data)

    if request.method == 'PATCH':
        if user.pk == request.user.pk and request.data.get('is_staff') is False:
            return Response(
                {'error': 'Vous ne pouvez pas retirer vos propres droits staff.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if user.pk == request.user.pk:
        return Response(
            {'error': 'Vous ne pouvez pas supprimer votre propre compte.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_coaches_list(request):
    coaches = Coach.objects.filter(user__isnull=False).select_related('user').order_by('id')
    return Response(AdminCoachSerializer(coaches, many=True).data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsStaffUser])
def admin_coach_detail(request, pk):
    coach = get_object_or_404(Coach.objects.select_related('user'), pk=pk)

    if request.method == 'GET':
        return Response(AdminCoachSerializer(coach).data)

    if request.method == 'PATCH':
        serializer = AdminCoachSerializer(coach, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    linked_user = coach.user
    coach.delete()
    if linked_user:
        linked_user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_payments_list(request):
    payments = Payment.objects.select_related('user', 'coach', 'program').order_by('-date')
    status_filter = request.query_params.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    return Response(AdminPaymentSerializer(payments, many=True).data)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def admin_subscriptions_list(request):
    subs = Subscription.objects.select_related('user', 'coach').order_by('-start_date')
    status_filter = request.query_params.get('status')
    if status_filter:
        subs = subs.filter(status=status_filter)
    return Response(AdminSubscriptionSerializer(subs, many=True).data)
