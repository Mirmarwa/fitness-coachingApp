from django.urls import path
from .views import get_payments, create_payment, check_payment, get_user_payments
urlpatterns = [
    path('', get_payments),  # GET /api/payments/
    path('create/', create_payment),  # POST /api/payments/create/
    path('check/<int:program_id>/', check_payment),  # GET /api/payments/check/1/
    path('my/', get_user_payments),  # GET /api/payments/my/ - 🔥 NOUVEAU ENDPOINT
]