# 🧪 GUIDE DE TEST COMPLET PRE-PRODUCTION STRIPE

**Version** : 2.0 (avec TVA et alertes)
**Date** : 20 novembre 2025

Ce guide vous permet de vérifier que l'intégration Stripe fonctionne correctement **avant le déploiement en production**.

---

## ⚡ QUICK START (10 minutes)

### 1. Tests automatiques

```bash
# Exécuter tous les tests automatiques
npx tsx scripts/run-all-tests.ts
```

**Attendu** : Tous les tests verts ✅

### 2. Tests manuels (optionnel mais recommandé)

Suivre les scénarios détaillés ci-dessous.

---

## 📋 PHASE 1 : VÉRIFICATIONS PRÉLIMINAIRES

### ✅ Checklist avant de commencer

- [ ] L'application tourne en local (`pnpm dev`)
- [ ] Stripe est en **Test Mode** (clés `sk_test_...`)
- [ ] Base de données accessible
- [ ] Migration TVA appliquée
- [ ] Variables d'environnement configurées

### 🔧 Vérification rapide

```bash
# 1. Vérifier schéma DB
npx tsx scripts/verify-db-schema.ts

# 2. Vérifier variables env
npx tsx scripts/verify-env-config.ts

# 3. Tester calculs pricing
npx tsx scripts/test-pricing-calculation.ts
```

---

## 🧪 PHASE 2 : TESTS FONCTIONNELS

### SCÉNARIO 1 : Session individuelle 100€ ⭐

**Objectif** : Vérifier le flow complet d'une session simple.

#### Étapes

1. **Créer une réservation**
   - Se connecter en tant que joueur
   - Réserver session 1h à 100€ avec un coach

2. **Payer via Stripe**
   - Carte test : `4242 4242 4242 4242`
   - CVV : `123`, Expiration : `12/30`
   - Valider le paiement

3. **Vérifier le paiement réussi**
   - [ ] Redirection vers page de succès
   - [ ] Stripe Dashboard → Payments : paiement de 105€ visible
   - [ ] Email de confirmation reçu

4. **Vérifier en base de données**

   ```sql
   SELECT
     id,
     "priceCents",              -- Prix coach (base)
     "serviceFeeCents",         -- Frais joueur (5%)
     "edgemyRevenueHT",         -- Revenu Edgemy HT
     "edgemyRevenueTVACents",   -- TVA Edgemy (20%)
     "paymentStatus",
     "transferStatus"
   FROM "Reservation"
   WHERE "playerId" = 'ID_PLAYER'
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

   **Valeurs attendues** :
   ```
   priceCents             = 10000  (100€)
   serviceFeeCents        = 500    (5€)
   edgemyRevenueHT        = 317    (3.17€)
   edgemyRevenueTVACents  = 63     (0.63€)
   paymentStatus          = 'PAID'
   transferStatus         = 'PENDING'
   ```

5. **Marquer session comme complétée**
   - Se connecter en tant que coach
   - Aller dans "Mes sessions"
   - Cliquer "Marquer comme complétée"

6. **Vérifier le transfer au coach**
   - [ ] Stripe Dashboard → Transfers : nouveau transfer de 100€
   - [ ] Destination : compte Connect du coach
   - [ ] En DB : `transferStatus = 'TRANSFERRED'`

#### ✅ Critères de réussite

| Vérification | Attendu |
|--------------|---------|
| Montant payé joueur | 105.00€ |
| Montant reçu coach | 100.00€ |
| Revenu Edgemy HT | 3.17€ |
| TVA Edgemy | 0.63€ |
| Revenu Edgemy TTC | 3.80€ |
| Frais Stripe | ~1.83€ |

---

### SCÉNARIO 2 : Pack 10h à 850€ ⭐

**Objectif** : Vérifier les packs avec calcul 3€ + 2% et paiement progressif.

#### Étapes

1. **Créer et payer un pack**
   - Réserver pack 10h à 850€
   - Payer avec carte test
   - Montant total : 870€ (850€ + 20€ de frais)

2. **Vérifier le calcul**

   ```sql
   SELECT
     "priceCents",
     "serviceFeeCents",
     "edgemyRevenueHT",
     "edgemyRevenueTVACents",
     "sessionsCount"
   FROM "Reservation"
   WHERE id = 'ID_RESERVATION';
   ```

   **Attendu** :
   ```
   priceCents             = 85000  (850€)
   serviceFeeCents        = 2000   (3€ + 2% = 20€)
   edgemyRevenueHT        = 670    (6.70€)
   edgemyRevenueTVACents  = 134    (1.34€)
   sessionsCount          = 10
   ```

3. **Compléter la 1ère session**
   - Marquer session 1 comme complétée
   - Vérifier transfer de 85€ (850 / 10)

4. **Compléter les sessions suivantes**
   - Répéter pour sessions 2-10
   - À la session 10, vérifier que le total = 850€

#### ✅ Critères de réussite

| Vérification | Attendu |
|--------------|---------|
| Montant payé joueur | 870.00€ |
| Total reçu coach | 850.00€ (85€ × 10) |
| Revenu Edgemy HT | 6.70€ |
| TVA Edgemy | 1.34€ |

---

### SCÉNARIO 3 : Remboursement ⭐

**Objectif** : Vérifier les remboursements.

#### Test A : Remboursement avant transfer

1. **Créer et payer session 50€**
2. **Annuler avant la session**
3. **Vérifier remboursement**
   - [ ] Stripe Dashboard → Refunds : 52.50€ remboursé
   - [ ] En DB : `refundStatus = 'FULL'`, `transferStatus = 'CANCELLED'`

#### Test B : Annulation tardive (<24h)

1. **Créer session dans <24h**
2. **Joueur annule**
3. **Vérifier** :
   - Remboursement partiel : 50% au joueur
   - Compensation : 50% au coach (via transfer)

---

### SCÉNARIO 4 : Abonnement PRO ⭐

**Objectif** : Vérifier Stripe Billing avec TVA.

#### Étapes

1. **S'abonner au plan PRO**
   - Se connecter en tant que coach
   - Cliquer "Passer au plan PRO - 39€/mois"
   - Payer avec carte test

2. **Vérifier Stripe Tax**
   - [ ] Stripe Dashboard → Invoices : facture avec TVA
   - [ ] Montant HT : 39.00€
   - [ ] TVA (20%) : 7.80€
   - [ ] Total TTC : 46.80€

3. **Vérifier en DB**

   ```sql
   SELECT
     "planKey",
     "subscriptionStatus",
     "subscriptionPlan",
     "currentPeriodEnd"
   FROM "coach"
   WHERE id = 'ID_COACH';
   ```

   **Attendu** :
   ```
   planKey            = 'PRO'
   subscriptionStatus = 'ACTIVE'
   subscriptionPlan   = 'MONTHLY'
   currentPeriodEnd   = [dans 1 mois]
   ```

#### ✅ Critères de réussite

- Stripe Tax activé ✅
- TVA correctement calculée (20%)
- Abonnement actif en DB

---

### SCÉNARIO 5 : Plan LITE (paiement manuel) ⭐

**Objectif** : Vérifier le flow sans Stripe Billing.

#### Étapes

1. **Activer plan LITE (coach)**

   ```bash
   curl -X POST http://localhost:3000/api/coach/subscription/activate-lite \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"paymentMethod": "WISE"}'
   ```

2. **Vérifier statut**

   ```sql
   SELECT "planKey", "subscriptionStatus", "paymentPreferences"
   FROM "coach"
   WHERE id = 'ID_COACH';
   ```

   **Attendu** :
   ```
   planKey            = 'LITE'
   subscriptionStatus = 'TRIALING'
   paymentPreferences = ['WISE']
   ```

3. **Confirmer paiement (admin)**

   ```bash
   curl -X POST http://localhost:3000/api/admin/confirm-lite-payment \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{"coachId": "xxx", "plan": "MONTHLY", "confirmed": true}'
   ```

4. **Vérifier activation**
   - `subscriptionStatus = 'ACTIVE'`
   - `currentPeriodEnd` dans 1 mois

#### ✅ Critères de réussite

- Flow manuel fonctionne
- Admin peut confirmer/refuser
- Pas de paiement Stripe (OK)

---

### SCÉNARIO 6 : Webhooks ⭐

**Objectif** : Vérifier que les webhooks fonctionnent.

#### Prérequis

```bash
# Installer Stripe CLI (si pas fait)
winget install Stripe.StripeCli

# Forwarder webhooks vers local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### Étapes

1. **Effectuer un paiement test**
2. **Observer Stripe CLI**

   **Attendu** :
   ```
   ✔ Received: checkout.session.completed
   ✔ Received: payment_intent.succeeded
   → Forwarded to localhost:3000/api/stripe/webhook
   ← Response: 200 OK
   ```

3. **Vérifier les logs application**
   ```
   ✅ Checkout session complétée pour réservation xxx
   ✅ Réservation xxx marquée comme PAID et CONFIRMED
   🔐 Vérification marge : edgemyFeeCents > 0
   ```

#### ✅ Critères de réussite

- Tous les webhooks reçus
- Réponse 200 OK
- DB mise à jour

---

### SCÉNARIO 7 : Alertes sécurité ⭐

**Objectif** : Vérifier que les alertes fonctionnent.

#### Simulation marge nulle

1. **Modifier temporairement** `.env` :
   ```env
   EDGEMY_SESSION_PERCENT=0
   ```

2. **Créer et payer session**

3. **Vérifier alerte créée**

   ```sql
   SELECT * FROM "AdminLog"
   WHERE action LIKE '%ZERO_MARGIN%'
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

   **Attendu** : Log d'alerte avec severity 'WARNING'

4. **Remettre config normale**
   ```env
   EDGEMY_SESSION_PERCENT=5
   ```

---

## 📊 PHASE 3 : REPORTING COMPTABLE

### Test export mensuel

```bash
# Générer rapport du mois en cours
npx tsx scripts/export-monthly-report.ts $(date +%Y-%m)
```

**Vérifier le fichier CSV généré** :
- [ ] Toutes les colonnes présentes
- [ ] Calculs corrects (prix coach, frais, TVA)
- [ ] Total cohérent

---

## ✅ CHECKLIST FINALE

Avant de passer en production, tous les tests doivent être ✅ :

### Paiements
- [ ] Session simple 100€ : coach reçoit 100€, marge 3.17€ HT
- [ ] Pack 850€ : coach reçoit 850€, marge 6.70€ HT
- [ ] TVA calculée et stockée (20%)
- [ ] Frais Stripe corrects (1.5% + 0.25€)

### Transfers
- [ ] Delayed transfers fonctionnent
- [ ] Transfer après session complétée
- [ ] Packs : paiement progressif
- [ ] Coach reçoit exactement le prix de base

### Remboursements
- [ ] Remboursement total avant transfer
- [ ] Remboursement partiel (<24h)

### Abonnements
- [ ] Plan PRO fonctionne
- [ ] Plan LITE fonctionne
- [ ] Stripe Tax activé
- [ ] TVA ajoutée aux factures

### Webhooks
- [ ] checkout.session.completed ✅
- [ ] payment_intent.succeeded ✅
- [ ] customer.subscription.* ✅
- [ ] transfer.* ✅
- [ ] charge.refunded ✅

### Alertes & Sécurité
- [ ] Alerte marge nulle fonctionne
- [ ] Logs admin créés
- [ ] Validations en place

### Documentation
- [ ] Runbook lu par équipe Support
- [ ] Checklist déploiement suivie

---

## 🚀 PASSAGE EN PRODUCTION

### Si tous les tests sont ✅ :

1. **Switcher vers Stripe Live**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (production)
   ```

2. **Mettre à jour Price IDs**
   - Créer les produits dans Stripe Live
   - Remplacer les `price_xxx` dans `.env`

3. **Configurer webhook production**
   - Stripe Dashboard → Webhooks
   - URL : `https://app.edgemy.fr/api/stripe/webhook`
   - Copier le nouveau `STRIPE_WEBHOOK_SECRET`

4. **Déployer**
   ```bash
   git push origin main
   # Vercel déploie automatiquement
   ```

5. **Surveiller pendant 24h**
   - Logs Vercel
   - Stripe Dashboard
   - Premier paiement réel
   - Premier transfer réel

---

## 📞 SUPPORT EN CAS DE PROBLÈME

| Problème | Solution |
|----------|----------|
| Webhook échoue | Vérifier `STRIPE_WEBHOOK_SECRET` correct |
| TVA manquante | Activer Stripe Tax dans Dashboard |
| Transfer échoué | Vérifier compte Connect coach |
| Calcul incorrect | Vérifier `STRIPE_PERCENT_FEE` et `STRIPE_FIXED_FEE_CENTS` |
| Marge négative | Vérifier formule pricing (bug de config) |

**Contact** :
- Technique : tech@edgemy.fr
- Finance : finance@edgemy.fr
- Slack : #stripe-integration

---

## 📈 MÉTRIQUES DE SUCCÈS

**Objectifs 1er mois** :
- ✅ Taux de paiement réussi > 95%
- ✅ Délai paiement coach < 48h
- ✅ Taux de remboursement < 3%
- ✅ 0 litige
- ✅ 100% conformité TVA

---

**Bon tests ! 🧪🚀**
