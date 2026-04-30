from django.db import models
from django.contrib.auth import get_user_model
from programs.models import Program

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True)  
    amount = models.FloatField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Un utilisateur ne peut acheter qu'une seule fois chaque programme (statut completed)
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'program'],
                condition=models.Q(status='completed'),
                name='unique_user_program_completed'
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.program} - {self.status}"