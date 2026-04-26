from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from programs.models import Program
from django.contrib.auth import get_user_model

User = get_user_model()


# ✅ CREATE PAYMENT
@api_view(['POST'])
def create_payment(request):
    try:
        print("DATA REÇUE:", request.data)  # 🔥 AJOUT

        user = User.objects.first()

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
            return Response({"error": "Déjà payé"}, status=400)

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

# ✅ GET ALL PAYMENTS
@api_view(['GET'])
def get_payments(request):
    payments = Payment.objects.all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


# ✅ CHECK PAYMENT
@api_view(['GET'])
def check_payment(request, program_id):
    exists = Payment.objects.filter(
        program_id=program_id,
        status='completed'
    ).exists()

    return Response({"paid": exists})

@api_view(['GET'])
def get_user_payments(request):
    user = User.objects.first()
    payments = Payment.objects.filter(user=user)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)