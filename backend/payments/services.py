"""
Logique métier paiement coaching ↔ abonnement.

- Historique : chaque renouvellement crée un nouveau Payment (status=completed).
- Un seul abonnement actif par couple client/coach (contrainte DB + vérifications).
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from coaching.models import Coach, Subscription
from .models import Payment

DEFAULT_SUBSCRIPTION_DAYS = 30


class ActiveSubscriptionError(Exception):
    """Le client a déjà un abonnement actif avec ce coach."""

    def __init__(self, coach_name='ce coach'):
        self.coach_name = coach_name
        super().__init__(f'Vous avez déjà un abonnement actif avec le coach {coach_name}')


def expire_stale_subscriptions(user, coach_user):
    """Passe en « expired » les abonnements actifs dont la date de fin est dépassée."""
    Subscription.objects.filter(
        user=user,
        coach=coach_user,
        status='active',
        end_date__lte=timezone.now(),
    ).update(status='expired')


def get_active_subscription(user, coach_user):
    """Abonnement réellement actif (statut + date de fin)."""
    expire_stale_subscriptions(user, coach_user)
    return Subscription.objects.filter(
        user=user,
        coach=coach_user,
        status='active',
        end_date__gt=timezone.now(),
    ).first()


@transaction.atomic
def process_coaching_payment(user, coach_profile, amount, description='Séance coaching', duration_days=None):
    """
    Crée un paiement coaching et active ou renouvelle l'abonnement associé.

    Returns:
        tuple (payment, subscription)
    """
    if duration_days is None:
        duration_days = DEFAULT_SUBSCRIPTION_DAYS

    coach_user = coach_profile.user
    if not coach_user or getattr(coach_user, 'role', '') != 'coach':
        raise ValueError('Profil coach invalide')

    expire_stale_subscriptions(user, coach_user)

    has_active = (
        Subscription.objects.select_for_update()
        .filter(
            user=user,
            coach=coach_user,
            status='active',
            end_date__gt=timezone.now(),
        )
        .exists()
    )
    if has_active:
        raise ActiveSubscriptionError(coach_profile.name)

    payment = Payment.objects.create(
        user=user,
        coach=coach_user,
        amount=amount,
        status='completed',
        description=description,
    )

    end_date = timezone.now() + timedelta(days=duration_days)
    subscription = (
        Subscription.objects.select_for_update()
        .filter(user=user, coach=coach_user)
        .order_by('-start_date')
        .first()
    )

    if subscription:
        subscription.status = 'active'
        subscription.start_date = timezone.now()
        subscription.end_date = end_date
        subscription.save(update_fields=['status', 'start_date', 'end_date'])
    else:
        subscription = Subscription.objects.create(
            user=user,
            coach=coach_user,
            end_date=end_date,
            status='active',
        )

    return payment, subscription
