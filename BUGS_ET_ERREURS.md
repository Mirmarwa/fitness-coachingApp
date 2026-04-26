# 🐛 Rapport des Bugs et Erreurs Logiques — Fitness Coaching App

Ce document liste **toutes les fautes logiques, erreurs de code et problèmes de sécurité** trouvés dans le projet, en particulier dans le système de paiements.

---

## 🔴 CRITIQUE — Paiements : Double achat possible

### Problème
Le frontend envoie la requête de paiement sur `/api/payments/` (méthode POST). Cette URL est gérée par le `PaymentViewSet` enregistré dans le `DefaultRouter`.

Or, dans `backend/payments/views.py`, la méthode `PaymentViewSet.create` **ne vérifie pas** si l'utilisateur a déjà acheté ce programme. Elle crée un nouveau paiement à chaque clic sur "Acheter".

### Code problématique (`backend/payments/views.py`)
```python
class PaymentViewSet(viewsets.ModelViewSet):
    ...
    def create(self, request, *args, **kwargs):
        ...
        # 🔴 PAS DE VÉRIFICATION "déjà payé" ICI
        payment = Payment.objects.create(
            user=user,
            program=program,
            amount=amount,
            status='completed'
        )
```

### Conséquence
Un utilisateur peut payer **100 fois le même programme**. La base de données contiendra 100 lignes de paiement pour le même couple (user, program).

### Fichiers concernés
- `backend/payments/views.py`
- `backend/payments/models.py` (pas de contrainte DB)

---

## 🔴 CRITIQUE — `check_payment` ne filtre pas par utilisateur

### Problème
La vue `check_payment` vérifie si un programme a été payé, mais **elle ne vérifie pas pour QUEL utilisateur**.

### Code problématique
```python
@api_view(['GET'])
def check_payment(request, program_id):
    exists = Payment.objects.filter(
        program_id=program_id,
        status='completed'
    ).exists()  # 🔴 FILTRE PAR USER MANQUANT
    return Response({"paid": exists})
```

### Conséquence
Si **l'utilisateur A** a acheté le programme 1, alors **l'utilisateur B** verra aussi "✔️ Déjà acheté" et ne pourra pas l'acheter. Inversement, si personne n'a acheté le programme, l'utilisateur qui L'A acheté verra le bouton "Acheter" (car `User.objects.first()` change selon la requête).

---

## 🔴 CRITIQUE — `User.objects.first()` : usurpation d'identité

### Problème
Toutes les vues de paiement utilisent `User.objects.first()` pour récupérer l'utilisateur. Cela signifie que :
- **Tous les paiements sont attribués au premier utilisateur créé dans la base** (ID=1)
- N'importe qui qui achète un programme le fait au nom d'un autre
- La vérification "déjà payé" est totalement faussée car elle ne concerne pas le vrai utilisateur

### Code problématique
```python
user = User.objects.first()  # 🔴 TOUJOURS LE MÊME UTILISATEUR
```

### Fichiers concernés
- `backend/payments/views.py` (toutes les vues)

---

## 🟠 MAJEUR — `/api/payments/my/` n'existe pas

### Problème
Le Dashboard frontend appelle `fetch("http://127.0.0.1:8000/api/payments/my/")`.

Mais dans `backend/config/urls.py`, seul le `DefaultRouter` est utilisé. Le router DRF génère automatiquement les routes standards :
- `GET /api/payments/` (liste)
- `POST /api/payments/` (création)
- `GET /api/payments/{id}/` (détail)
- etc.

**Il n'y a pas de route `/api/payments/my/`**.

### Code problématique (`frontend/src/pages/Dashboard.jsx`)
```javascript
fetch("http://127.0.0.1:8000/api/payments/my/")
```

### Conséquence
Le Dashboard ne reçoit jamais les paiements de l'utilisateur. Il reçoit une erreur 404.

---

## 🟠 MAJEUR — `payments/urls.py` est obsolète et cassé

### Problème
Le fichier `backend/payments/urls.py` tente d'importer `create_payment` :
```python
from .views import get_payments, create_payment, get_user_payments, check_payment
```

Mais dans `backend/payments/views.py`, la fonction s'appelle **`create`** (et non `create_payment`). De plus, ces fonctions ne sont **plus utilisées** car `config/urls.py` utilise le `DefaultRouter` à la place.

### Conséquence
ImportError si on essaye d'inclure `payments.urls`. Heureusement, ce fichier n'est plus inclus.

---

## 🟠 MAJEUR — Imports dupliqués et code mort dans `payments/views.py`

### Problème
Le fichier `backend/payments/views.py` est un véritable "patchwork" :
- `from .models import Payment` importé **2 fois**
- `from .serializers import PaymentSerializer` importé **2 fois**
- `from rest_framework import viewsets` importé **2 fois**
- `from programs.models import Program` importé **2 fois**
- `from django.contrib.auth import get_user_model` importé **2 fois**
- Une fonction `create` décorée avec `@api_view(['POST'])` existe en haut mais n'est **jamais utilisée** (code mort)
- Des fonctions `get_payments`, `get_user_payments`, `check_payment` flottent sans être rattachées au router

---

## 🟡 MOYEN — Pas de contrainte base de données sur les paiements

### Problème
Le modèle `Payment` n'a aucune contrainte d'unicité. Même si on corrige la vue, la base de données permet toujours d'insérer des doublons.

### Code problématique (`backend/payments/models.py`)
```python
class Payment(models.Model):
    ...
    # 🔴 PAS DE class Meta avec unique_together ou constraints
```

### Solution recommandée
Ajouter une contrainte unique sur `(user, program)` pour les paiements `completed`.

---

## 🟡 MOYEN — `Program.objects.get()` sans gestion d'erreur

### Problème
Si l'ID du programme n'existe pas, le serveur renvoie une erreur 500 (exception non gérée) au lieu d'une belle réponse 404.

### Code problématique
```python
program = Program.objects.get(id=program_id)  # 🔴 500 si inexistant
```

### Solution
Utiliser `get_object_or_404(Program, id=program_id)`.

---

## 🟡 MOYEN — Aucune validation des données reçues

### Problème
- `program_id` peut être `None`
- `amount` peut être négatif, `null`, ou une chaîne de caractères
- Pas de vérification que le programme existe avant création

---

## 🟡 MOYEN — Dashboard : graphique calculé avant chargement des données

### Problème
Dans `frontend/src/pages/Dashboard.jsx`, `chartData` est calculé au rendu, mais `programs` est rempli de manière asynchrone dans le `useEffect`.

```javascript
const chartData = payments.map(p => ({
    name: programs[p.program]?.title || `Prog ${p.program}`,
    amount: p.amount
}));
// 🔴 programs est vide au premier rendu
```

### Conséquence
Le graphique affiche des noms génériques (`Prog 1`, `Prog 2`) pendant le chargement, ou plante si `recharts` ne gère pas les données partielles.

---

## 🟡 MOYEN — CoachViewSet utilise un modèle Coach indépendant

### Problème
Le modèle `Coach` dans `backend/coaching/models.py` est totalement indépendant du système d'utilisateurs :
```python
class Coach(models.Model):
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    ...
```

Il n'a **aucune relation** avec `CustomUser`. Pourtant le cahier des charges prévoit que les coachs soient des utilisateurs avec un rôle.

### Conséquence
Double source de vérité : les coachs existent à la fois dans `CustomUser` (avec `role='coach'`) et dans la table `Coach` séparée. Cela crée une confusion et des incohérences.

---

## 🟢 MINEUR — `ProgramDetail.jsx` : pas de gestion d'erreur sur le fetch programme

### Problème
```javascript
fetch(`http://127.0.0.1:8000/api/programs/${id}/`)
    .then(res => res.json())
    .then(data => setProgram(data));
```
Si le programme n'existe pas (404), `data` contiendra le HTML de l'erreur Django, ce qui peut planter le rendu (`program.title` sur `undefined`).

---

## 🟢 MINEUR — `Dashboard.jsx` : `program.image` peut être null

### Problème
```javascript
<img src={`http://127.0.0.1:8000${program.image}`} width="200" alt="" />
```
Si `program.image` est `null`, le `src` devient `http://127.0.0.1:8000null`, ce qui génère une requête invalide.

---

## 🟢 MINEUR — `programs/urls.py` est inutile

### Problème
Le fichier existe et définit des routes, mais `config/urls.py` utilise le `DefaultRouter` qui enregistre `ProgramViewSet`. Les anciennes fonctions `get_programs` et `get_program_detail` ne sont plus utilisées.

### Ancien bug (corrigé indirectement)
Auparavant, il y avait une erreur de route :
```python
path('api/programs/<int:id>/', get_programs),  # 🔴 mauvaise vue
```
Ce fichier n'est plus inclus, donc ce n'est plus actif, mais il reste dans le projet et prête à confusion.

---

# 📋 Récapitulatif des fichiers à corriger

| Fichier | Nombre de problèmes |
|---------|---------------------|
| `backend/payments/views.py` | 🔴 5+ (logique, doublons, imports, code mort) |
| `backend/payments/models.py` | 🟠 1 (pas de contrainte DB) |
| `backend/payments/urls.py` | 🟠 1 (import inexistant, fichier obsolète) |
| `backend/config/urls.py` | 🟡 1 (doit intégrer les vues customs) |
| `frontend/src/pages/ProgramDetail.jsx` | 🟡 1 (pas d'erreur fetch) |
| `frontend/src/pages/Dashboard.jsx` | 🟡 3 (404 sur /my/, image null, chartData) |
| `backend/coaching/models.py` | 🟡 1 (Coach indépendant de CustomUser) |

---

> **Prochaine étape recommandée** : Nettoyer complètement `backend/payments/views.py`, ajouter la vérification "déjà payé" dans le `PaymentViewSet`, corriger `check_payment` pour filtrer par utilisateur, et supprimer ou intégrer proprement les vues flottantes (`get_user_payments`, etc.).

