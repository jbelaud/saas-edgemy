# 🧪 Guide de test - Système de paiement Edgemy

**Date:** 16 novembre 2025

---

## ⚡ Test rapide (5 minutes)

### Prérequis

```bash
# 1. Variables d'environnement configurées
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...

# 2. Base de données à jour
pnpm exec prisma db push

# 3. Serveur démarré
pnpm dev
```

### Option 1: Script automatisé

```bash
# Test du flow complet (simulation)
pnpm exec tsx scripts/test-payment-flow.ts
```

**Ce que fait le script:**
1. ✅ Trouve un coach avec Stripe Connect
2. ✅ Trouve un joueur
3. ✅ Crée une réservation de test
4. ✅ Crée un PaymentIntent Stripe
5. ✅ Simule le webhook `checkout.session.completed`
6. ✅ Vérifie que `transferStatus = PENDING` (argent gelé)
7. ✅ Simule la fin de session
8. ✅ Vérifie les données finales
9. ✅ Nettoie les données de test

**Résultat attendu:**
```
✅ TEST RÉUSSI - Flow de paiement validé !
🎯 Nouveau système vérifié:
   ✅ Paiement créé SANS transfer_data
   ✅ Argent gelé (transferStatus: PENDING)
   ✅ Commission Edgemy calculée correctement
   ✅ Gains coach enregistrés
   ✅ Protection: pas de transfer avant endDate
```

### Option 2: Test manuel via l'interface

#### Étape 1: Démarrer Stripe CLI (terminal 1)

```bash
# Télécharger et installer Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases
# macOS: brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Note:** Copiez le `whsec_...` affiché et ajoutez-le dans `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Étape 2: Créer une réservation (navigateur)

1. Connectez-vous en tant que **joueur**
2. Allez sur la page d'un coach
3. Sélectionnez une session ou un pack
4. Cliquez sur "Réserver"

#### Étape 3: Payer avec Stripe Test Mode

**Carte de test:** `4242 4242 4242 4242`
- Date d'expiration: n'importe quelle date future (ex: `12/30`)
- CVC: n'importe quel nombre à 3 chiffres (ex: `123`)
- Code postal: n'importe lequel (ex: `75001`)

#### Étape 4: Vérifier le paiement

**Dans le terminal Stripe CLI:**
```
✅ checkout.session.completed [evt_...]
```

**Dans la base de données:**
```sql
SELECT
  id,
  status,
  paymentStatus,
  transferStatus,
  stripePaymentId,
  priceCents,
  coachEarningsCents
FROM "Reservation"
WHERE stripePaymentId IS NOT NULL
ORDER BY createdAt DESC
LIMIT 1;
```

**Résultat attendu:**
```
status: CONFIRMED
paymentStatus: PAID
transferStatus: PENDING ✅  ← Argent gelé !
```

#### Étape 5: Compléter la session

**Option A: Modifier la date de fin en BDD (pour test)**

```sql
-- Mettre endDate dans le passé
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 minute'
WHERE id = 'votre_reservation_id';
```

**Option B: Attendre la vraie fin de session**

Attendez simplement que l'heure de fin soit passée.

#### Étape 6: Appeler l'API de complétion

**Via curl (terminal):**
```bash
# Récupérer votre token de session (cookie better-auth.session_token)
# Méthode 1: Via les DevTools du navigateur (Application > Cookies)
# Méthode 2: Se connecter via l'app et copier le cookie

curl -X POST http://localhost:3000/api/reservations/[RESERVATION_ID]/complete \
  -H "Cookie: better-auth.session_token=VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

**Via l'interface (si implémentée):**
```
Page coach → Mes sessions → Marquer comme complétée
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Session complétée et paiement transféré au coach",
  "transfer": {
    "transferId": "tr_...",
    "amount": 5000,
    "amountEuros": 50,
    "transferredAt": "2025-11-20T15:05:00Z"
  }
}
```

#### Étape 7: Vérifier le transfer

**Dans Stripe Dashboard:**
1. Allez sur [https://dashboard.stripe.com/test/transfers](https://dashboard.stripe.com/test/transfers)
2. Vérifiez qu'un transfer apparaît
3. Montant = `coachEarningsCents` (sans la commission Edgemy)

**Dans la base de données:**
```sql
SELECT
  id,
  status,
  transferStatus,
  stripeTransferId,
  transferredAt
FROM "Reservation"
WHERE id = 'votre_reservation_id';
```

**Résultat attendu:**
```
status: COMPLETED
transferStatus: TRANSFERRED ✅
stripeTransferId: tr_...
transferredAt: 2025-11-20 15:05:00
```

**Dans les logs de transfer:**
```sql
SELECT * FROM "TransferLog"
WHERE reservationId = 'votre_reservation_id'
ORDER BY createdAt DESC;
```

**Résultat attendu:**
```
amount: 5000
stripeTransferId: tr_...
status: paid
transferType: session_completion
```

---

## 🎯 Test d'un pack (20 minutes)

### Étape 1: Créer et acheter un pack

1. Connectez-vous en tant que **joueur**
2. Trouvez un coach avec un pack d'heures
3. Achetez le pack (ex: 3 heures à 150€)
4. Payez avec `4242 4242 4242 4242`

### Étape 2: Vérifier la création du pack

```sql
SELECT
  id,
  sessionsTotalCount,
  sessionsCompletedCount,
  transferStatus,
  coachEarningsCents,
  sessionPayoutCents
FROM "CoachingPackage"
WHERE stripePaymentId IS NOT NULL
ORDER BY createdAt DESC
LIMIT 1;
```

**Résultat attendu:**
```
sessionsTotalCount: 3
sessionsCompletedCount: 0
transferStatus: PENDING
coachEarningsCents: 15000  (150€)
sessionPayoutCents: 5000   (50€ par session)
```

### Étape 3: Compléter la première session

```sql
-- Trouver la première session du pack
SELECT r.id, r.endDate, ps.status
FROM "Reservation" r
JOIN "PackageSession" ps ON ps.reservationId = r.id
WHERE ps.packageId = 'votre_package_id'
ORDER BY r.startDate ASC
LIMIT 1;

-- Mettre endDate dans le passé
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 minute'
WHERE id = 'premiere_session_id';
```

```bash
# Compléter la session
curl -X POST http://localhost:3000/api/reservations/[PREMIERE_SESSION_ID]/complete \
  -H "Cookie: better-auth.session_token=VOTRE_TOKEN"
```

**Vérifier le résultat:**
```sql
SELECT
  sessionsTotalCount,
  sessionsCompletedCount,
  transferStatus
FROM "CoachingPackage"
WHERE id = 'votre_package_id';
```

**Résultat attendu:**
```
sessionsTotalCount: 3
sessionsCompletedCount: 1
transferStatus: PARTIALLY_TRANSFERRED ✅
```

**Vérifier le transfer:**
```sql
SELECT amount, transferType, status
FROM "TransferLog"
WHERE reservationId = 'premiere_session_id';
```

**Résultat attendu:**
```
amount: 5000  (50€)
transferType: pack_session_payout
status: paid
```

### Étape 4: Compléter les sessions 2 et 3

Répétez l'étape 3 pour chaque session.

**Après la 2e session:**
```
sessionsCompletedCount: 2
transferStatus: PARTIALLY_TRANSFERRED
```

**Après la 3e session (dernière):**
```
sessionsCompletedCount: 3
transferStatus: FULLY_TRANSFERRED ✅
status: COMPLETED ✅
```

**Total des transfers:**
```sql
SELECT SUM(amount) as total, COUNT(*) as count
FROM "TransferLog"
WHERE reservationId IN (
  SELECT id FROM "Reservation" WHERE packId = 'votre_package_id'
);
```

**Résultat attendu:**
```
total: 15000  (150€ au total)
count: 3      (3 transfers)
```

---

## 🐛 Tests d'erreurs

### Test 1: Session pas encore terminée

```bash
# Créer une réservation qui se termine dans le futur
# Essayer de compléter

curl -X POST http://localhost:3000/api/reservations/[ID]/complete \
  -H "Cookie: better-auth.session_token=TOKEN"
```

**Réponse attendue:**
```json
{
  "error": "La session n'est pas encore terminée",
  "minutesRemaining": 15,
  "endDate": "2025-11-20T16:00:00Z"
}
```
**Status:** `400 Bad Request` ✅

### Test 2: Double transfer

```bash
# Compléter une session
curl -X POST http://localhost:3000/api/reservations/[ID]/complete -H "Cookie: ..."

# Essayer de compléter à nouveau
curl -X POST http://localhost:3000/api/reservations/[ID]/complete -H "Cookie: ..."
```

**Réponse attendue:**
```json
{
  "error": "Le transfer est déjà TRANSFERRED",
  "transferStatus": "TRANSFERRED",
  "transferredAt": "2025-11-20T15:05:00Z"
}
```
**Status:** `400 Bad Request` ✅

### Test 3: Coach sans Stripe Connect

```sql
-- Créer un coach sans stripeAccountId
INSERT INTO coach (id, userId, firstName, lastName, ...)
VALUES (...);

-- Créer une réservation pour ce coach
-- Payer
-- Essayer de compléter
```

**Réponse attendue:**
```json
{
  "error": "Le coach n'a pas configuré son compte Stripe Connect"
}
```
**Status:** `400 Bad Request` ✅

### Test 4: Utilisateur non autorisé

```bash
# Se connecter en tant qu'un autre joueur
# Essayer de compléter la session d'un autre

curl -X POST http://localhost:3000/api/reservations/[ID]/complete \
  -H "Cookie: autre_token"
```

**Réponse attendue:**
```json
{
  "error": "Vous n'avez pas la permission de compléter cette session"
}
```
**Status:** `403 Forbidden` ✅

---

## 📊 Vérifications de santé

### Check 1: Webhooks Stripe fonctionnent

```bash
# Stripe CLI doit afficher
✅ checkout.session.completed
✅ payment_intent.succeeded
```

**Si aucun événement ne s'affiche:**
```bash
# Vérifier que Stripe CLI est bien démarré
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Vérifier la variable d'env
echo $STRIPE_WEBHOOK_SECRET
```

### Check 2: Pas de transfer immédiat

**Après un paiement, vérifier dans Stripe Dashboard:**
- ✅ Payment Intent: Succeeded
- ❌ Transfer: Aucun (car argent gelé)

**C'est normal !** Le transfer se fait uniquement après `/complete`.

### Check 3: Montants corrects

```sql
-- Vérifier qu'il n'y a pas d'incohérence
SELECT
  id,
  priceCents,
  coachEarningsCents,
  commissionCents,
  coachEarningsCents + commissionCents as should_equal_price
FROM "Reservation"
WHERE paymentStatus = 'PAID'
AND (coachEarningsCents + commissionCents) != priceCents;
```

**Résultat attendu:** Aucune ligne (0 incohérence) ✅

### Check 4: Logs d'audit complets

```sql
-- Chaque transfer doit avoir un log
SELECT
  r.id,
  r.transferStatus,
  COUNT(tl.id) as transfer_logs_count
FROM "Reservation" r
LEFT JOIN "TransferLog" tl ON tl.reservationId = r.id
WHERE r.transferStatus = 'TRANSFERRED'
GROUP BY r.id, r.transferStatus
HAVING COUNT(tl.id) = 0;
```

**Résultat attendu:** Aucune ligne ✅

---

## 🚀 Checklist avant production

### Configuration

- [ ] `STRIPE_SECRET_KEY` = clé de production (`sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` = secret de production
- [ ] Webhooks Stripe configurés en production
- [ ] URL webhook: `https://app.edgemy.fr/api/stripe/webhook`

### Tests de validation

- [ ] Test paiement session unique avec vraie carte
- [ ] Test paiement pack avec vraie carte
- [ ] Test complétion session après endDate
- [ ] Vérifier transfer visible dans Stripe Dashboard
- [ ] Vérifier montants corrects (coach + commission = total)

### Sécurité

- [ ] Signature webhook vérifiée
- [ ] Permissions API `/complete` vérifiées
- [ ] Comptes Stripe Connect validés (pas de mock)
- [ ] Logs d'audit en place

### Monitoring

- [ ] Stripe Dashboard configuré
- [ ] Alertes pour transfers échoués
- [ ] Métriques de commissions trackées

---

## 💡 Commandes utiles

### Trouver une réservation récente

```sql
SELECT id, status, paymentStatus, transferStatus, createdAt
FROM "Reservation"
ORDER BY createdAt DESC
LIMIT 5;
```

### Voir tous les transfers en attente

```sql
SELECT
  id,
  CONCAT(coach.firstName, ' ', coach.lastName) as coach,
  player.name as player,
  coachEarningsCents / 100.0 as earnings_euros,
  endDate
FROM "Reservation" r
JOIN coach ON coach.id = r.coachId
JOIN user player ON player.id = r.playerId
WHERE r.transferStatus = 'PENDING'
AND r.paymentStatus = 'PAID'
ORDER BY endDate ASC;
```

### Voir l'historique des transfers

```sql
SELECT
  tl.createdAt,
  tl.amount / 100.0 as amount_euros,
  tl.status,
  tl.transferType,
  r.id as reservation_id
FROM "TransferLog" tl
JOIN "Reservation" r ON r.id = tl.reservationId
ORDER BY tl.createdAt DESC
LIMIT 10;
```

### Calculer les commissions Edgemy du mois

```sql
SELECT
  DATE_TRUNC('month', createdAt) as month,
  SUM(edgemyFeeCents) / 100.0 as total_commission_euros,
  COUNT(*) as reservations_count
FROM "Reservation"
WHERE paymentStatus = 'PAID'
AND createdAt >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', createdAt);
```

---

## 🆘 Dépannage

### Problème: Webhook ne fonctionne pas

**Symptômes:**
- Paiement Stripe réussi mais réservation reste en `PENDING`

**Solutions:**
1. Vérifier que Stripe CLI est démarré: `stripe listen ...`
2. Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env`
3. Regarder les logs du serveur Next.js
4. Tester la signature: `stripe trigger checkout.session.completed`

### Problème: Transfer échoue

**Symptômes:**
- Erreur lors de `/complete`
- `TransferLog` avec `status: failed`

**Solutions:**
1. Vérifier que le coach a un compte Stripe Connect valide
2. Vérifier que le `stripePaymentId` existe
3. Vérifier les logs Stripe Dashboard > Transfers
4. Vérifier le solde de la plateforme (doit avoir assez de fonds)

### Problème: Montants incorrects

**Symptômes:**
- Commission trop élevée/faible
- Total joueur incorrect

**Solutions:**
1. Vérifier les variables d'env:
   ```env
   STRIPE_PERCENT_FEE=1.5
   EDGEMY_SESSION_PERCENT=5
   EDGEMY_PACK_FIXED_CENTS=300
   EDGEMY_PACK_PERCENT=2
   ```
2. Vérifier `src/lib/stripe/pricing.ts`
3. Recalculer manuellement: `coachPrice + stripeFee + edgemyFee = totalPlayer`

---

**✅ Bon test !**
