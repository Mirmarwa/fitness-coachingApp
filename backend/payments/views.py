from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from programs.models import Program
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['POST'])
def create_payment(request):
    try:
        user = User.objects.first()  # temporaire

        program_id = request.data.get('program')  # IMPORTANT
        amount = request.data.get('amount')

        program = Program.objects.get(id=program_id)

        payment = Payment.objects.create(
            user=user,
            program=program,
            amount=amount,
            status='completed'
        )

        serializer = PaymentSerializer(payment)
        return Response(serializer.data)

    except Exception as e:
        print("ERREUR :", e)
        return Response({"error": str(e)})


@api_view(['GET'])
def get_payments(request):
    payments = Payment.objects.all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_user_payments(request):
    user = User.objects.first()  # temporaire
    payments = Payment.objects.filter(user=user)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def check_payment(request, program_id):
    user = User.objects.first()  # temporaire

    exists = Payment.objects.filter(
        user=user,
        program_id=program_id,
        status='completed'
    ).exists()

    return Response({"paid": exists})