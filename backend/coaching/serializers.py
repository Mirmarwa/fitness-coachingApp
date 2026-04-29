from rest_framework import serializers
from .models import Coach, Subscription, Message, Appointment


class CoachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coach
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.username', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'coach', 'coach_name', 'user_name', 'start_date', 'end_date', 'status', 'is_active']
        read_only_fields = ['user', 'start_date']

    def get_is_active(self, obj):
        return obj.is_active()


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 'content', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)
    coach_name = serializers.CharField(source='coach.username', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'client', 'coach', 'client_name', 'coach_name', 'date', 'time', 'status', 'video_link', 'notes', 'created_at']
        read_only_fields = ['client', 'created_at']
