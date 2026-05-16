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
    User.objects.filter(username__in=['test_coach_p', 'test_client_p']).delete()

    coach_user = User.objects.create_user(username='test_coach_p', password='password123', role='coach')
    client_user = User.objects.create_user(username='test_client_p', password='password123', role='client')

    coach_profile = Coach.objects.create(
        user=coach_user,
        name='Coach P',
        specialty='Yoga',
        experience=5,
        description='Desc',
        price=50.0,
    )
    Client.objects.create(user=client_user)

    client = APIClient()
    client.force_authenticate(user=client_user)

    # Test 1: premier paiement
    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 50.0})
    if res.status_code != 201:
        print("Test 1 Failed:", res.content)
        sys.exit(1)

    data = res.json()
    assert data['subscription_active'] is True
    assert Payment.objects.filter(user=client_user, coach=coach_user, status='completed').count() == 1
    print("Test 1 passed: First payment created subscription.")

    sub = Subscription.objects.get(user=client_user, coach=coach_user)
    diff = sub.end_date - timezone.now()
    assert 29 <= diff.days <= 30
    print("Test 1.1 passed: Subscription is 30 days.")

    # Test 2: paiement pendant abonnement actif (refus)
    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 50.0})
    assert res.status_code == 400
    assert 'abonnement actif' in res.json()['error']
    assert Payment.objects.filter(user=client_user, coach=coach_user, status='completed').count() == 1
    print("Test 2 passed: Duplicate payment while active prevented.")

    # Test 3: renouvellement après expiration
    sub.status = 'expired'
    sub.end_date = timezone.now() - timedelta(days=5)
    sub.save()

    res = client.post('/api/payments/create-coach-session/', {'coach_id': coach_profile.id, 'amount': 60.0})
    if res.status_code != 201:
        print("Test 3 Failed:", res.content)
        sys.exit(1)

    assert Payment.objects.filter(user=client_user, coach=coach_user, status='completed').count() == 2
    sub.refresh_from_db()
    assert sub.status == 'active'
    assert sub.end_date > timezone.now()
    assert data['subscription_active'] or res.json()['subscription_active']
    print("Test 3 passed: Renewal creates new payment and reactivates subscription.")

    # Test 4: historique my-coaches payments
    res = client.get('/api/payments/my-coaches/')
    assert res.status_code == 200
    assert len(res.json()) == 2
    print("Test 4 passed: Payment history preserved (2 completed payments).")

    print("All tests passed!")


if __name__ == '__main__':
    run_tests()
