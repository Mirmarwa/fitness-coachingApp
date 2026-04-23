from django.urls import path
from .views import get_programs, get_program_detail
urlpatterns = [
    path('programs/', get_programs),
    path('api/programs/<int:id>/', get_programs),
    path('programs/<int:id>/', get_program_detail),
]