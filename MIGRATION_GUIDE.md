# 🚀 INSTRUCTIONS MIGRATION & DÉPLOIEMENT - PHASE 1 & 2

**Date:** 11 Mai 2026  
**Étape:** Backend complet - Models, Serializers, Views

---

## ✅ CE QUI A ÉTÉ MODIFIÉ

### Backend (5 fichiers):
1. ✅ **backend/coaching/models.py**
   - ➕ Ajouter champ `image` à Coach
   - ➕ Ajouter champ `availability` à Coach
   - ➕ Ajouter champ `video_link` à Coach
   - ✏️ Modifier Subscription constraint `unique_active_coaching_relation`
   - ➕ Ajouter champ `coach` à Message

2. ✅ **backend/payments/models.py**
   - ➕ Ajouter champ `coach` à Payment
   - ➕ Ajouter champ `description` à Payment
   - ✏️ Ajouter constraint `unique_user_coach_payment`
   - ✏️ Remplacer `related_name` pour clarté

3. ✅ **backend/coaching/serializers.py**
   - ✏️ Modifier CoachSerializer (ajouter image_url)
   - ✏️ Modifier MessageSerializer (ajouter coach)
   - ✏️ Modifier SubscriptionSerializer
   - ➕ Ajouter PaymentWithCoachSerializer

4. ✅ **backend/payments/serializers.py**
   - ➕ Ajouter PaymentWithCoachSerializer

5. ✅ **backend/coaching/views.py**
   - ✏️ Modifier CoachViewSet (filtrer user__isnull=False)
   - ✏️ Remplacer SubscriptionViewSet
   - ✏️ Remplacer MessageViewSet

6. ✅ **backend/payments/views.py**
   - ➕ Ajouter endpoint POST `/api/payments/create-coach-session/`
   - ➕ Ajouter endpoint GET `/api/payments/my-coaches/`
   - ✏️ Garder endpoints existants pour compatibilité

7. ✅ **backend/payments/urls.py**
   - ➕ Ajouter 2 nouvelles routes

---

## 🗂️ INSTRUCTIONS DE MIGRATION

### ÉTAPE 1: Créer les migrations Django

```bash
# Terminal: Allez au dossier backend
cd backend

# Créer les migrations pour coaching
python manage.py makemigrations coaching

# Créer les migrations pour payments
python manage.py makemigrations payments

# Vérifier les migrations créées (optionnel)
python manage.py showmigrations

# Appliquer les migrations
python manage.py migrate coaching
python manage.py migrate payments
```

### ÉTAPE 2: Test post-migration

```bash
# Lancer le server Django
python manage.py runserver

# Vérifier que les endpoints marchent (Postman ou curl):
# GET http://127.0.0.1:8000/api/coaches/ → doit inclure image_url, availability, video_link
# POST http://127.0.0.1:8000/api/payments/create-coach-session/ → doit retourner payment + subscription
# GET http://127.0.0.1:8000/api/payments/my-coaches/ → doit retourner coachs payés
```

### ÉTAPE 3: Vérifier la base de données

```bash
# Pour voir les schémas de la base de données dans Django shell:
python manage.py shell

# Puis dans le shell Python:
from coaching.models import Coach, Message
from payments.models import Payment

# Vérifier les champs
print(Coach._meta.fields)  # Devrait inclure image, availability, video_link
print(Payment._meta.fields)  # Devrait inclure coach, description
print(Message._meta.fields)  # Devrait inclure coach

# Quitter le shell
exit()
```

---

## ⚠️ POINTS CRITIQUES

### 1. **Migrations en conflit?**
Si vous avez un message d'erreur "conflicting migration", c'est parce qu'il y a déjà d'autres migrations. Solution:

```bash
# Fusionner les migrations
python manage.py makemigrations --merge
python manage.py migrate
```

### 2. **Image par défaut manquante?**
L'image par défaut est définie comme `coaches/default.png`. Vous devez créer ce fichier:

```bash
# Créer le dossier media/coaches/ s'il n'existe pas
mkdir -p media/coaches/

# Ajouter une image par défaut (ou laissez vide, elle est optionnelle)
# Vous pouvez aussi uploader une image depuis Django admin
```

### 3. **Erreur de contrainte unique?**
Si vous avez des payments existants pour le même (user, coach), la contrainte peut échouer. Solution:

```bash
# Via Django shell, nettoyer les doublons:
python manage.py shell

from payments.models import Payment
# Supprimer les paiements coach non uniques
# OU modifier la migration pour ignorer les doublons existants
```

---

## 📦 FICHIERS MODIFIÉS - RÉSUMÉ

| Fichier | Type | Modifications | Status |
|---------|------|---------------|--------|
| `backend/coaching/models.py` | Model | +image, +availability, +video_link, ✏️constraint, +coach to Message | ✅ |
| `backend/payments/models.py` | Model | +coach, +description, ✏️constraint | ✅ |
| `backend/coaching/serializers.py` | Serializer | ✏️CoachSerializer, ✏️MessageSerializer, ✏️SubscriptionSerializer, +PaymentWithCoachSerializer | ✅ |
| `backend/payments/serializers.py` | Serializer | +PaymentWithCoachSerializer | ✅ |
| `backend/coaching/views.py` | View | ✏️CoachViewSet, ✏️SubscriptionViewSet, ✏️MessageViewSet | ✅ |
| `backend/payments/views.py` | View | +create_payment_for_coach, +get_my_coaches | ✅ |
| `backend/payments/urls.py` | URL | +2 nouvelles routes | ✅ |

---

## 🔍 COMMANDES DE VÉRIFICATION

```bash
# 1. Vérifier les migrations non appliquées
python manage.py showmigrations

# 2. Vérifier un endpoint spécifique
curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:8000/api/coaches/

# 3. Vérifier la structure de la base
python manage.py dbshell  # Ouvre le shell SQLite/PostgreSQL

# 4. Rollback si erreur (danger!)
python manage.py migrate coaching 0001  # Revenir à la première migration
```

---

## 📝 PROCHAINES ÉTAPES

### ✅ Phase 1 & 2 complètes:
- Backend models, serializers, views, endpoints, URLs

### 🔄 Phase 3 (Frontend React - À venir):
- Modifier Dashboard.jsx pour afficher coachs payés
- Modifier Coach.jsx pour show image + disable paiement si payé
- Modifier Messages.jsx pour messages avec coach
- Modifier CoachDashboard.jsx pour voir clients payants

### 🧪 Phase 4 (Tests):
- Tester flow complet: Coach creation → paiement → affichage

---

**Prêt? Allez-y avec les migrations! 🚀**
