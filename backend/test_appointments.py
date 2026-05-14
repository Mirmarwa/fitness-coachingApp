import os
import django
import sys
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from coaching.models import Coach, Client, Subscription, Appointment
from rest_framework.test import APIClient

User = get_user_model()

def run_tests():
    print("Running tests...")
    # Clean up old data
    User.objects.filter(username__in=['test_coach1', 'test_coach2', 'test_client1', 'test_client2']).delete()

    # Create users
    coach1_user = User.objects.create_user(username='test_coach1', password='password123', role='coach')
    coach2_user = User.objects.create_user(username='test_coach2', password='password123', role='coach')
    client1_user = User.objects.create_user(username='test_client1', password='password123', role='client')
    client2_user = User.objects.create_user(username='test_client2', password='password123', role='client')

    # Create profiles
    Coach.objects.create(user=coach1_user, name='Coach 1', specialty='Yoga', experience=5, description='Desc', price=50.0)
    Coach.objects.create(user=coach2_user, name='Coach 2', specialty='Cardio', experience=3, description='Desc', price=40.0)
    Client.objects.create(user=client1_user)
    Client.objects.create(user=client2_user)

    # Create active subscription for client1 -> coach1
    Subscription.objects.create(
        user=client1_user,
        coach=coach1_user,
        status='active',
        start_date=timezone.now(),
        end_date=timezone.now() + timedelta(days=30)
    )

    # Create expired subscription for client1 -> coach2
    Subscription.objects.create(
        user=client1_user,
        coach=coach2_user,
        status='expired',
        start_date=timezone.now() - timedelta(days=60),
        end_date=timezone.now() - timedelta(days=30)
    )

    # Create appointments (Available)
    app1 = Appointment.objects.create(coach=coach1_user, date=timezone.now().date(), time=timezone.now().time(), status='available')
    app2 = Appointment.objects.create(coach=coach2_user, date=timezone.now().date(), time=timezone.now().time(), status='available')

    client = APIClient()

    # Test 1: client1 fetching available slots (should see app1 but not app2)
    client.force_authenticate(user=client1_user)
    res = client.get('/api/appointments/available/')
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]['id'] == app1.id
    print("Test 1 passed: client1 only sees subscribed coach's slots.")

    # Test 2: client2 fetching available slots (should see none)
    client.force_authenticate(user=client2_user)
    res = client.get('/api/appointments/available/')
    assert res.status_code == 200
    assert len(res.json()) == 0
    print("Test 2 passed: client2 sees no slots (no subscriptions).")

    # Test 3: client1 booking app1 (should succeed)
    client.force_authenticate(user=client1_user)
    res = client.post(f'/api/appointments/{app1.id}/book/')
    if res.status_code != 200:
        print(res.content)
    assert res.status_code == 200
    print("Test 3 passed: client1 booked app1 successfully.")

    # Test 4: client1 booking app2 (should fail 403)
    res = client.post(f'/api/appointments/{app2.id}/book/')
    assert res.status_code == 403
    print("Test 4 passed: client1 prevented from booking app2 (no active subscription).")

    # Test 5: client2 booking app2 (should fail 403)
    client.force_authenticate(user=client2_user)
    res = client.post(f'/api/appointments/{app2.id}/book/')
    assert res.status_code == 403
    print("Test 5 passed: client2 prevented from booking app2 (no active subscription).")

    print("All tests passed!")

if __name__ == '__main__':
    run_tests()
