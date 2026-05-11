# ⚡ CHECKLIST DE DÉPLOIEMENT - ULTRA RAPIDE

**Durée totale:** ~30 min  
**Prerequis:** Python 3.11+, Node 20+, Git

---

## 🔧 PRÉ-DÉPLOIEMENT (5 min)

- [ ] Ouvrir terminal dans `fitness-coaching-app/`
- [ ] Vérifier Django fonctionne: `cd backend && python manage.py runserver` → OK?
- [ ] Arrêter serveur Django (Ctrl+C)
- [ ] Vérifier Node fonctionne: `cd frontend && npm run dev` → OK?
- [ ] Arrêter serveur React (Ctrl+C)

---

## 🗄️ ÉTAPE 1: MIGRATIONS DJANGO (10 min)

```bash
# Terminal 1: Backend
cd backend

# Créer migrations
python manage.py makemigrations coaching
# ✅ Vérifier: "2 new migrations for 'coaching'"

python manage.py makemigrations payments
# ✅ Vérifier: "2 new migrations for 'payments'"

# Appliquer migrations
python manage.py migrate
# ✅ Vérifier: "OK" à la fin

# Tester endpoints
python manage.py runserver

# Dans nouveau terminal, tester:
# curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/coaches/
# ✅ Vérifier: JSON inclut "image_url", "availability"
```

---

## 📄 ÉTAPE 2: METTRE À JOUR DASHBOARD (5 min)

**Option A: Copier-coller complet**
1. Ouvrir `frontend/src/pages/Dashboard.jsx`
2. Sélectionner tout le contenu (Ctrl+A)
3. Supprimer
4. Ouvrir `Dashboard.jsx.NEW`
5. Copier tout (Ctrl+A, Ctrl+C)
6. Coller dans Dashboard.jsx (Ctrl+V)
7. Sauvegarder (Ctrl+S)

**Option B: Modifications manuelles**
1. Ajouter après imports:
   ```javascript
   const [paidCoaches, setPaidCoaches] = useState([]);
   ```
2. Ajouter dans useEffect existant:
   ```javascript
   const coachesRes = await fetch(`${API_BASE_URL}/payments/my-coaches/`, {
     headers: { Authorization: `Bearer ${token}` }
   });
   if (coachesRes.ok) {
     setPaidCoaches(await coachesRes.json());
   }
   ```
3. Ajouter avant `</main>` (fin du component):
   ```javascript
   <section className="section">
     <h2>Mes coachs ({paidCoaches.length})</h2>
     {paidCoaches.length === 0 ? (
       <p>Aucun coach ajouté. Explorez les profils disponibles!</p>
     ) : (
       <div className="grid-2">
         {paidCoaches.map(coach => (
           <CoachCard
             key={coach.coach}
             coach={{ ...coach, id: coach.coach, image_url: coach.coach_image }}
             onViewProfile={() => navigate(`/coach/${coach.coach}`)}
           />
         ))}
       </div>
     )}
   </section>
   ```

---

## 🧑‍💼 ÉTAPE 3: MODIFIER COACH.JSX (5 min)

**Copier-coller ce code dans Coach.jsx:**

```javascript
// Après les autres useState (ligne ~15)
const [paidCoaches, setPaidCoaches] = useState([]);

// Ajouter dans useEffect existant (fonction qui charge coach):
useEffect(() => {
  const loadPaidCoaches = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/payments/my-coaches/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPaidCoaches((await res.json()).map(p => p.coach));
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };
  loadPaidCoaches();
}, [token]);

// NOUVEAU: Ajouter cette fonction après les autres handlers (ligne ~200)
const handlePayCoach = async () => {
  if (!coach) return;
  try {
    const res = await fetch(`${API_BASE_URL}/payments/create-coach-session/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coach_id: coach.user,
        amount: coach.price,
        description: `Séance coaching avec ${coach.name}`
      })
    });
    
    if (res.ok) {
      toast.success("✨ Coaching activé!");
      setPaidCoaches([...paidCoaches, coach.user]);
      navigate("/dashboard");
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur paiement");
    }
  } catch (error) {
    toast.error("Erreur lors du paiement");
  }
};

// Dans le rendu, trouver le bouton paiement et remplacer par:
<button
  onClick={handlePayCoach}
  disabled={paidCoaches.includes(coach?.user)}
  className="btn-primary"
>
  {paidCoaches.includes(coach?.user) 
    ? "✓ Coaching actif" 
    : `Payer ${coach?.price} DH`}
</button>

// Trouver l'image du coach et remplacer par:
<img
  src={coach?.image_url || "/default-coach.jpg"}
  alt={coach?.name}
  className="coach-image"
/>
```

---

## 💬 ÉTAPE 4: MODIFIER MESSAGES.JSX (5 min)

**Copier-coller ce code:**

```javascript
// Après autres useState (ligne ~10)
const [myCoaches, setMyCoaches] = useState([]);
const [selectedCoachId, setSelectedCoachId] = useState(null);

// Ajouter nouveau useEffect après les autres:
useEffect(() => {
  if (!token) return;
  
  const loadCoaches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/my-coaches/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyCoaches(data);
        if (data.length > 0) setSelectedCoachId(data[0].coach);
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };
  
  loadCoaches();
}, [token]);

// Ajouter ce useEffect pour charger messages par coach:
useEffect(() => {
  if (!selectedCoachId || !token) return;
  
  const loadMessages = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/messages/with-coach/?coach_id=${selectedCoachId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };
  
  loadMessages();
}, [selectedCoachId, token]);

// Dans le rendu, ajouter AVANT la liste des messages:
<select 
  value={selectedCoachId || ""} 
  onChange={(e) => setSelectedCoachId(Number(e.target.value))}
  className="select-coach"
>
  <option value="">Choisir un coach...</option>
  {myCoaches.map(coach => (
    <option key={coach.coach} value={coach.coach}>
      {coach.coach_name}
    </option>
  ))}
</select>

// Dans handleSendMessage, ajouter au body:
body: JSON.stringify({
  receiver: selectedCoachId,
  coach: selectedCoachId,
  content: messageContent
})
```

---

## 👥 ÉTAPE 5: MODIFIER COACHDASHBOARD.JSX (5 min)

**Copier-coller ce code:**

```javascript
// Après autres useState (ligne ~10)
const [myClients, setMyClients] = useState([]);

// Ajouter ce useEffect:
useEffect(() => {
  if (!token) return;
  
  const loadClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/my-clients/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyClients(await res.json());
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };
  
  loadClients();
}, [token]);

// Ajouter AVANT </div> (avant fin du component):
<section className="section coach-clients">
  <h2>Mes clients payants ({myClients.length})</h2>
  {myClients.length === 0 ? (
    <p>Aucun client n'a encore payé pour vos séances.</p>
  ) : (
    <div className="clients-grid">
      {myClients.map(sub => (
        <div key={sub.id} className="client-card">
          <h3>{sub.user_username}</h3>
          <p>État: {sub.status === 'active' ? '✓ Actif' : '⏰ Expiré'}</p>
          <p>Fin: {new Date(sub.end_date).toLocaleDateString()}</p>
          <button onClick={() => navigate('/messages')}>
            Envoyer message
          </button>
        </div>
      ))}
    </div>
  )}
</section>
```

---

## ✅ ÉTAPE 6: TESTER (5 min)

**Terminal 1: Backend**
```bash
cd backend
python manage.py runserver
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

**Dans le navigateur:**
1. Ouvrir http://localhost:5173
2. Login comme CLIENT
   - [ ] Aller /coaches → See coaches
   - [ ] Click sur un coach
   - [ ] Vérifier image charge (elle vient de /api/coaches/)
   - [ ] Cliquer "Payer"
   - [ ] Toast "✨ Coaching activé" apparaît
   - [ ] Naviguer /dashboard
   - [ ] Coach doit apparaître en bas
   - [ ] Cliquer "Voir le profil" → retour page coach
   - [ ] Vérifier bouton = "✓ Coaching actif"

3. Aller /messages
   - [ ] Dropdown "Choisir un coach"
   - [ ] Sélectionner le coach payé
   - [ ] Écrire et envoyer message
   - [ ] Message disparaît → réappelle liste

4. Login comme COACH
   - [ ] Aller /coach-dashboard
   - [ ] Section "Mes clients payants" doit avoir le client
   - [ ] Cliquer "Envoyer message"

---

## 🐛 TROUBLESHOOTING

**Erreur: ModuleNotFoundError**
```
Solution: pip install -r backend/requirements.txt
```

**Erreur: Static files not found**
```bash
python manage.py collectstatic --noinput
```

**Image ne charge pas**
```
Vérifier: Media folder settings in settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

**Token expiré**
```
F12 → Application → localStorage → Supprimer token
Refaire login
```

**Endpoint /api/payments/my-coaches/ retourne erreur 404**
```
Vérifier: backend/payments/urls.py a les 2 nouvelles routes
Vérifier: backend/config/urls.py inclut payments.urls
```

---

## 📊 CHECKLIST FINALE

### Backend ✅
- [ ] Migrations lancées sans erreur
- [ ] Serveur démarre: http://127.0.0.1:8000/api/coaches/
- [ ] Endpoint /coaches/ retourne image_url, availability
- [ ] Endpoint /payments/create-coach-session/ fonctionne (test via Postman)
- [ ] Endpoint /payments/my-coaches/ retourne coachs payés

### Frontend ✅
- [ ] Dashboard affiche coachs payés
- [ ] Image charge correctement
- [ ] Bouton paiement fonctionne
- [ ] Status "Coaching actif" s'affiche après paiement
- [ ] Messages filtrent par coach
- [ ] CoachDashboard affiche clients

### Fonctionnel ✅
- [ ] Client peut payer coach
- [ ] Coach apparaît dans dashboard
- [ ] Impossible de payer 2x même coach
- [ ] Messages triés par coach
- [ ] Coach voit ses clients
- [ ] Navigation fonctionne

---

## 🎉 SI TOUT EST VERT = SUCCÈS!

Vous avez réussi la refactorisation! 🚀

**Prochaine étape (optionnel):**
- Ajouter upload image dans Django admin
- Implémenter notifications email
- Ajouter historique paiements

---

**Créé le 11 Mai 2026**  
**Durée totale: 30 minutes environ**  
**Dificulté: FACILE ⭐⭐**
