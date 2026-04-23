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