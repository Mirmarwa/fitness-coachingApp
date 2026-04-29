from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from programs.models import Program
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# ✅ CREATE PAYMENT
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    try:
        print("DATA REÇUE:", request.data)  # 🔥 AJOUT

        user = request.user

        program_id = request.data.get('program')
        amount = request.data.get('amount')

        print("PROGRAM ID:", program_id)  # 🔥 AJOUT

        program = Program.objects.get(id=program_id)

        already_paid = Payment.objects.filter(
    user=user,
    program=program,
    status='completed'
).exists()

        if already_paid:
            return Response ({"error": "Déjà payé"}, status=400)

        payment = Payment.objects.create(
            user=user,
            program=program,
            amount=amount,
            status='completed'
        )

        return Response({"message": "ok"})

    except Exception as e:
        print("ERREUR BACKEND:", e)  # 🔥 TRÈS IMPORTANT
        return Response({"error": str(e)})

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# ✅ GET ALL PAYMENTS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payments(request):
    payments = Payment.objects.all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# ✅ CHECK PAYMENT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment(request, program_id):
    user = request.user
    exists = Payment.objects.filter(
        user=user,
        program_id=program_id,
        status='completed'
    ).exists()

    return Response({"paid": exists})
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    user = request.user
    payments = Payment.objects.filter(user=user)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)