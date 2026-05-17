from rest_framework import serializers

from coaching.models import Coach, Subscription
from payments.models import Payment
from .models import CustomUser


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class AdminCoachSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Coach
        fields = [
            'id',
            'user_id',
            'username',
            'email',
            'name',
            'specialty',
            'experience',
            'description',
            'price',
            'availability',
            'video_link',
        ]


class AdminPaymentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    coach_username = serializers.CharField(source='coach.username', read_only=True, allow_null=True)
    program_title = serializers.CharField(source='program.title', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'username',
            'coach',
            'coach_username',
            'program',
            'program_title',
            'amount',
            'status',
            'description',
            'date',
        ]


class AdminSubscriptionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    coach_username = serializers.CharField(source='coach.username', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'user',
            'user_username',
            'coach',
            'coach_username',
            'start_date',
            'end_date',
            'status',
        ]
