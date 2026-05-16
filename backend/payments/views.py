from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.contrib.auth import get_user_model

from .models import Payment
from .serializers import PaymentSerializer, PaymentWithCoachSerializer
from .services import ActiveSubscriptionError, process_coaching_payment
from programs.models import Program
from coaching.models import Coach

User = get_user_model()


# ✅ NOUVEAU: CREATE PAYMENT FOR COACH - Paiement séance coaching
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_for_coach(request):
    """
    POST /api/payments/create-coach-session/
    
    Crée un paiement pour une séance coaching
    Body: {"coach_id": <id>, "amount": <montant>, "description": "..."}
    
    AUTOMATIQUEMENT:
    1. Crée Payment
    2. Crée Subscription client → coach
    3. Retourne infos complètes
    """
    try:
        user = request.user
        coach_id = request.data.get('coach_id')
        amount = request.data.get('amount')
        description = request.data.get('description', 'Séance coaching')

        if not coach_id or amount in [None, '']:
            return Response(
                {'error': 'coach_id et amount requis'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        coach = get_object_or_404(Coach, id=coach_id)

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return Response({'error': 'Montant invalide'}, status=400)

        payment, subscription = process_coaching_payment(
            user,
            coach,
            amount,
            description=description,
        )

        serializer = PaymentWithCoachSerializer(payment, context={'request': request})
        return Response(
            {
                'message': f'Paiement complété! Coaching avec {coach.name} activé',
                'payment': serializer.data,
                'subscription_active': subscription.is_active(),
            },
            status=status.HTTP_201_CREATED,
        )

    except ActiveSubscriptionError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError as exc:
        return Response({'error': str(exc)}, status=400)
    except IntegrityError:
        return Response(
            {'error': 'Un abonnement actif existe déjà pour ce coach.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ✅ NOUVEAU: GET MY COACHES - Mes coachs payés
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_coaches(request):
    """
    GET /api/payments/my-coaches/
    
    Retourne les coachs payés du client avec images + infos complètes
    """
    payments = Payment.objects.filter(
        user=request.user,
        coach__isnull=False,
        status='completed',
    ).select_related('coach', 'coach__coach_profile').order_by('-date')

    serializer = PaymentWithCoachSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ CREATE PAYMENT - Créer un paiement pour l'utilisateur connecté
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    POST /api/payments/create/
    Crée un paiement pour l'utilisateur connecté.
    Body: {"program": <program_id>, "amount": <montant>}
    """
    try:
        user = request.user
        program_id = request.data.get('program') or request.data.get('program_id')
        amount = request.data.get('amount')

        if not program_id:
            return Response({'error': 'ID de programme requis.'}, status=400)

        # Récupérer le programme (404 si inexistant)
        program = get_object_or_404(Program, id=program_id)

        if amount in [None, '']:
            amount = program.price

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response({'error': 'Montant invalide.'}, status=400)

        # Valider que le montant est positif
        if amount <= 0:
            return Response({'error': 'Montant invalide'}, status=400)

        # Vérifier si l'utilisateur a déjà acheté ce programme
        already_paid = Payment.objects.filter(
            user=user,
            program=program,
            status='completed'
        ).exists()

        if already_paid:
            return Response({"error": "Vous avez déjà acheté ce programme"}, status=400)

        # Créer le paiement
        payment = Payment.objects.create(
            user=user,
            program=program,
            amount=amount,
            status='completed'
        )

        serializer = PaymentSerializer(payment, context={'request': request})
        return Response({"message": "Paiement créé avec succès", "payment": serializer.data}, status=201)

    except IntegrityError:
        # Si la contrainte unique est violée
        return Response({"error": "Vous avez déjà acheté ce programme"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ✅ GET ALL PAYMENTS - Admin only (récupère tous les paiements)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payments(request):
    """
    GET /api/payments/
    Récupère tous les paiements (admin seulement).
    """
    if not request.user.is_staff:
        return Response({'detail': 'Accès refusé.'}, status=403)

    payments = Payment.objects.all()
    serializer = PaymentSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ GET USER PAYMENTS - Récupère les paiements de l'utilisateur connecté
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    """
    GET /api/payments/my/
    ou
    GET /api/payments/my_payments/
    Récupère les paiements de l'utilisateur connecté.
    """
    user = request.user
    payments = Payment.objects.filter(user=user).order_by('-date')
    serializer = PaymentSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ CHECK PAYMENT - Vérifier si l'utilisateur connecté a acheté un programme
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment(request, program_id):
    """
    GET /api/payments/check/<program_id>/
    Vérifie si l'utilisateur connecté a acheté ce programme.
    """
    user = request.user
    exists = Payment.objects.filter(
        user=user,
        program_id=program_id,
        status='completed'
    ).exists()

    return Response({"paid": exists})