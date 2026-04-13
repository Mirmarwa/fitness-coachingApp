from django.urls import path
from .views import get_programs

urlpatterns = [
    path('programs/', get_programs),
]