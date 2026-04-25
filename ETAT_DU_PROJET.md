# 📋 État Complet du Projet — Fitness Coaching App

> **Projet** : Plateforme de Coaching Sportif en Ligne  
> **Réalisé par** : El azzaoui Marwa et Tazi Ayoub  
> **Encadré par** : Kassid Asmaa  
> **Date** : Juin 2026  
> **Objectif** : Ce document résume tout ce qui a été fait jusqu'à présent, afin qu'une nouvelle personne puisse comprendre le projet et continuer le développement.

---

## 1. 🎯 Présentation Générale

L'application est une **plateforme de coaching fitness** qui met en relation des **clients** et des **coachs sportifs**. Elle permet :
- La consultation des coachs et programmes sportifs
- La création de programmes d'entraînement personnalisés
- Le suivi de progression (poids, notes)
- La gestion des paiements pour les programmes
- (À venir) Messagerie, rendez-vous, appels vidéo

---

## 2. 🏗️ Architecture Technique

Le projet est séparé en **deux parties distinctes** :

| Partie | Technologie | Détails |
|--------|-------------|---------|
| **Backend (API)** | Django 6.0.3 + Django REST Framework | API REST, base SQLite, authentification Django classique |
| **Frontend** | React 19 + Vite | Interface utilisateur, routing, styles en ligne (inline CSS) |
| **Base de données** | SQLite | Fichier `backend/db.sqlite3` |
| **Gestion médias** | Django Media | Images des programmes stockées dans `backend/media/programs/` |

### Dossiers principaux :
```
fitness-coaching-app/
├── backend/           ← Django (API + Admin)
│   ├── config/        ← Configuration du projet Django
│   ├── users/         ← Gestion des utilisateurs (CustomUser)
│   ├── programs/      ← Programmes, exercices, nutrition, progression
│   ├── payments/      ← Paiements des clients
│   ├── coaching/      ← App vide (prévue pour évolution)
│   ├── media/         ← Images uploadées
│   └── db.sqlite3     ← Base de données SQLite
├── frontend/          ← React (Interface utilisateur)
│   ├── src/pages/     ← Pages principales
│   ├── src/components/← Composants réutilisables
│   └── src/services/  ← Configuration API
├── docs/              ← Documentation (vide pour l'instant)
├── CahierDeCharge-PYTHON.docx  ← Cahier des charges complet
└── projet ppt python fr.pptx   ← Présentation du projet
```

---

## 3. ✅ Ce qui a été fait — BACKEND (Django)

### 3.1 Configuration de base (`config/`)
- **Projet Django** créé avec les apps : `users`, `programs`, `payments`, `coaching`
- **Django REST Framework** installé et configuré
- **CORS** activé (`CORS_ALLOW_ALL_ORIGINS = True`) pour permettre la communication avec le frontend
- **Modèle utilisateur personnalisé** configuré : `AUTH_USER_MODEL = 'users.CustomUser'`
- **Gestion des médias** configurée pour les images de programmes (`MEDIA_URL`, `MEDIA_ROOT`)
- **Admin Django** accessible sur `/admin/`
- **Base de données SQLite** prête à l'emploi

### 3.2 App `users/` — Gestion des utilisateurs
- **Modèle `CustomUser`** hérite de `AbstractUser`
  - Champs ajoutés :
    - `role` : choix entre `"coach"` et `"client"`
    - `phone` : numéro de téléphone (optionnel)
- **Admin Django** personnalisé pour afficher et modifier `role` et `phone`
- ⚠️ **API pas encore créée** pour l'inscription/connexion (les vues sont vides)

### 3.3 App `programs/` — Programmes sportifs
#### Modèles créés :
| Modèle | Description | Relations |
|--------|-------------|-----------|
| **`Program`** | Programme sportif (titre, description, durée en jours, image) | Clé étrangère vers `CustomUser` (coach) |
| **`Enrollment`** | Inscription d'un utilisateur à un programme | Clés étrangères vers `CustomUser` et `Program` |
| **`Exercise`** | Exercice dans un programme (nom, description, séries, répétitions) | Clé étrangère vers `Program` |
| **`NutritionPlan`** | Plan nutritionnel (titre, calories, protéines, glucides, lipides) | Clé étrangère vers `Program` |
| **`Progress`** | Suivi de progression (poids, notes, date) | Clés étrangères vers `CustomUser` et `Program` |

#### API REST créée (`programs/urls.py`) :
- `GET /api/programs/` → Liste de tous les programmes
- `GET /api/programs/<id>/` → Détail d'un programme avec ses exercices et plans nutrition

#### Serializers :
- **`ProgramSerializer`** : inclut automatiquement les exercices et nutrition_plans imbriqués
- **`ExerciseSerializer`** et **`NutritionPlanSerializer`** : serializers détaillés

#### Admin Django :
- Tous les modèles sont enregistrés dans l'admin
- `ProgramAdmin` personnalisé avec `list_display = ('title', 'duration', 'coach')`

#### Migrations effectuées :
- Création initiale des tables
- Ajout progressif des modèles (Exercise, NutritionPlan, Progress, image sur Program, etc.)

### 3.4 App `payments/` — Paiements
#### Modèle créé :
| Modèle | Description |
|--------|-------------|
| **`Payment`** | Paiement d'un utilisateur pour un programme (montant, statut, date) | Clés étrangères vers `User` et `Program` |

- Statuts possibles : `pending`, `completed`, `failed`

#### API REST créée (`payments/urls.py`) :
| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/payments/` | Liste de tous les paiements |
| `POST` | `/api/payments/create/` | Créer un paiement (statut forcé à "completed") |
| `GET` | `/api/payments/my/` | Paiements de l'utilisateur connecté |
| `GET` | `/api/payments/check/<program_id>/` | Vérifier si l'utilisateur a payé pour un programme |

#### Admin Django :
- Modèle `Payment` enregistré dans l'admin

### 3.5 App `coaching/`
- **App créée mais vide** — prévue pour les fonctionnalités futures (messagerie, rendez-vous, appels vidéo)

---

## 4. ✅ Ce qui a été fait — FRONTEND (React + Vite)

### 4.1 Configuration
- **Vite** comme outil de build
- **React Router DOM** pour la navigation entre pages
- **Pas de bibliothèque CSS externe** — tous les styles sont en inline (`style={{...}}`)

### 4.2 Pages créées (`src/pages/`)

| Page | Route | Description |
|------|-------|-------------|
| **`Home`** | `/` | Page d'accueil avec présentation, programmes récupérés depuis l'API |
| **`Login`** | `/login` | Page de connexion (design premium, deux colonnes) — **non connectée au backend** |
| **`Register`** | `/register` | Page d'inscription simple — **non connectée au backend** |
| **`Coaches`** | `/coaches` | Liste des coachs avec données **statiques** (3 coachs en dur) |
| **`Dashboard`** | `/dashboard` | Espace personnel — **vide pour l'instant** |

### 4.3 Composants créés (`src/components/`)

| Composant | Rôle |
|-----------|------|
| **`Navbar`** | Barre de navigation avec liens actifs (Accueil, Coachs, Connexion, Inscription, Dashboard) |
| **`Footer`** | Pied de page simple avec copyright |
| **`HeroSection`** | Bannière d'accueil avec titre, sous-titre et boutons d'action |
| **`FeatureSection`** | 3 cartes présentant les avantages (Coaching personnalisé, Plans nutritionnels, Suivi des progrès) |
| **`CoachCard`** | Carte individuelle d'un coach (nom, spécialité, tarif, bouton) |
| **`CoachPreview`** | Section affichant 3 coachs en avantage sur la page d'accueil (données statiques) |

### 4.4 Services (`src/services/`)
- **`api.js`** : Définit simplement l'URL de base de l'API (`http://127.0.0.1:8000/api`)

### 4.5 Fonctionnement actuel du frontend
- Sur la **page d'accueil**, les programmes sont **récupérés dynamiquement** depuis le backend via `fetch("http://127.0.0.1:8000/api/programs/")`
- Les autres pages affichent du **contenu statique** ou des formulaires non fonctionnels

---

## 5. 🗄️ Base de données (SQLite)

La base de données `db.sqlite3` est créée et les migrations sont appliquées. Les tables suivantes existent :
- `users_customuser` (table utilisateurs avec rôle et téléphone)
- `programs_program` (programmes avec image)
- `programs_enrollment` (inscriptions)
- `programs_exercise` (exercices)
- `programs_nutritionplan` (plans nutritionnels)
- `programs_progress` (suivi de progression)
- `payments_payment` (paiements)
- Tables Django standards (sessions, admin, auth, etc.)

### Images uploadées
Quelques images de programmes ont été téléchargées dans `backend/media/programs/`.

---

## 6. 📋 Cahier des charges — Écart et reste à faire

Le cahier des charges (`CahierDeCharge-PYTHON.docx`) prévoit les fonctionnalités suivantes. Voici l'état d'avancement :

| Fonctionnalité | État | Commentaire |
|----------------|------|-------------|
| **Gestion des comptes** (inscription, auth, profil) | 🟡 Partiel | Modèle utilisateur OK, mais pas d'API auth ni connexion frontend |
| **Consultation des coachs** | 🟡 Partiel | Page Coaches statique, pas de données backend |
| **Abonnement à un coach** | 🟡 Partiel | Modèle `Enrollment` existe mais pas d'API ni logique d'abonnement |
| **Gestion des programmes** | ✅ Fait | API CRUD liste/détail, modèles complets |
| **Suivi de progression** | 🟡 Partiel | Modèle `Progress` existe mais pas d'API ni interface |
| **Messagerie** | ❌ Non fait | App `coaching` vide, aucun modèle Message |
| **Gestion des rendez-vous** | ❌ Non fait | Aucun modèle RendezVous créé |
| **Appel vidéo** | ❌ Non fait | Prévu pour Version 3 |
| **Paiements** | 🟡 Partiel | API paiements créée mais simplifiée (statut forcé à "completed") |
| **Tableau de bord** | ❌ Non fait | Page Dashboard vide |
| **Recherche / filtrage coachs** | ❌ Non fait | |
| **Statistiques de progression** | ❌ Non fait | |
| **Notes / avis sur les coachs** | ❌ Non fait | |

**Légende** : ✅ Fait | 🟡 Partiel | ❌ Non fait

---

## 7. 🚨 Problèmes connus / Bugs à corriger

1. **URL programs incorrecte** (`backend/programs/urls.py`)
   - `path('api/programs/<int:id>/', get_programs)` devrait être `get_program_detail`
   - De plus, cette route est en double (préfixe `api/` déjà dans `config/urls.py`)

2. **Authentification non configurée**
   - Les vues de paiement utilisent `request.user` mais il n'y a pas de système d'authentification JWT ou session configuré côté API
   - Le frontend n'envoie aucun token d'authentification

3. **Pas de fichier `requirements.txt`**
   - Les dépendances Python ne sont pas listées (Django, DRF, corsheaders...)

4. **Frontend non connecté au backend pour auth**
   - Les formulaires Login et Register sont purement visuels (pas de `fetch` vers l'API)

5. **Pas de gestion d'état global**
   - Pas de React Context, Redux ou Zustand — l'état utilisateur n'est pas partagé entre les composants

6. **Données statiques sur la page Coaches**
   - Les coachs sont codés en dur dans le composant, ils ne viennent pas de la base de données

---

## 8. 🚀 Comment lancer le projet

### Backend (Django)
```bash
cd backend
# Activer l'environnement virtuel (s'il existe)
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Installer les dépendances (si requirements.txt existe)
pip install django djangorestframework django-cors-headers

# Lancer le serveur
python manage.py runserver
```
L'API sera disponible sur `http://127.0.0.1:8000/`
L'admin sur `http://127.0.0.1:8000/admin/`

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
L'application sera disponible sur `http://localhost:5173/`

---

## 9. 📁 Structure détaillée des fichiers

```
fitness-coaching-app/
├── .gitignore
├── README.md
├── CahierDeCharge-PYTHON.docx
├── projet ppt python fr.pptx
├── ETAT_DU_PROJET.md          ← CE FICHIER
│
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py         ← Configuration Django
│   │   ├── urls.py             ← Routes principales (admin, api/)
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── users/
│   │   ├── models.py           ← CustomUser (role, phone)
│   │   ├── admin.py            ← Admin personnalisé
│   │   ├── apps.py
│   │   └── migrations/
│   ├── programs/
│   │   ├── models.py           ← Program, Exercise, NutritionPlan, Progress, Enrollment
│   │   ├── serializers.py      ← ProgramSerializer, ExerciseSerializer, NutritionPlanSerializer
│   │   ├── views.py            ← get_programs, get_program_detail
│   │   ├── urls.py             ← Routes /api/programs/
│   │   ├── admin.py            ← Admin programs
│   │   ├── apps.py
│   │   └── migrations/         ← 7 migrations appliquées
│   ├── payments/
│   │   ├── models.py           ← Payment
│   │   ├── serializers.py      ← PaymentSerializer
│   │   ├── views.py            ← create_payment, get_payments, get_user_payments, check_payment
│   │   ├── urls.py             ← Routes /api/payments/
│   │   ├── admin.py
│   │   ├── apps.py
│   │   └── migrations/
│   ├── coaching/               ← App vide (prévue pour évolution)
│   └── media/programs/         ← Images des programmes
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── eslint.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              ← Router principal
│   │   ├── pages/
│   │   │   ├── Home.jsx         ← Accueil + fetch programmes API
│   │   │   ├── Login.jsx        ← Design connexion (non connecté)
│   │   │   ├── Register.jsx     ← Inscription (non connectée)
│   │   │   ├── Coaches.jsx      ← Liste coachs statique
│   │   │   └── Dashboard.jsx    ← Vide
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── FeatureSection.jsx
│   │   │   ├── CoachCard.jsx
│   │   │   └── CoachPreview.jsx
│   │   ├── services/
│   │   │   └── api.js           ← URL base API
│   │   └── assets/
│   └── public/
│
└── docs/
    └── .gitkeep
```

---

## 10. 💡 Recommandations pour la suite

Pour reprendre le projet efficacement, voici les étapes prioritaires suggérées :

### Priorité Haute
1. **Corriger le bug d'URL** dans `backend/programs/urls.py`
2. **Créer un `requirements.txt`** pour documenter les dépendances Python
3. **Implémenter l'authentification JWT** (ex: `djangorestframework-simplejwt`)
4. **Connecter le frontend au backend** pour Login / Register
5. **Créer une API pour les utilisateurs** (liste des coachs, profil, etc.)

### Priorité Moyenne
6. **Finaliser le Dashboard** avec les programmes achetés et le suivi de progression
7. **Créer les modèles et API pour les rendez-vous**
8. **Créer le modèle et API pour la messagerie**
9. **Permettre l'inscription à un programme** (lien entre Enrollment et Payment)

### Priorité Basse
10. **Ajouter la recherche/filtrage** des coachs et programmes
11. **Intégrer les statistiques de progression** (graphiques)
12. **Appels vidéo** (lien Google Meet ou intégration Twilio/Jitsi)
13. **Déployer** l'application (ex: Render pour le backend, Vercel pour le frontend)

---

## 11. 📞 Informations de contact / Contexte

- **Équipe actuelle** : 2 personnes (développement initial)
- **Besoin** : Une personne supplémentaire pour accélérer le développement des fonctionnalités manquantes (auth, messagerie, rendez-vous, dashboard)
- **Niveau technique attendu** : Connaissances en Django REST Framework et React
- **Projet académique** : Projet de fin d'année (Python)

---

> **Document rédigé pour donner une vision complète et immédiate du projet à toute personne rejoignant l'équipe.**

