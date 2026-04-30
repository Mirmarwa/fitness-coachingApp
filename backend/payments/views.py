from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import Payment
from .serializers import PaymentSerializer
from programs.models import Program


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
        program_id = request.data.get('program')
        amount = request.data.get('amount')

        # Récupérer le programme (404 si inexistant)
        program = get_object_or_404(Program, id=program_id)

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