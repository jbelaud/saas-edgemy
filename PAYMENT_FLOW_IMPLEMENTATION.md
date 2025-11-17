# 🎯 Implémentation du Flow de Paiement Edgemy avec Gel des Fonds

**Date:** 14 janvier 2025
**Auteur:** Claude Code
**Objectif:** Système complet de paiement avec gel des fonds jusqu'à la fin de session

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture actuelle vs. Nouvelle architecture](#architecture)
3. [Changements Prisma](#changements-prisma)
4. [Flow de paiement détaillé](#flow-de-paiement)
5. [API Routes implémentées](#api-routes)
6. [Règles métier](#règles-métier)
7. [Diagrammes](#diagrammes)

---

## 🔍 Vue d'ensemble

### Problème actuel

L'implémentation actuelle utilise `transfer_data.destination` dans Stripe Checkout, ce qui **transfert immédiatement** l'argent au coach dès le paiement validé. Cela pose problème pour :

- ❌ Gérer les annulations
- ❌ Gérer les remboursements partiels
- ❌ Débloquer l'argent seulement après la session
- ❌ Gérer les packs (paiement progressif)

### Solution implémentée

✅ **Nouveau flow Stripe recommandé pour marketplaces** :

1. Le joueur paie → **argent gelé dans le solde Edgemy**
2. Session terminée → **transfer manuel via `stripe.transfers.create()`**
3. Le coach reçoit l'argent **après validation de la session**

---

## 🏗️ Architecture

### Ancien flow (AVANT)

```
Joueur paie
    ↓
Stripe Checkout (transfer_data)
    ↓
💰 Coach reçoit IMMÉDIATEMENT
    ↓
❌ Impossible d'annuler/rembourser proprement
```

### Nouveau flow (APRÈS)

```
Joueur paie
    ↓
Stripe Checkout (payment_intent_data SANS transfer)
    ↓
💰 Argent GELÉ dans solde Edgemy
    ↓
Session COMPLETED (API call après session)
    ↓
stripe.transfers.create() → Coach reçoit
```

---

## 🗄️ Changements Prisma

### Nouveaux champs dans `Reservation`

```prisma
model Reservation {
  // ... champs existants

  // Nouveau système de paiement
  stripeTransferId     String?           // ID du transfer vers le coach
  transferStatus       TransferStatus    @default(PENDING) // Statut du transfer
  transferredAt        DateTime?         // Date du transfer au coach

  // Remboursements
  refundStatus         RefundStatus      @default(NONE)
  refundAmount         Int?              // Montant remboursé (centimes)
  refundReason         String?           // Raison du remboursement
  refundedAt           DateTime?         // Date du remboursement

  // Annulation
  cancelledBy          CancelledBy?      // COACH ou PLAYER
  cancellationReason   String?           // Raison annulation
  cancelledAt          DateTime?         // Date annulation

  // Relations
  refundLogs           RefundLog[]
  transferLogs         TransferLog[]
}

// Nouveau modèle pour logs de remboursement
model RefundLog {
  id              String   @id @default(cuid())
  reservationId   String
  amount          Int      // Montant remboursé (centimes)
  reason          String
  stripeRefundId  String
  createdAt       DateTime @default(now())

  reservation     Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)

  @@index([reservationId])
}

// Nouveau modèle pour logs de transfer
model TransferLog {
  id              String   @id @default(cuid())
  reservationId   String
  amount          Int      // Montant transféré (centimes)
  stripeTransferId String
  status          String   // pending, paid, failed
  createdAt       DateTime @default(now())

  reservation     Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)

  @@index([reservationId])
}

// Nouveaux enums
enum TransferStatus {
  PENDING        // En attente de la session
  TRANSFERRED    // Transféré au coach
  FAILED         // Échec du transfer
  CANCELLED      // Annulé (remboursement)
}

enum RefundStatus {
  NONE           // Pas de remboursement
  PARTIAL        // Remboursement partiel
  FULL           // Remboursement total
}

enum CancelledBy {
  COACH
  PLAYER
}
```

### Modifications dans `CoachingPackage`

```prisma
model CoachingPackage {
  // ... champs existants

  // Nouveau système de paiement progressif
  firstSessionCompleted Boolean @default(false) // 1ère session = 50% payé
  firstTransferId       String?                 // ID transfer 50%
  finalTransferId       String?                 // ID transfer 50% final
  transferStatus        PackageTransferStatus @default(PENDING)
}

enum PackageTransferStatus {
  PENDING              // Aucun transfer
  FIRST_TRANSFERRED    // 50% transféré après 1ère session
  FULLY_TRANSFERRED    // 100% transféré
}
```

---

## 💳 Flow de paiement détaillé

### 1. Session unique (SINGLE)

#### Paiement

```typescript
// POST /api/stripe/create-session
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card', 'link'],
  line_items: [{ ... }],

  // ❌ PLUS DE transfer_data !
  payment_intent_data: {
    application_fee_amount: commission, // Commission Edgemy
    // L'argent reste dans le solde Edgemy
    metadata: {
      reservationId,
      coachId,
      type: 'SINGLE',
    },
  },

  metadata: {
    reservationId,
    type: 'SINGLE',
  },
});
```

#### Webhook - Paiement confirmé

```typescript
// Webhook: checkout.session.completed
case 'checkout.session.completed': {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      transferStatus: 'PENDING', // Argent gelé
    },
  });

  // Créer salon Discord
  await createDiscordChannel(reservationId);
}
```

#### Déblocage après session

```typescript
// POST /api/reservations/:id/complete
// Appelé APRÈS la session (manuellement ou via cron)

// 1. Vérifier que la session est terminée
if (new Date() < reservation.endDate) {
  return error('Session pas encore terminée');
}

// 2. Transférer au coach
const transfer = await stripe.transfers.create({
  amount: reservation.coachEarningsCents,
  currency: 'eur',
  destination: coach.stripeAccountId,
  source_transaction: reservation.stripePaymentId,
  metadata: {
    reservationId,
    type: 'session_completion',
  },
});

// 3. Mettre à jour BDD
await prisma.reservation.update({
  where: { id: reservationId },
  data: {
    status: 'COMPLETED',
    transferStatus: 'TRANSFERRED',
    stripeTransferId: transfer.id,
    transferredAt: new Date(),
  },
});

// 4. Log
await prisma.transferLog.create({
  data: {
    reservationId,
    amount: reservation.coachEarningsCents,
    stripeTransferId: transfer.id,
    status: 'paid',
  },
});
```

### 2. Pack d'heures (PACK)

#### Paiement du pack

```typescript
// Paiement 100% du pack à l'achat
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card', 'link'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: `Pack ${totalHours}h - ${coachName}`,
      },
      unit_amount: totalAmountCents, // Prix total pack
    },
    quantity: 1,
  }],

  payment_intent_data: {
    application_fee_amount: commissionCents,
    metadata: {
      packageId,
      coachId,
      type: 'PACK',
      sessionsCount,
      sessionPayoutCents,
    },
  },
});
```

#### Versement après chaque session

**Règle métier** : le coach est payé **à chaque session consommée**.

```typescript
// POST /api/reservations/:id/complete
// Appelé après CHAQUE session du pack

const package = await prisma.coachingPackage.findUnique({
  where: { id: reservation.packageSession.packageId },
});

const { perSessionAmount, remainder } = calculatePackTransferAmounts(
  package.coachEarningsCents,
  package.sessionsTotalCount,
);

let transferAmount = perSessionAmount;
if (nextCompletedCount === package.sessionsTotalCount) {
  transferAmount += remainder; // Verse le reliquat sur la dernière session
}

const { transferId } = await createStripeTransfer({
  amount: transferAmount,
  destinationAccountId: coach.stripeAccountId,
  sourceTransaction: package.stripePaymentId,
  reservationId,
  transferType: TRANSFER_TYPES.PACK_SESSION_PAYOUT,
});

await prisma.coachingPackage.update({
  where: { id: package.id },
  data: {
    sessionsCompletedCount: nextCompletedCount,
    transferStatus: nextCompletedCount === package.sessionsTotalCount
      ? 'FULLY_TRANSFERRED'
      : 'PARTIALLY_TRANSFERRED',
    finalTransferId: nextCompletedCount === package.sessionsTotalCount ? transferId : undefined,
    finalTransferredAt: nextCompletedCount === package.sessionsTotalCount ? new Date() : undefined,
  },
});
```

---

## 🚫 Annulations et Remboursements

### Annulation par le joueur

#### Règles

- **+24h avant** → Remboursement 100%
- **-24h avant** → Remboursement 50%, coach reçoit 50%

```typescript
// POST /api/reservations/:id/cancel
// Body: { cancelledBy: 'PLAYER', reason: '...' }

const hoursUntilSession = (reservation.startDate - Date.now()) / (1000 * 60 * 60);

if (hoursUntilSession >= 24) {
  // Remboursement 100%
  const refund = await stripe.refunds.create({
    payment_intent: reservation.stripePaymentId,
    amount: reservation.priceCents, // Tout rembourser
    reason: 'requested_by_customer',
  });

  await prisma.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledBy: 'PLAYER',
      cancelledAt: new Date(),
      refundStatus: 'FULL',
      refundAmount: reservation.priceCents,
      transferStatus: 'CANCELLED',
    },
  });
} else {
  // Remboursement 50%, coach reçoit 50%
  const halfAmount = Math.round(reservation.priceCents / 2);

  // Remboursement joueur
  await stripe.refunds.create({
    payment_intent: reservation.stripePaymentId,
    amount: halfAmount,
    reason: 'requested_by_customer',
  });

  // Transfer coach (compensation annulation tardive)
  const coachCompensation = Math.round(reservation.coachEarningsCents / 2);
  await stripe.transfers.create({
    amount: coachCompensation,
    currency: 'eur',
    destination: coach.stripeAccountId,
    source_transaction: reservation.stripePaymentId,
    metadata: {
      reservationId: id,
      type: 'cancellation_compensation',
    },
  });

  await prisma.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledBy: 'PLAYER',
      cancelledAt: new Date(),
      refundStatus: 'PARTIAL',
      refundAmount: halfAmount,
      transferStatus: 'TRANSFERRED', // Coach a reçu sa compensation
    },
  });
}
```

### Annulation par le coach

```typescript
// POST /api/reservations/:id/cancel
// Body: { cancelledBy: 'COACH', reason: '...' }

// Le joueur CHOISIT :
// Option 1: Reprogrammer
// Option 2: Remboursement total

if (playerChoice === 'reschedule') {
  // Le coach crée une nouvelle session
  // POST /api/reservations/manual-add
  // La réservation initiale reste PAID, nouvelle session créée

  await prisma.reservation.update({
    where: { id },
    data: {
      status: 'RESCHEDULED',
      cancelledBy: 'COACH',
      cancellationReason: reason,
    },
  });
} else {
  // Remboursement total au joueur
  await stripe.refunds.create({
    payment_intent: reservation.stripePaymentId,
    amount: reservation.priceCents,
    reason: 'requested_by_customer',
  });

  await prisma.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledBy: 'COACH',
      cancelledAt: new Date(),
      refundStatus: 'FULL',
      refundAmount: reservation.priceCents,
      transferStatus: 'CANCELLED',
    },
  });
}
```

### Remboursement pack

```typescript
// POST /api/packages/:id/refund

const package = await prisma.coachingPackage.findUnique({
  where: { id },
  include: { sessions: true },
});

const consumedSessions = package.sessions.filter(s => s.status === 'COMPLETED').length;
const totalSessions = package.sessions.length;

// Calcul pro-rata
const remainingRatio = (totalSessions - consumedSessions) / totalSessions;
const refundAmount = Math.round(package.priceCents * remainingRatio);

// Remboursement
await stripe.refunds.create({
  payment_intent: package.stripePaymentId,
  amount: refundAmount,
});

// Si 1ère session déjà payée au coach, on reverse
if (package.firstSessionCompleted) {
  // Le transfer est déjà fait, on peut pas le reverse
  // Dans ce cas, soit :
  // 1. On prélève sur les prochains gains du coach
  // 2. On accepte la perte (moins de 50€ généralement)
  // 3. On demande au coach de rembourser manuellement
}

await prisma.coachingPackage.update({
  where: { id },
  data: {
    status: 'CANCELLED',
    // Garder les infos de transfer déjà fait
  },
});
```

---

## 🛠️ API Routes implémentées

### 1. `/api/stripe/create-session` (REFACTORISÉ)

**Méthode:** POST
**Corps:**
```json
{
  "reservationId": "res_xxx",
  "coachName": "John Doe",
  "playerEmail": "player@example.com",
  "price": 50,
  "type": "SINGLE",
  "coachId": "coach_xxx"
}
```

**Changements:**
- ❌ Suppression de `transfer_data`
- ✅ Argent gelé dans solde Edgemy
- ✅ Ajout de Stripe Link

---

### 2. `/api/reservations/[id]/complete` (NOUVEAU)

**Méthode:** POST
**Protection:** Authentification requise (coach ou admin)
**Corps:** `{}`

**Actions:**
1. Vérifie que `endDate` est passée
2. Vérifie que `transferStatus === 'PENDING'`
3. Crée le transfer Stripe
4. Met à jour BDD
5. Crée TransferLog

**Réponse:**
```json
{
  "success": true,
  "transferId": "tr_xxx",
  "amount": 5000,
  "transferredAt": "2025-01-14T10:00:00Z"
}
```

---

### 3. `/api/reservations/[id]/cancel` (NOUVEAU)

**Méthode:** POST
**Corps:**
```json
{
  "cancelledBy": "PLAYER", // ou "COACH"
  "reason": "Empêchement de dernière minute",
  "playerChoice": "reschedule" // Si coach annule
}
```

**Actions:**
- Calcule remboursement selon règles
- Crée refund Stripe si nécessaire
- Crée transfer coach si compensation
- Met à jour BDD
- Envoie notification Discord

---

### 4. `/api/reservations/[id]/refund` (NOUVEAU)

**Méthode:** POST
**Protection:** Admin uniquement
**Corps:**
```json
{
  "amount": 2500, // en centimes
  "reason": "Problème technique"
}
```

**Actions:**
- Crée refund Stripe
- Met à jour BDD
- Crée RefundLog

---

### 5. `/api/packages/[id]/complete-session` (NOUVEAU)

**Méthode:** POST
**Corps:**
```json
{
  "sessionId": "pkg_session_xxx"
}
```

**Actions:**
- Marque la session du pack comme COMPLETED
- Vérifie si c'est la 1ère session → transfer 50%
- Vérifie si c'est la dernière → transfer 50% restant
- Met à jour CoachingPackage

---

### 6. `/api/discord/create-room` (REFACTORISÉ)

**Note:** Déjà implémenté dans `/api/discord/create-channel`, pas besoin de refaire.

---

### 7. `/api/stripe/webhook` (REFACTORISÉ)

**Événements gérés:**

```typescript
case 'checkout.session.completed': {
  // Marquer comme PAID mais transferStatus = PENDING
  // Créer Discord channel
}

case 'transfer.created':
case 'transfer.paid':
case 'transfer.failed': {
  // Logger les événements de transfer
  // Mettre à jour TransferLog
}

case 'charge.refunded': {
  // Logger le remboursement
  // Mettre à jour RefundLog
}

case 'payment_intent.payment_failed': {
  // Annuler la réservation
}
```

---

## 📐 Règles métier

### Commissions

```typescript
// src/lib/stripe/business-rules.ts

export const COMMISSION_RULES = {
  SINGLE_SESSION: {
    percent: 0.05, // 5%
  },
  PACK: {
    fixedEuros: 3, // 3€
    percent: 0.02, // 2%
  },
} as const;

export const CANCELLATION_RULES = {
  PLAYER: {
    FULL_REFUND_HOURS: 24, // +24h = 100% remboursé
    PARTIAL_REFUND_PERCENT: 0.5, // -24h = 50% remboursé
  },
  COACH: {
    PLAYER_CHOICE: true, // Le joueur choisit reschedule ou refund
  },
} as const;

export const PACK_TRANSFER_RULES = {
  FIRST_SESSION_PERCENT: 0.5, // 50% à la 1ère session
  FINAL_SESSION_PERCENT: 0.5, // 50% à la dernière
} as const;
```

---

## 📊 Diagrammes

### Flow Session Unique

```
┌─────────────┐
│   JOUEUR    │
│   paie 50€  │
└──────┬──────┘
       │
       v
┌─────────────────────────────┐
│  Stripe Checkout Session    │
│  • mode: payment             │
│  • application_fee: 2.50€    │
│  • NO transfer_data          │
└──────┬──────────────────────┘
       │
       v
┌─────────────────────────────┐
│  💰 Argent GELÉ dans Edgemy │
│  • paymentStatus: PAID       │
│  • transferStatus: PENDING   │
└──────┬──────────────────────┘
       │
       v
┌─────────────────────────────┐
│  🎮 Session Discord créé     │
└──────┬──────────────────────┘
       │
       v (session terminée)
       │
┌─────────────────────────────┐
│  POST /reservations/:id/    │
│  complete                    │
│  • Vérifie endDate           │
│  • stripe.transfers.create() │
└──────┬──────────────────────┘
       │
       v
┌─────────────────────────────┐
│  💸 Coach reçoit 47.50€      │
│  • transferStatus:           │
│    TRANSFERRED               │
│  • Edgemy garde 2.50€        │
└─────────────────────────────┘
```

### Flow Pack 5h

```
┌─────────────┐
│   JOUEUR    │
│   paie 200€ │
│   (pack 5h) │
└──────┬──────┘
       │
       v
┌─────────────────────────────┐
│  💰 Argent GELÉ 200€         │
│  • Commission: 7€ (3€+2%)    │
│  • Coach earnings: 193€      │
│  • transferStatus: PENDING   │
└──────┬──────────────────────┘
       │
       v
┌─────────────────────────────┐
│  📅 5 PackageSessions créées │
└──────┬──────────────────────┘
       │
       v (1ère session complétée)
       │
┌─────────────────────────────┐
│  💸 Transfer 50% au coach    │
│  • Amount: 96.50€            │
│  • firstTransferId: tr_xxx   │
│  • transferStatus:           │
│    FIRST_TRANSFERRED         │
└──────┬──────────────────────┘
       │
       v (sessions 2, 3, 4...)
       │
┌─────────────────────────────┐
│  ⏸️ Pas de transfer          │
└──────┬──────────────────────┘
       │
       v (5ème session complétée)
       │
┌─────────────────────────────┐
│  💸 Transfer 50% restant     │
│  • Amount: 96.50€            │
│  • finalTransferId: tr_xxx   │
│  • transferStatus:           │
│    FULLY_TRANSFERRED         │
└─────────────────────────────┘
```

---

## ✅ Checklist d'implémentation

### Prisma

- [ ] Ajouter nouveaux champs dans `Reservation`
- [ ] Créer modèle `RefundLog`
- [ ] Créer modèle `TransferLog`
- [ ] Ajouter enums `TransferStatus`, `RefundStatus`, `CancelledBy`
- [ ] Modifier `CoachingPackage` pour paiement progressif
- [ ] Exécuter migration

### Types TypeScript

- [ ] Créer `src/lib/stripe/business-rules.ts`
- [ ] Créer `src/lib/stripe/transfer.ts`
- [ ] Créer `src/lib/stripe/refund.ts`
- [ ] Mettre à jour `src/lib/stripe/types.ts`

### API Routes

- [ ] Refactoriser `/api/stripe/create-session`
- [ ] Créer `/api/reservations/[id]/complete`
- [ ] Créer `/api/reservations/[id]/cancel`
- [ ] Créer `/api/reservations/[id]/refund`
- [ ] Créer `/api/packages/[id]/complete-session`
- [ ] Créer `/api/packages/[id]/refund`
- [ ] Refactoriser `/api/stripe/webhook`

### Helpers

- [ ] `calculateRefundAmount()`
- [ ] `calculateCoachCompensation()`
- [ ] `createStripeTransfer()`
- [ ] `createStripeRefund()`

### Tests

- [ ] Tester session unique complète
- [ ] Tester pack 5h avec 50% à la 1ère session
- [ ] Tester annulation joueur +24h
- [ ] Tester annulation joueur -24h
- [ ] Tester annulation coach avec reschedule
- [ ] Tester remboursement pack partiel

---

## 🔐 Sécurité

### Vérifications obligatoires

```typescript
// Avant de transfer
✅ Vérifier que endDate est passée
✅ Vérifier que transferStatus === 'PENDING'
✅ Vérifier que paymentStatus === 'PAID'
✅ Vérifier que coach.stripeAccountId existe
✅ Vérifier signature webhook Stripe

// Avant de rembourser
✅ Vérifier que refundStatus === 'NONE'
✅ Vérifier que le montant <= priceCents
✅ Logger chaque refund
```

---

## 📝 Variables d'environnement

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_ENABLED="true"

# Commissions (optionnel, sinon valeurs par défaut)
STRIPE_SINGLE_SESSION_FEE_PERCENT="0.05"
STRIPE_PACK_FIXED_FEE="3.00"
STRIPE_PACK_PERCENT_FEE="0.02"

# Discord
DISCORD_BOT_TOKEN="..."
DISCORD_GUILD_ID="..."
DISCORD_CATEGORY_ID="..."
DISCORD_ADMIN_ROLE_ID="..."
```

---

## 🚀 Prochaines étapes

1. **Phase 1** : Implémenter tous les changements Prisma + Types
2. **Phase 2** : Refactoriser `/api/stripe/create-session` et webhook
3. **Phase 3** : Implémenter `/api/reservations/[id]/complete`
4. **Phase 4** : Implémenter annulations et remboursements
5. **Phase 5** : Tester en local avec Stripe Test Mode
6. **Phase 6** : Tests E2E complets
7. **Phase 7** : Déploiement en production

---

**Fin du document**
