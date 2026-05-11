# 🧪 Guide de Test - Système Coachs

## 📖 Vue d'ensemble

Ce guide vous montre **exactement** comment tester chaque correction.

---

## 🛠️ Setup Préalable

### 1. Démarrer le Backend
```bash
cd backend
# Si virtual env pas actif:
source venv/Scripts/activate  # Windows: .\venv\Scripts\Activate

python manage.py runserver
# À voir: "Starting development server at http://127.0.0.1:8000/"
```

### 2. Démarrer le Frontend
```bash
# Autre terminal
cd frontend
npm run dev
# À voir: "Local: http://localhost:5173"
```

### 3. Accéder l'app
```
http://localhost:5173
```

---

## 🧪 Test 1: Affichage Coachs (Données Réelles)

### Objectif
Vérifier que la page `/coaches` affiche UNIQUEMENT les coachs réels du backend.

### Étapes

**Étape 1: Voir la page**
```
1. Aller à http://localhost:5173/coaches
2. Devrait voir: "Chargement..."
3. Après 1-2 sec: Liste de coachs
```

**Étape 2: Vérifier données réelles**
```
Pour CHAQUE coach affiché, vérifier:
✓ Username (pas de nom fictif)
✓ Email (adresse réelle)
✓ Spécialité (pas vide)
✓ Expérience (nombre >= 0)
✓ Prix (nombre ou "Gratuit")
✓ Description (texte ou "Aucune description")
```

**Étape 3: Vérifier API**
```
1. Ouvrir DevTools (F12)
2. Aller à Network tab
3. Chercher "coaches" request
4. Cliquer dessus
5. Voir dans Preview tab: JSON array
6. Chaque coach a: id, user, username, email, specialty, experience, description, price
```

**Étape 4: Aucune donnée mock**
```
1. Ouvrir DevTools > Console
2. Chercher erreur "undefined" ou "cannot read property of undefined"
3. Ne doit y avoir aucune erreur
```

### Résultat Attendu ✅
```
- Liste affichée sans erreur
- Pas de données fictives (Ahmed, Sara, Yassine)
- Données viennent de /api/coaches/
- Console clean (pas d'erreur)
```

---

## 🧪 Test 2: Filtre par Spécialité

### Objectif
Vérifier que le filtre dynamique fonctionne sur les vraies données.

### Étapes

**Étape 1: Voir options filtre**
```
1. Sur /coaches, voir le dropdown "Filtrer par spécialité"
2. Options doivent être:
   - Tous
   - + toutes les spécialités uniques des coachs
   
Exemple:
  Tous
  Fitness
  Musculation
  Nutrition
  Perte de poids
```

**Étape 2: Filtrer**
```
1. Sélectionner une spécialité (ex: "Musculation")
2. Liste doit afficher SEULEMENT les coachs avec cette spécialité
3. Sélectionner "Tous"
4. Tous les coachs réapparaissent
```

**Étape 3: Filtre vide**
```
1. Si aucun coach n'a la spécialité sélectionnée
2. Affiche: "Aucun coach trouvé"
3. Pas d'erreur
```

### Résultat Attendu ✅
```
- Filtres extraits des vraies données
- Filtre fonctionne correctement
- Pas d'erreur
```

---

## 🧪 Test 3: Créer un Coach et le Voir en Liste

### Objectif
Vérifier que un nouveau coach créé apparaît immédiatement.

### Étapes

**Étape 1: Créer un compte coach**
```
1. Aller à http://localhost:5173/register
2. Remplir:
   - Username: "coach_test_001"
   - Email: "coach001@test.com"
   - Role: "Coach" (dropdown)
   - Password: "Secure123456"
   - Confirm Password: "Secure123456"
3. Cliquer "S'inscrire"
4. Voir: "Inscription réussie"
5. Redirection auto vers /coach-dashboard
```

**Étape 2: Aller à /coaches**
```
1. Cliquer menu → Coachs
2. Ou aller à /coaches directement
3. Chercher le nouveau coach dans la liste:
   - Username: coach_test_001
   - Email: coach001@test.com
```

**Étape 3: Si pas visible**
```
1. Rafraîchir la page (F5)
2. Le nouveau coach doit apparaître
```

**Étape 4: Vérifier données remplies**
```
Le coach affiche:
✓ Username: coach_test_001
✓ Email: coach001@test.com
✓ Spécialité: "Non renseigné" (normal, pas encore modifiée)
✓ Expérience: 0 ans
✓ Prix: Gratuit
✓ Description: "Aucune description"
```

### Résultat Attendu ✅
```
- Coach créé = visible dans liste après refresh
- Données cohérentes avec ce qui a été enregistré
```

---

## 🧪 Test 4: Modifier Profil Coach

### Objectif
Vérifier que le coach peut modifier son profil.

### Étapes

**Étape 1: Se connecter en tant que coach**
```
1. Aller à /login
2. Username: coach_test_001
3. Password: Secure123456
4. Cliquer "Se connecter"
5. Voir dashboard coach
```

**Étape 2: Aller au profil**
```
1. Menu → Mon Profil (ou /profile)
2. Voir: "Profil coach" (titre)
3. Voir 4 champs éditables:
   ✓ Spécialité (input text)
   ✓ Expérience (input number)
   ✓ Tarif (input number)
   ✓ Description (textarea)
```

**Étape 3: Remplir les champs**
```
Entrer:
- Spécialité: "Musculation"
- Expérience: 5
- Tarif: 250
- Description: "Coaching spécialisé en musculation et prise de masse"
```

**Étape 4: Sauvegarder**
```
1. Cliquer "Sauvegarder les modifications"
2. Voir toast: "Profil coach sauvegardé avec succès!"
3. Bouton doit afficher "Sauvegarder..." pendant la sauvegarde
```

**Étape 5: Vérifier persistance**
```
1. Rafraîchir la page (/profile)
2. Voir les données modifiées dans les champs:
   - Spécialité: Musculation
   - Expérience: 5
   - Tarif: 250
   - Description: Coaching spécialisé...
```

**Étape 6: Vérifier affichage coachs**
```
1. Aller à /coaches
2. Chercher coach_test_001
3. Voir les données modifiées affichées:
   - Username: coach_test_001
   - Spécialité: Musculation ✓
   - Expérience: 5 ans ✓
   - Prix: 250 MAD ✓
   - Description: Coaching spécialisé... ✓
```

### Résultat Attendu ✅
```
- Profile coach éditable (pas statique)
- Sauvegarde fonctionne (PATCH endpoint)
- Données persistées en DB
- Affichées correctement sur /coaches
```

---

## 🧪 Test 5: Vérifier Aucune Donnée Mock

### Objectif
Confirmer que AUCUNE donnée fictive n'est hardcodée.

### Étapes

**Étape 1: Arrêter le backend**
```
1. Aller au terminal backend
2. Ctrl+C (arrêter le serveur)
3. Voir: "^CKeyboardInterrupt"
```

**Étape 2: Vérifier /coaches**
```
1. Aller à http://localhost:5173/coaches
2. Attendre le timeout (~10 sec)
3. Devrait voir:
   - Message d'erreur
   - Pas de coachs affichés
   - PAS "Ahmed", "Sara", "Yassine" (mock hardcodés)
```

**Étape 3: Redémarrer backend**
```
1. Retourner terminal backend
2. python manage.py runserver
3. Page /coaches doit se recharger automatiquement
4. Voir de nouveau la vraie liste
```

### Résultat Attendu ✅
```
- Sans backend = pas de coachs (pas hardcodés)
- Quand backend revient = coachs réapparaissent
- Confirme: données viennent 100% de l'API
```

---

## 🧪 Test 6: Page Accueil (CoachPreview)

### Objectif
Vérifier que la home page affiche aussi les vraies données.

### Étapes

**Étape 1: Aller à l'accueil**
```
1. http://localhost:5173/ (ou clique home)
2. Scroller vers le bas
3. Section "Nos coachs" affiche 3 coachs
```

**Étape 2: Vérifier données**
```
Les 3 coachs doivent avoir:
✓ Username réel
✓ Spécialité correcte
✓ Prix affiché
✓ Pas de données fictives
```

### Résultat Attendu ✅
```
- Home page utilise données réelles
- 3 premiers coachs de /api/coaches/
- Pas de hardcodage
```

---

## 🧪 Test 7: Erreur Validation

### Objectif
Vérifier que la validation fonctionne correctement.

### Étapes

**Étape 1: Essayer sauvegarder sans spécialité**
```
1. /profile (connecté coach)
2. Laisser "Spécialité" vide
3. Cliquer "Sauvegarder"
4. Toast rouge: "La spécialité est requise"
```

**Étape 2: Expérience invalide**
```
1. Mettre "abc" dans Expérience
2. Cliquer "Sauvegarder"
3. Toast rouge: "L'expérience doit être un nombre valide"
```

**Étape 3: Prix invalide**
```
1. Mettre "-50" dans Tarif
2. Cliquer "Sauvegarder"
3. Toast rouge: "Le prix doit être un nombre valide"
```

### Résultat Attendu ✅
```
- Validation fonctionne
- Messages d'erreur clairs
- Pas de sauvegarde invalide
```

---

## ✅ Résumé Checklist

Après tous les tests, vous devriez avoir:

- [x] Page /coaches affiche vraies données (pas mock)
- [x] Filtre par spécialité fonctionne
- [x] Nouveau coach créé = visible en liste
- [x] Profile coach éditable (4 champs)
- [x] Sauvegarde persiste en DB
- [x] Home page affiche vraies données
- [x] Sans backend = pas de données
- [x] Validation fonctionne
- [x] Pas d'erreur console
- [x] Prêt pour soutenance ✅

---

## 🆘 Troubleshooting

### Problem: "Aucun coach disponible"
**Solution:** Créer au moins un coach (register + role=coach)

### Problem: Erreur "Cannot read property..."
**Solution:** Ouvrir console, voir l'erreur exacte, rapporter

### Problem: Données ne se mettent pas à jour
**Solution:** 
1. Rafraîchir la page (F5)
2. Vérifier que la PATCH request est 200 OK
3. Vérifier console backend

### Problem: Backend timeout
**Solution:**
1. Vérifier que Django tourne: `python manage.py runserver`
2. Vérifier URL: http://127.0.0.1:8000/api/

---

**Prêt à tester ? Commencez par le Test 1 ! 🚀**
