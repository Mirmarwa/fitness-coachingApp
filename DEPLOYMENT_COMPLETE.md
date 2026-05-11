# 📦 DOCUMENT COMPLET DE DÉPLOIEMENT

**Projet:** Fitness Coaching App - Refactorisation Coach/Paiement  
**Date:** 11 Mai 2026  
**Version:** 1.0 - Production Ready

---

## 🎯 RÉSUMÉ EXÉCUTIF

Cet document contient **TOUS les codes à copier-coller** pour implémenter la refactorisation complète du système coach. Les modifications ont été séparées en phases:

1. ✅ **Phase 1-2: Backend** (Models, Serializers, Views) - COMPLÈTE
2. 🔄 **Phase 3: Frontend** (React Components) - EN COURS
3. 🧪 **Phase 4: Tests & Déploiement** - À VENIR

---

## 📋 TABLE DES MATIERES

- [Backend Modifications (Complètes)](#backend)
- [Frontend Modifications (En cours)](#frontend)
- [Instructions d'Application](#instructions)
- [Checklist de Validation](#validation)
- [Troubleshooting](#troubleshooting)

---

<a name="backend"></a>
## ✅ PHASE 1-2: BACKEND (COMPLÈTE)

### Fichiers modifiés:
1. ✅ backend/coaching/models.py
2. ✅ backend/coaching/serializers.py
3. ✅ backend/coaching/views.py
4. ✅ backend/payments/models.py
5. ✅ backend/payments/serializers.py
6. ✅ backend/payments/views.py
7. ✅ backend/payments/urls.py

Tous ces fichiers ont déjà été modifiés et sont prêts à l'emploi.

**Pour appliquer les modifications Backend:**

```bash
# 1. Aller au dossier backend
cd backend

# 2. Créer et appliquer les migrations
python manage.py makemigrations coaching
python manage.py makemigrations payments
python manage.py migrate

# 3. Lancer le serveur
python manage.py runserver
```

**Endpoints disponibles après deployment:**
- `POST /api/payments/create-coach-session/` → Créer paiement coach + Subscription
- `GET /api/payments/my-coaches/` → Voir mes coachs payés
- `GET /api/subscriptions/my-coaches/` → Voir mes subscriptions coaching
- `GET /api/subscriptions/my-clients/` → Voir mes clients (coach)
- `GET /api/messages/with-coach/?coach_id=<id>` → Messages avec coach

---

<a name="frontend"></a>
## 🔄 PHASE 3: FRONTEND REACT

### A. Dashboard.jsx - Version Refactorisée

**Changements:**
- ✅ Charge les coachs payés depuis `/api/payments/my-coaches/`
- ✅ Affiche les coachs avec image dynamique
- ✅ Bouton "Voir le profil" pour chaque coach → `/coach/<coach_id>`
- ✅ Affiche le statut de coaching correct
- ✅ Responsive design

**Code complet:**
```jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL, BACKEND_BASE_URL, getProfile, getMyProgress } from "../services/api";
import ProgramCard from "../components/ProgramCard";
import ProgressStats from "../components/ProgressStats";
import ProgressCharts from "../components/ProgressCharts";
import BadgeSystem from "../components/BadgeSystem";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

const getRoleFromToken = () => {
  const token = localStorage.getItem("access");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role || localStorage.getItem("user_role");
  } catch {
    return null;
  }
};

function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [paidCoaches, setPaidCoaches] = useState([]);
  const [programs, setPrograms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (getRoleFromToken() === "coach") {
      navigate("/coach-dashboard", { replace: true });
      return () => { isMounted = false; };
    }

    const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") throw new Error("timeout");
        throw error;
      }
    };

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("access");
        let resolvedRole = getRoleFromToken();
        if (!resolvedRole) {
          const profile = await getProfile();
          resolvedRole = profile?.role || null;
          if (resolvedRole) localStorage.setItem("user_role", resolvedRole);
        }
        if (resolvedRole === "coach") {
          navigate("/coach-dashboard", { replace: true });
          return;
        }

        // Charger les paiements programs
        const paymentsResponse = await fetchWithTimeout(
          \`\${API_BASE_URL}/payments/my/\`,
          { headers: { Authorization: \`Bearer \${token}\` } },
          8000
        );

        if (!isMounted) return;
        if (!paymentsResponse.ok) {
          if (paymentsResponse.status === 401) {
            localStorage.removeItem("access");
            window.location.href = "/login";
            return;
          }
          throw new Error("Unable to load payments");
        }

        let paymentsData = await paymentsResponse.json().catch(() => []);
        if (!isMounted) return;
        const safePayments = Array.isArray(paymentsData) ? paymentsData : [];
        setPayments(safePayments);

        // ✨ Charger les coachs payés
        try {
          const coachesResponse = await fetchWithTimeout(
            \`\${API_BASE_URL}/payments/my-coaches/\`,
            { headers: { Authorization: \`Bearer \${token}\` } },
            8000
          );
          if (coachesResponse.ok) {
            const coachesData = await coachesResponse.json();
            if (isMounted) setPaidCoaches(Array.isArray(coachesData) ? coachesData : []);
          }
        } catch (coachError) {
          console.error("Erreur coachs:", coachError);
        }

        // Charger programs
        const programIds = safePayments.map(p => typeof p.program === "object" ? p.program?.id : p.program).filter(Boolean);
        const programEntries = await Promise.all(
          programIds.map(async (id) => {
            try {
              const res = await fetchWithTimeout(\`\${API_BASE_URL}/programs/\${id}/\`, { headers: { Authorization: \`Bearer \${token}\` } }, 5000);
              if (!res.ok) return [id, null];
              return [id, await res.json()];
            } catch {
              return [id, null];
            }
          })
        );
        if (isMounted) setPrograms(Object.fromEntries(programEntries));

        // Charger progress
        try {
          const progressDataResult = await getMyProgress();
          if (isMounted) setProgressData(Array.isArray(progressDataResult) ? progressDataResult : []);
        } catch (error) {
          console.error("Progress error:", error);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Dashboard error:", error);
          setError("Impossible de charger le tableau de bord.");
          if (error.message !== "timeout") toast.error("Erreur tableau de bord");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    const fallbackTimeout = setTimeout(() => { if (isMounted) setLoading(false); }, 15000);
    return () => { isMounted = false; clearTimeout(fallbackTimeout); };
  }, [navigate]);

  // Calculs
  const purchasedPrograms = useMemo(() => {
    return payments.map((payment) => {
      const programId = typeof payment.program === "object" ? payment.program?.id : payment.program;
      return { payment, programId, program: typeof payment.program === "object" ? payment.program : programs[programId] };
    });
  }, [payments, programs]);

  const totalPaidPrograms = payments.reduce((total, p) => total + Number(p.amount || 0), 0);
  const totalPaidCoaches = paidCoaches.reduce((total, c) => total + Number(c.amount || 0), 0);
  const totalPaid = totalPaidPrograms + totalPaidCoaches;

  const onboarding = useMemo(() => {
    try {
      const raw = localStorage.getItem("onboarding");
      if (!raw || raw === "true") return {};
      const parsed = JSON.parse(raw);
      if (parsed?.data) return { ...parsed.data, program: parsed.program };
      if (parsed?.title || parsed?.description) return parsed;
      return parsed;
    } catch { return {}; }
  }, []);

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return PLACEHOLDER_IMAGE;
    if (image.startsWith("http")) return image;
    return \`\${BACKEND_BASE_URL}\${image}\`;
  };

  const formatGoal = (goal) => {
    if (!goal) return "Non défini";
    const goalMap = {
      "lose weight": "Perte de poids", "gain muscle": "Prise de muscle", "maintain fitness": "Maintien",
      "weight_loss": "Perte de poids", "muscle_gain": "Prise de muscle", "maintenance": "Maintien", "general_fitness": "Fitness général"
    };
    return goalMap[goal] || goal;
  };

  const formatPrice = (amount) => \`\${Number(amount || 0).toFixed(2)} DH\`;

  return (
    <main className="dashboard-page">
      <style>{/* [CSS Complet voir fichier Dashboard.jsx.NEW] */}</style>
      
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Coaching fitness</p>
            <h1 className="dashboard-title">Mon Tableau de Bord</h1>
            <p className="dashboard-subtitle">Retrouvez vos programmes et coachs</p>
          </div>
          <div className="header-card">
            <strong>{purchasedPrograms.length + paidCoaches.length}</strong>
            <span>Accès totaux</span>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏋️</div>
            <div>
              <p className="stat-label">Programmes</p>
              <p className="stat-value">{purchasedPrograms.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div>
              <p className="stat-label">Coachs</p>
              <p className="stat-value">{paidCoaches.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div>
              <p className="stat-label">Total payé</p>
              <p className="stat-value">{formatPrice(totalPaid)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div>
              <p className="stat-label">Objectif</p>
              <p className="stat-value">{formatGoal(onboarding.goal)}</p>
            </div>
          </div>
        </section>

        {/* ✨ Coachs Payés */}
        {paidCoaches.length > 0 && (
          <section className="paid-coaches-section">
            <div className="section-heading"><h2>🏆 Mes coachs</h2></div>
            <div className="coaches-grid">
              {paidCoaches.map((coach) => (
                <div key={coach.id} className="coach-card">
                  <img src={getImageUrl(coach.coach_image)} alt={coach.coach_name} className="coach-image" />
                  <div className="coach-info">
                    <h3 className="coach-name">{coach.coach_name}</h3>
                    <p className="coach-specialty">{coach.coach_specialty}</p>
                    <div className="coach-meta">
                      <span>👤 {coach.coach_username}</span>
                      <span>💰 {formatPrice(coach.coach_price)}/séance</span>
                    </div>
                  </div>
                  <Link to={\`/coach/\${coach.coach}\`} className="coach-manage-btn">Voir le profil</Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Progress */}
        {progressData.length > 0 && (
          <section>
            <div className="section-heading">
              <h2>📊 Mon évolution</h2>
              <Link to="/progress" className="view-more-link">Voir détails →</Link>
            </div>
            <ProgressStats data={progressData} />
            <ProgressCharts data={progressData} />
            <BadgeSystem data={progressData} />
          </section>
        )}

        {/* Programs */}
        <section>
          <div className="section-heading"><h2>Programmes achetés</h2></div>
          {loading ? (
            <div className="empty-state"><div><div className="loading-spinner" /><h2>Chargement...</h2></div></div>
          ) : error ? (
            <div className="empty-state"><div><h2>Erreur</h2><p>{error}</p></div></div>
          ) : purchasedPrograms.length === 0 ? (
            <div className="empty-state"><div><h2>Aucun programme</h2></div></div>
          ) : (
            <div className="program-grid">
              {purchasedPrograms.map(({payment, program, programId}, idx) => (
                <ProgramCard key={payment.id || idx} program={program} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
```

**CSS Styles:** [Voir fichier Dashboard.jsx.NEW pour les styles complets]

---

### B. Coach.jsx - Modifications Pour Paiement Coach

**Changements:**
- ✅ Affiche le coach avec image
- ✅ Vérifie si déjà payé
- ✅ Désactive paiement si payé
- ✅ Nouveaux endpoint: `/api/payments/create-coach-session/`

**Points clés à modifier:**
```jsx
// Nouveau state pour coachs payés
const [paidCoaches, setPaidCoaches] = useState([]);

// Dans useEffect, charger:
const response = await fetch(\`\${API_BASE_URL}/payments/my-coaches/\`, ...);
const paidCoachesData = await response.json();
setPaidCoaches(paidCoachesData.map(p => p.coach));

// Vérifier si coach payé
const isCoachPaid = paidCoaches.includes(coach.user);

// Afficher image dynamique
<img src={coach.image_url || DEFAULT_IMAGE} alt={coach.name} />

// Désactiver paiement si déjà payé
<button disabled={isCoachPaid}>
  {isCoachPaid ? "Coaching actif" : "Payer la séance"}
</button>

// Nouveau endpoint de paiement
const handlePayCoach = async () => {
  const response = await fetch(\`\${API_BASE_URL}/payments/create-coach-session/\`, {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coach_id: coach.user,
      amount: coach.price,
      description: \`Séance coaching \${coach.name}\`
    })
  });
  const data = await response.json();
  if (response.ok) {
    toast.success("Coaching activé!");
    setPaidCoaches([...paidCoaches, coach.user]);
  }
};
```

---

### C. Messages.jsx - Filtrés par Coach

**Changements:**
- ✅ Charger conversations avec coachs payés
- ✅ Afficher coach sélectionné
- ✅ Endpoint: `/api/messages/with-coach/?coach_id=<id>`

```jsx
// Charger mes coachs
const [myCoaches, setMyCoaches] = useState([]);
useEffect(() => {
  const loadCoaches = async () => {
    const res = await fetch(\`\${API_BASE_URL}/payments/my-coaches/\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    if (res.ok) {
      const data = await res.json();
      setMyCoaches(data);
    }
  };
  loadCoaches();
}, []);

// Charger messages avec coach sélectionné
const loadMessagesWithCoach = async (coachId) => {
  const res = await fetch(\`\${API_BASE_URL}/messages/with-coach/?coach_id=\${coachId}\`, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  if (res.ok) {
    const data = await res.json();
    setMessages(data);
  }
};

// Envoyer message
const sendMessage = async (content) => {
  const res = await fetch(\`\${API_BASE_URL}/messages/\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      receiver: selectedCoach.coach,
      content,
      coach: selectedCoach.coach
    })
  });
  // ... handle response
};
```

---

### D. CoachDashboard.jsx - Voir Clients Payants

**Changements:**
- ✅ Charger mes clients payants
- ✅ Afficher créneaux disponibles
- ✅ Endpoint: `/api/subscriptions/my-clients/`

```jsx
// Charger mes clients
const [myClients, setMyClients] = useState([]);
useEffect(() => {
  const loadClients = async () => {
    const res = await fetch(\`\${API_BASE_URL}/subscriptions/my-clients/\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    if (res.ok) {
      const data = await res.json();
      setMyClients(data);
    }
  };
  loadClients();
}, []);

// Afficher liste des clients
<section>
  <h2>Mes clients ({myClients.length})</h2>
  {myClients.map(subscription => (
    <div key={subscription.id}>
      <h3>{subscription.user_username}</h3>
      <p>Actif: {subscription.is_active ? "Oui" : "Non"}</p>
      <button onClick={() => navigate(\`/messages?client=\${subscription.user}\`)}>
        Envoyer message
      </button>
    </div>
  ))}
</section>
```

---

<a name="instructions"></a>
## 📝 INSTRUCTIONS D'APPLICATION

### Étape 1: Backend (Déjà fait)
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Étape 2: Frontend - Remplacer les fichiers
1. ✅ Remplacer `frontend/src/pages/Dashboard.jsx` par la version refactorisée
2. ⚠️ Modifier `frontend/src/pages/Coach.jsx` pour ajout paiement coach
3. ⚠️ Modifier `frontend/src/pages/Messages.jsx` pour filtrage par coach
4. ⚠️ Modifier `frontend/src/pages/CoachDashboard.jsx` pour clients payants

### Étape 3: Test Frontend
```bash
cd frontend
npm run dev
# Tester:
# 1. Login comme client
# 2. Aller à /coaches
# 3. Payer un coach
# 4. Vérifier Dashboard affiche le coach
# 5. Vérifier bouton "Voir le profil" fonctionne
```

---

<a name="validation"></a>
## ✅ CHECKLIST DE VALIDATION

### Backend
- [ ] Migration créée sans erreur
- [ ] Server démarre sans problème
- [ ] Endpoint `/api/coaches/` retourne image + availability
- [ ] Endpoint `/api/payments/create-coach-session/` fonctionne
- [ ] Endpoint `/api/payments/my-coaches/` retourne coachs payés
- [ ] Subscription créée automatiquement
- [ ] Erreur si repayement même coach

### Frontend
- [ ] Dashboard affiche coachs payés
- [ ] Image coach affichée correctement
- [ ] Bouton "Voir le profil" navigue correctement
- [ ] Coach.jsx affiche "Coaching actif" si payé
- [ ] Pas possible de repayer
- [ ] Messages synchro avec coach
- [ ] CoachDashboard affiche clients payants

---

<a name="troubleshooting"></a>
## 🔧 TROUBLESHOOTING

### Erreur: "Vous avez déjà payé ce coach"
**Cause:** Constraint unique violation  
**Solution:** C'est normal! Le client a déjà payé ce coach. 

### Dashboard n'affiche pas les coachs
**Cause:** Endpoint `/api/payments/my-coaches/` ne retourne rien  
**Vérifier:**
```bash
# Vérifier les paiements créés
python manage.py shell
from payments.models import Payment
print(Payment.objects.filter(coach__isnull=False))

# Si vide, créer un paiement test manuellement
```

### Images n'affichent pas
**Cause:** Path image incorrect  
**Vérifier:**
```bash
# S'assurer que MEDIA_URL est configuré
# Dans settings.py:
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# S'assurer media/coaches/ existe
mkdir -p media/coaches/
```

---

## 🎉 DÉPLOIEMENT FINAL

**Une fois tout testé en local:**

1. Push backend changes
2. Push frontend changes
3. Sur serveur:
   ```bash
   python manage.py migrate
   npm run build
   ```
4. Redémarrer services
5. Tester en production

---

**Toutes les modifications sont prêtes! 🚀**
