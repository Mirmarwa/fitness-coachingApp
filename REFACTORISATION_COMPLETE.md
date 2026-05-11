# 🎯 PLAN COMPLET DE REFACTORISATION COACH/PAIEMENT/DASHBOARD

**Date:** 11 Mai 2026  
**Objectif:** Rendre le système coach cohérent, dynamique et fonctionnel  
**Durée estimée:** 4-6 heures de travail  
**Niveau:** Étudiant ingénierie - Code simple et lisible

---

## 📋 RÉSUMÉ DES PROBLÈMES

| Problème | Cause | Impact | Solution |
|----------|-------|--------|----------|
| Dashboard affiche "Non payé" | Paiement par Program, pas Coach | Coach jamais marqué comme payé | Lier Paiement → Coach |
| Bouton "Gérer coach" incohérent | Pas de relation Client→Coach | Page ouvre mauvais coach | Créer vraie relation |
| Image identique tous coachs | Pas de champ image dans Coach | Peu professionnel | Ajouter image Coach |
| Paiement possible plusieurs fois | Pas de contrainte par Coach | Client repaye même coach | Ajouter unique_together |
| Système "30 jours" confus | Subscription ancien système | Mélange paiement/abonnement | Passer à paiement séance |
| Messages pas synchro | Pas de lien Message→Coach | Messages perdus | Ajouter coach_subscription |
| Créneaux statiques | Pas de vrai système créneaux | Impossible de réserver | Ajouter availability Coach |

---

## ✅ SOLUTIONS À IMPLÉMENTER

### Phase 1: Modèles Django (Backend)
1. **Coach model** - Ajouter `image` et `availability`
2. **Payment model** - Ajouter `coach` pour tracer qui a été payé
3. **Subscription model** - Simplifier ou supprimer (utiliser Payment)
4. **Message model** - Ajouter `coach` pour tracer conversations

### Phase 2: Views/Serializers Django
1. **CoachViewSet** - Retourner image + availability
2. **PaymentViewSet** - Filtrer par coach + éviter doublons
3. **SubscriptionViewSet** - Décider: garder ou utiliser Payment seulement
4. **MessageViewSet** - Filtrer par coach/client

### Phase 3: Frontend React
1. **Dashboard** - Afficher coach payé + status synchronisé
2. **Coach.jsx** - Afficher image + disabler paiement si déjà payé
3. **Messages** - Afficher conversations coach/client
4. **CoachDashboard** - Voir clients + créneaux

### Phase 4: Migrations + Tests
1. Créer migrations Django
2. Tester paiement → coach marqué
3. Tester éviter doublon
4. Tester Dashboard synchronisé

---

## 🔧 MODIFICATIONS DÉTAILLÉES

### A. Backend Django

#### A.1) Fichier: backend/coaching/models.py
```python
# MODIFICATIONS À FAIRE:
# 1. Ajouter champ image à Coach
# 2. Ajouter champ availability à Coach
# 3. Modifier Subscription pour utiliser Payment

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Coach(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='coach_profile'
    )
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    experience = models.IntegerField()
    description = models.TextField()
    price = models.FloatField()
    
    # NOUVEAU: Image coach
    image = models.ImageField(
        upload_to='coaches/',
        blank=True,
        null=True,
        default='coaches/default.png'
    )
    
    # NOUVEAU: Disponibilité texte simple (ex: "Lun-Ven 18h-20h, Sam 10h-12h")
    availability = models.TextField(
        blank=True,
        default="À convenir"
    )
    
    # NOUVEAU: Lien vidéo (Google Meet ou autre)
    video_link = models.URLField(
        blank=True,
        null=True,
        help_text="Google Meet ou Zoom URL"
    )

    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.specialty}"
        return self.name


class Client(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - Client"


class Subscription(models.Model):
    """
    SIMPLIFIÉ: Maintenant créé automatiquement au premier paiement
    Lien Client → Coach payé
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_subscriptions')
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    class Meta:
        # Un seul coach par client ACTIF
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'coach', 'status'],
                condition=models.Q(status='active'),
                name='unique_active_coaching_relation'
            )
        ]

    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()

    def __str__(self):
        return f"{self.user.username} → {self.coach.username} ({self.status})"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    # NOUVEAU: Coach lié pour les conversations
    coach = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coaching_messages',
        limit_choices_to={'role': 'coach'}
    )
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_appointments',
        null=True,
        blank=True
    )
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coach_appointments')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    video_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.coach} - {self.date} {self.time}"
```

#### A.2) Fichier: backend/payments/models.py
```python
# MODIFICATIONS À FAIRE:
# 1. Ajouter champ coach à Payment
# 2. Ajouter constraint unique (user, coach) pour éviter doublons
# 3. Optionnel: garder program pour compatibilité

from django.db import models
from django.contrib.auth import get_user_model
from programs.models import Program

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    
    # NOUVEAU: Coach pour tracer paiement → coaching
    coach = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='coaching_payments',
        null=True,
        blank=True,
        limit_choices_to={'role': 'coach'}
    )
    
    # OPTIONNEL: Garder program pour compatibilité
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True)
    
    amount = models.FloatField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)
    
    # NOUVEAU: Description (ex: "Séance coaching Samedi 10h")
    description = models.CharField(max_length=255, blank=True, default="Séance coaching")

    class Meta:
        # Éviter repeating payment pour même coach
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'coach'],
                condition=models.Q(status='completed'),
                name='unique_user_coach_payment'
            )
        ]
        ordering = ['-date']

    def __str__(self):
        coach_name = self.coach.username if self.coach else "Program"
        return f"{self.user.username} → {coach_name} ({self.status})"
```

#### A.3) Fichier: backend/coaching/serializers.py
```python
# MODIFICATIONS À FAIRE:
# 1. Ajouter image + availability à CoachSerializer
# 2. Créer PaymentSerializer avec coach info

from rest_framework import serializers
from django.contrib.auth import get_user_model
from coaching.models import Coach, Message, Subscription, Appointment
from payments.models import Payment

User = get_user_model()

class CoachSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    # NOUVEAU: Image URL
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = [
            'id',
            'user',
            'username',
            'email',
            'name',
            'specialty',
            'experience',
            'description',
            'price',
            'image',
            'image_url',
            'availability',
            'video_link'
        ]

    def get_image_url(self, obj):
        """Retourner URL absolute de l'image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'sender',
            'sender_username',
            'receiver',
            'receiver_username',
            'coach',
            'content',
            'created_at',
            'is_read'
        ]
        read_only_fields = ['created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    coach_username = serializers.CharField(source='coach.username', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'user_username', 'coach', 'coach_username', 'start_date', 'end_date', 'status']


class AppointmentSerializer(serializers.ModelSerializer):
    coach_username = serializers.CharField(source='coach.username', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True, required=False)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'client',
            'client_username',
            'coach',
            'coach_username',
            'date',
            'time',
            'status',
            'video_link',
            'notes',
            'created_at'
        ]


# NOUVEAU: Serializer pour afficher infos coach dans Dashboard
class PaymentWithCoachSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.name', read_only=True)
    coach_username = serializers.CharField(source='coach.user.username', read_only=True)
    coach_specialty = serializers.CharField(source='coach.specialty', read_only=True)
    coach_image = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'coach',
            'coach_name',
            'coach_username',
            'coach_specialty',
            'coach_image',
            'amount',
            'status',
            'description',
            'date'
        ]

    def get_coach_image(self, obj):
        if obj.coach and obj.coach.coach_profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.coach.coach_profile.image.url)
        return None
```

#### A.4) Fichier: backend/coaching/views.py
```python
# MODIFICATIONS À FAIRE:
# 1. CoachViewSet retourner image + availability
# 2. PaymentViewSet seulement paiements d'une séance
# 3. SubscriptionViewSet pour relation client→coach
# 4. MessageViewSet filtrer par coach

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db import models

from .models import Coach, Subscription, Message, Appointment
from .serializers import CoachSerializer, SubscriptionSerializer, MessageSerializer, AppointmentSerializer
from payments.models import Payment
from payments.serializers import PaymentWithCoachSerializer
from custom_permissions import IsAppointmentOwnerOrParticipant, IsMessageParticipant

User = get_user_model()


class CoachViewSet(viewsets.ModelViewSet):
    """
    Retourne tous les coachs avec image et availability
    """
    queryset = Coach.objects.all()
    serializer_class = CoachSerializer
    
    def get_queryset(self):
        """Retourner que les coachs valides (avec user lié)"""
        return Coach.objects.filter(user__isnull=False)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    NOUVEAU: Maintenant l'endpoint principal pour client → coach
    Créé automatiquement à la première séance payante
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(
            models.Q(user=self.request.user) | models.Q(coach=self.request.user)
        )

    @action(detail=False, methods=['get'], url_path='my-coaches')
    def my_coaches(self, request):
        """GET /api/subscriptions/my-coaches/ - Mes coachs actifs (client)"""
        subscriptions = Subscription.objects.filter(
            user=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-clients')
    def my_clients(self, request):
        """GET /api/subscriptions/my-clients/ - Mes clients (coach)"""
        subscriptions = Subscription.objects.filter(
            coach=request.user,
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsMessageParticipant]

    def get_queryset(self):
        return Message.objects.filter(
            models.Q(sender=self.request.user) | models.Q(receiver=self.request.user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """Ajouter sender automatiquement"""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'], url_path='with-coach')
    def with_coach(self, request):
        """GET /api/messages/with-coach/<coach_id>/ - Messages avec un coach"""
        coach_id = request.query_params.get('coach_id')
        if not coach_id:
            return Response({'error': 'coach_id required'}, status=400)

        messages = self.get_queryset().filter(
            models.Q(sender_id=coach_id) | models.Q(receiver_id=coach_id)
        )
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='contacts')
    def contacts(self, request):
        """Contacts avec qui on a discuté"""
        messages = self.get_queryset().order_by('-created_at')
        contacts_map = {}

        for message in messages:
            partner = message.sender if message.sender != request.user else message.receiver
            if partner.id not in contacts_map:
                contacts_map[partner.id] = {
                    'id': partner.id,
                    'username': partner.username,
                    'lastMessage': message.content,
                    'timestamp': message.created_at,
                }

        contacts = sorted(contacts_map.values(), key=lambda x: x['timestamp'], reverse=True)
        return Response(contacts)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentOwnerOrParticipant]

    def get_queryset(self):
        return Appointment.objects.filter(
            models.Q(client=self.request.user) | models.Q(coach=self.request.user)
        ).order_by('date', 'time')

    @action(detail=False, methods=['get'], url_path='my-slots')
    def my_slots(self, request):
        """GET /api/appointments/my-slots/ - Mes créneaux disponibles (coach)"""
        slots = Appointment.objects.filter(
            coach=self.request.user,
            status='available'
        ).order_by('date', 'time')
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)
```

#### A.5) Fichier: backend/payments/views.py
```python
# MODIFICATIONS À FAIRE:
# 1. Nouvelle endpoint pour paiement séance/coach
# 2. Créer automatiquement Subscription

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from .models import Payment
from .serializers import PaymentWithCoachSerializer
from coaching.models import Coach, Subscription
from programs.models import Program

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_for_coach(request):
    """
    POST /api/payments/create-coach-session/
    
    Crée un paiement pour une séance coaching
    Body: {"coach_id": <id>, "amount": <montant>, "description": "..."}
    
    AUTOMATIQUEMENT:
    1. Crée Payment
    2. Crée Subscription client → coach
    3. Affiche infos de retour
    """
    try:
        user = request.user
        coach_id = request.data.get('coach_id')
        amount = request.data.get('amount')
        description = request.data.get('description', 'Séance coaching')

        if not coach_id or not amount:
            return Response(
                {'error': 'coach_id et amount requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Récupérer le coach
        coach_user = get_object_or_404(User, id=coach_id, role='coach')
        coach = get_object_or_404(Coach, user=coach_user)

        # Valider montant
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return Response({'error': 'Montant invalide'}, status=400)

        # ✅ VÉRIFIER: pas de paiement existant pour ce coach
        existing_payment = Payment.objects.filter(
            user=user,
            coach=coach_user,
            status='completed'
        ).first()

        if existing_payment:
            return Response(
                {'error': f'Vous avez déjà payé le coach {coach.name}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Créer le paiement
        payment = Payment.objects.create(
            user=user,
            coach=coach_user,
            amount=amount,
            status='completed',
            description=description
        )

        # ✅ AUTOMATIQUEMENT: Créer Subscription
        end_date = timezone.now() + timedelta(days=90)  # 3 mois de coaching
        subscription, created = Subscription.objects.get_or_create(
            user=user,
            coach=coach_user,
            defaults={
                'end_date': end_date,
                'status': 'active'
            }
        )

        # Si Subscription existait mais expiré, la réactiver
        if not created and subscription.status == 'expired':
            subscription.status = 'active'
            subscription.end_date = end_date
            subscription.save()

        serializer = PaymentWithCoachSerializer(payment, context={'request': request})
        return Response(
            {
                'message': f'Paiement complété! Coaching avec {coach.name} activé',
                'payment': serializer.data,
                'subscription_active': subscription.is_active()
            },
            status=status.HTTP_201_CREATED
        )

    except IntegrityError as e:
        return Response(
            {'error': f'Vous avez déjà payé ce coach'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_coaches(request):
    """
    GET /api/payments/my-coaches/
    
    Retourne les coachs payés du client avec images + infos complètes
    """
    payments = Payment.objects.filter(
        user=request.user,
        coach__isnull=False,
        status='completed'
    ).select_related('coach__user')

    serializer = PaymentWithCoachSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)


# ====== COMPATIBILITÉ ANCIENS ENDPOINTS ======

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    POST /api/payments/create/
    Ancien endpoint: créer un paiement pour l'utilisateur connecté.
    Body: {"program": <program_id>, "amount": <montant>}
    """
    try:
        user = request.user
        program_id = request.data.get('program') or request.data.get('program_id')
        amount = request.data.get('amount')

        if not program_id:
            return Response({'error': 'ID de programme requis.'}, status=400)

        program = get_object_or_404(Program, id=program_id)

        if amount in [None, '']:
            amount = program.price

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response({'error': 'Montant invalide.'}, status=400)

        if amount <= 0:
            return Response({'error': 'Montant invalide'}, status=400)

        already_paid = Payment.objects.filter(
            user=user,
            program=program,
            status='completed'
        ).exists()

        if already_paid:
            return Response({"error": "Vous avez déjà acheté ce programme"}, status=400)

        payment = Payment.objects.create(
            user=user,
            program=program,
            amount=amount,
            status='completed'
        )

        from payments.serializers import PaymentSerializer
        serializer = PaymentSerializer(payment, context={'request': request})
        return Response({"message": "Paiement créé avec succès", "payment": serializer.data}, status=201)

    except IntegrityError:
        return Response({"error": "Vous avez déjà acheté ce programme"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payments(request):
    """GET /api/payments/ - Tous les paiements (admin)"""
    if not request.user.is_staff:
        return Response({'detail': 'Accès refusé.'}, status=403)

    payments = Payment.objects.all().order_by('-date')
    
    from payments.serializers import PaymentSerializer
    serializer = PaymentSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    """GET /api/payments/my/ - Mes paiements"""
    user = request.user
    payments = Payment.objects.filter(user=user).order_by('-date')
    
    from payments.serializers import PaymentSerializer
    serializer = PaymentSerializer(payments, many=True, context={'request': request})
    return Response(serializer.data)
```

---

### B. Frontend React

#### B.1) Fichier: frontend/src/pages/Dashboard.jsx
**MODIFICATIONS:**
- Charger coachs payés depuis `/api/payments/my-coaches/`
- Afficher image + statut "Coaching actif"
- Bouton "Gérer le coach" → `/coach/<coach_id>`
- Status mis à jour en temps réel

#### B.2) Fichier: frontend/src/pages/Coach.jsx
**MODIFICATIONS:**
- Afficher image dynamique du coach
- Vérifier si déjà payé
- Désactiver bouton paiement si payé
- Montrer statut "Coaching actif"

#### B.3) Fichier: frontend/src/pages/Messages.jsx
**MODIFICATIONS:**
- Lister uniquement conversations avec coachs
- Envoyer message → coach sélectionné
- Synchroniser avec backend

#### B.4) Fichier: frontend/src/pages/CoachDashboard.jsx
**MODIFICATIONS:**
- Afficher mes clients payants
- Afficher créneaux disponibles
- Confirmer séances réservées

---

## 🗄️ MIGRATIONS DJANGO

```bash
# Terminal Backend:
python manage.py makemigrations coaching
python manage.py makemigrations payments
python manage.py migrate coaching
python manage.py migrate payments

# Commandes:
python manage.py makemigrations
python manage.py migrate
```

---

## 📝 ÉTAPES D'IMPLÉMENTATION

### Jour 1: Backend Models
1. ✅ Modifier `backend/coaching/models.py`
2. ✅ Modifier `backend/payments/models.py`
3. ✅ Créer migrations
4. ✅ Tester migrations

### Jour 2: Backend Views
1. ✅ Modifier `backend/coaching/serializers.py`
2. ✅ Modifier `backend/coaching/views.py`
3. ✅ Modifier `backend/payments/views.py`
4. ✅ Tester endpoints Postman

### Jour 3: Frontend Dashboard
1. ✅ Modifier `Dashboard.jsx`
2. ✅ Modifier `Coach.jsx`
3. ✅ Tester paiement → affichage

### Jour 4: Frontend Messages
1. ✅ Modifier `Messages.jsx`
2. ✅ Modifier `CoachDashboard.jsx`
3. ✅ Tester messages synchronisés

### Jour 5: Tests complets
1. ✅ Tester flow complet
2. ✅ Corriger bugs
3. ✅ Documenter

---

## 🧪 CHECKLIST VALIDATION

### Backend
- [ ] Migration créée sans erreur
- [ ] Coach avec image chargeable
- [ ] Paiement créé pour coach
- [ ] Subscription créée automatiquement
- [ ] Erreur si repeating paiement
- [ ] Endpoint `/api/payments/my-coaches/` retourne coachs
- [ ] Endpoint `/api/subscriptions/my-coaches/` retourne subscriptions

### Frontend
- [ ] Dashboard affiche coachs payés
- [ ] Image affichée correctement
- [ ] Bouton "Gérer coach" fonctionne
- [ ] Coach.jsx montre "Coaching actif" si payé
- [ ] Impossible de repayer
- [ ] Messages synchronisés

---

## 📂 FICHIERS À MODIFIER

**Backend (5 fichiers):**
- `backend/coaching/models.py`
- `backend/coaching/serializers.py`
- `backend/coaching/views.py`
- `backend/payments/models.py`
- `backend/payments/views.py`

**Frontend (4 fichiers minimum):**
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Coach.jsx`
- `frontend/src/pages/Messages.jsx`
- `frontend/src/pages/CoachDashboard.jsx`

---

## ⚠️ POINTS CRITIQUES

1. **Préserver JWT** - Pas de changement auth
2. **Compatibilité** - Ancien code Program paiement encore utilisable
3. **Images** - Créer dossier `media/coaches/` et défaut
4. **Migrations** - Tester en local avant push
5. **Tests** - Vérifier doublon paiement
6. **Frontend** - Cache localStorage peut causer bugs

---

**Prêt?** On commence par le backend! 🚀
