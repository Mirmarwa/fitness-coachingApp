from rest_framework import serializers
from .models import Payment
from programs.models import Program


class PaymentSerializer(serializers.ModelSerializer):
    program_title = serializers.SerializerMethodField()
    program_image = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'user', 'username', 'program', 'program_title', 'program_image', 'amount', 'status', 'date']
        read_only_fields = ['id', 'user', 'date']

    def get_program_title(self, obj):
        if obj.program:
            return obj.program.title
        return None

    def get_program_image(self, obj):
        if obj.program and obj.program.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.program.image.url)
            return obj.program.image.url
        return None