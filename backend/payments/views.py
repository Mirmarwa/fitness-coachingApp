<<<<<<< HEAD
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from programs.models import Program



@api_view(['POST'])
def create_payment(request):
    user = request.user  
    program_id = request.data.get('program_id')
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


@api_view(['GET'])
def get_payments(request):
    payments = Payment.objects.all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)
=======
from rest_framework import viewsets
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
>>>>>>> 1e52c4f (backend API completed with DRF (users, coaches, programs, payments))
