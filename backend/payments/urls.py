from django.urls import path
from .views import get_payments, create_payment


urlpatterns = [
    path('payments/', get_payments),
    path('payments/create/', create_payment),
    
]
