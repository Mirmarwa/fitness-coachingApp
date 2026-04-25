from rest_framework import serializers
from .models import Payment

<<<<<<< HEAD
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
=======

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
>>>>>>> 1e52c4f (backend API completed with DRF (users, coaches, programs, payments))
