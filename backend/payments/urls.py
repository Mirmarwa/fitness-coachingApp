from django.urls import path
from .views import get_payments, create_payment , get_user_payments, check_payment


urlpatterns = [
    path('payments/', get_payments),
    path('payments/create/', create_payment),
    path('payments/my/', get_user_payments),
    path('payments/check/<int:program_id>/', check_payment),
    
]
