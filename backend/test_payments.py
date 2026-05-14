import os
import django
import sys
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from coaching.models import Coach, Client, Subscription
from payments.models import Payment
from rest_framework.test import APIClient

User = get_user_model()

def run_tests():
    print("Running payment tests...")
    # Clean up old data
    User.objects.filter(username__in=['test_coach_p', 'test_client_p']).delete()

    # Create users
    coach_user = User.objects.create_user(username='test_coach_p', password='password123', role='coach')
    client_user = User.objects.create_user(username='test_client_p', password='password123', role='client')

    # Create profiles
    coach_profile = Coach.objects.create(user=coach_user, name='Coach P', specialty='Yoga', experience=5, description='Desc', price=50.0)
    Client.objects.create(user=client_user)

    client = APIClient()
    client.force_authenticate(user=client_user)

    # Test 1: Pay for coach (first time)
    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 50.0})
    if res.status_code != 201:
        print("Test 1 Failed:", res.content)
        sys.exit(1)
        
    data = res.json()
    assert data['subscription_active'] is True
    print("Test 1 passed: First payment created subscription.")

    # Check that subscription is for 30 days
    sub = Subscription.objects.get(user=client_user, coach=coach_user)
    diff = sub.end_date - timezone.now()
    assert 29 <= diff.days <= 30
    print("Test 1.1 passed: Subscription is 30 days.")

    # Test 2: Pay for coach again while active (should fail due to active sub)
    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 50.0})
    assert res.status_code == 400
    assert 'Vous avez déjà un abonnement actif' in res.json()['error']
    print("Test 2 passed: Duplicate payment prevented.")

    # Expire subscription and test again (Wait, unique constraint on Payment should fail this!)
    sub.status = 'expired'
    sub.end_date = timezone.now() - timedelta(days=5)
    sub.save()

    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 50.0})
    assert res.status_code == 400
    assert 'Vous avez déjà payé ce coach' in res.json()['error']
    print("Test 3 passed: IntegrityError from Payment caught correctly (cannot renew due to constraint).")

    print("All tests passed!")

if __name__ == '__main__':
    run_tests()
