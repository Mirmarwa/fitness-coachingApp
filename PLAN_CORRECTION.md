# 🔧 Plan de Correction — Bugs Paiements & Logique

## Objectif
Corriger tous les bugs identifiés dans `BUGS_ET_ERREURS.md`, en priorité le système de paiements.

---

## Étape 1 : Nettoyer `backend/payments/views.py`
- Supprimer les imports dupliqués
- Supprimer la fonction `create` flottante (code mort)
- Supprimer les fonctions `get_payments`, `get_user_payments`, `check_payment` flottantes
- Garder uniquement le `PaymentViewSet` propre

## Étape 2 : Corriger `PaymentViewSet.create`
- Vérifier si le programme existe (`get_object_or_404`)
- Vérifier si l'utilisateur a déjà payé pour ce programme (éviter doublon)
- Créer le paiement uniquement si pas déjà payé
- Retourner une erreur 400 avec message "Déjà payé" si déjà acheté

## Étape 3 : Corriger `check_payment`
- Transformer en action DRF (`@action`) dans `PaymentViewSet`
- Filtrer par `user` ET `program_id` (pas seulement par program)
- Route : `GET /api/payments/check/?program_id=X`

## Étape 4 : Ajouter une route `my_payments`
- Ajouter une action DRF `@action(detail=False)` dans `PaymentViewSet`
- Route : `GET /api/payments/my_payments/`
- Retourne les paiements de l'utilisateur connecté

## Étape 5 : Corriger `backend/payments/models.py`
- Ajouter `Meta` avec `unique_together` ou `UniqueConstraint` sur `(user, program)`
- Empêcher la base de données d'accepter des doublons

## Étape 6 : Supprimer `backend/payments/urls.py` (obsolète)
- Le `DefaultRouter` dans `config/urls.py` gère déjà tout

## Étape 7 : Corriger le Frontend `ProgramDetail.jsx`
- Gérer l'erreur 400 "Déjà payé" pour afficher un message clair
- Gérer les erreurs de fetch programme (404)

## Étape 8 : Corriger le Frontend `Dashboard.jsx`
- Changer l'URL de `/api/payments/my/` vers `/api/payments/my_payments/`
- Gérer le cas `program.image === null`
- Corriger le calcul de `chartData` pour attendre le chargement

---

## Fichiers à modifier
1. `backend/payments/views.py` — Refonte complète
2. `backend/payments/models.py` — Ajout contrainte DB
3. `backend/payments/urls.py` — Suppression
4. `frontend/src/pages/ProgramDetail.jsx` — Gestion erreurs
5. `frontend/src/pages/Dashboard.jsx` — URL + image + chart

## Fichiers inchangés
- `backend/config/urls.py` (déjà correct avec le router)
- `backend/programs/views.py` (déjà correct avec ViewSet)

