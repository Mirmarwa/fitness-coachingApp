
from django.db import models


class Coach(models.Model):
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    experience = models.IntegerField()
    description = models.TextField()
    price = models.FloatField()
