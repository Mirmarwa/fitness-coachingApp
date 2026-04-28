# TODO Corrections Bugs Critiques

## Diagnostic
- [x] Analyse complète des fichiers backend/frontend
- [x] Identification des 6 problèmes majeurs

## Corrections à appliquer

### 1. frontend/src/services/api.js
- [ ] Changer `localStorage.getItem("access")` → `localStorage.getItem("token")`
- [ ] Exporter `API_BASE_URL`

### 2. frontend/src/App.jsx
- [ ] Wrapper `/dashboard` dans `<PrivateRoute>`

### 3. frontend/src/pages/Dashboard.jsx
- [ ] Importer `API_BASE_URL` depuis `../services/api`
- [ ] Remplacer `fetch` par `authFetch` pour les programmes

### 4. frontend/src/pages/ProgramDetail.jsx
- [ ] Importer `API_BASE_URL` depuis `../services/api`
- [ ] Corriger POST paiement : envoyer `program` au lieu de `program_id`
- [ ] Corriger le check payment (ne pas chaîner `.then` qui retourne undefined)

### 5. frontend/src/components/PrivateRoute.jsx
- [ ] Vérifier cohérence (déjà utilisant "token", OK)

## Tests
- [ ] Connexion OK
- [ ] Dashboard affiche les programmes achetés
- [ ] Paiement fonctionne
- [ ] Navigation protégée OK

