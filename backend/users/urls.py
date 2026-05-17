from django.urls import path
from .views import register
from . import admin_views

urlpatterns = [
    path('register/', register, name='register'),
    path('admin/overview/', admin_views.admin_overview),
    path('admin/users/', admin_views.admin_users_list),
    path('admin/users/<int:pk>/', admin_views.admin_user_detail),
    path('admin/coaches/', admin_views.admin_coaches_list),
    path('admin/coaches/<int:pk>/', admin_views.admin_coach_detail),
    path('admin/payments/', admin_views.admin_payments_list),
    path('admin/subscriptions/', admin_views.admin_subscriptions_list),
]
