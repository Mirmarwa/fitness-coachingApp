
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Coach(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='coach_profile'
    )
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    experience = models.IntegerField()
    description = models.TextField()
    price = models.FloatField()

    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.specialty}"
        return self.name


class Client(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - Client"


class Subscription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_subscriptions')
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    class Meta:
        unique_together = ['user', 'status']  # One active subscription per user

    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()

    def __str__(self):
        return f"{self.user.username} - {self.coach.username} ({self.status})"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:50]}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_appointments',
        null=True,
        blank=True
    )
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    video_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        client_name = self.client.username if self.client else 'Disponible'
        return f"{client_name} - {self.coach.username} ({self.date} {self.time})"
