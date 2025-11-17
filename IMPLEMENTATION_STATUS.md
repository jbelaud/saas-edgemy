# 📊 Statut d'implémentation du nouveau système de paiement

**Date:** 14 NOVEMBRE 2025
**Agent:** Claude Code

---

## ✅ Ce qui a été fait

### 1. Documentation complète

**Fichier:** `PAYMENT_FLOW_IMPLEMENTATION.md`

- Architecture complète du nouveau système
- Diagrammes de flow
- Règles métier détaillées
- Exemples de code
- Checklist d'implémentation

### 2. Migrations Prisma ✅

**Modifications apportées à** `prisma/schema.prisma` :

#### Modèle `Reservation` - Nouveaux champs

```prisma
// Transfert au coach (nouveau système)
stripeTransferId     String?           // ID du transfer Stripe vers le coach
transferStatus       TransferStatus    @default(PENDING)
transferredAt        DateTime?

// Remboursements
refundStatus         RefundStatus      @default(NONE)
refundAmount         Int?              // Montant remboursé (centimes)
refundReason         String?
refundedAt           DateTime?

// Annulation
cancelledBy          CancelledBy?      // COACH ou PLAYER
cancellationReason   String?
cancelledAt          DateTime?

// Relations
refundLogs       RefundLog[]
transferLogs     TransferLog[]
```

#### Modèle `CoachingPackage` - Nouveaux champs

```prisma
commissionCents Int              @default(0)
coachEarningsCents Int           @default(0)

// Transfert progressif (PAIEMENT APRES CHAQUE SESSION)
firstSessionCompleted Boolean     @default(false)
firstTransferId       String?
firstTransferredAt    DateTime?
finalTransferId       String?
finalTransferredAt    DateTime?
transferStatus        PackageTransferStatus @default(PENDING)
```

#### Nouveaux modèles

**`RefundLog`** - Historique des remboursements
```prisma
id              String   @id @default(cuid())
reservationId   String
amount          Int
reason          String
stripeRefundId  String
initiatedBy     String?
createdAt       DateTime @default(now())
```

**`TransferLog`** - Historique des transfers
```prisma
id              String   @id @default(cuid())
reservationId   String
amount          Int
stripeTransferId String
status          String   // pending, paid, failed, canceled
transferType    String   // session_completion, cancellation_compensation, etc.
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
```

#### Nouveaux enums

```prisma
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

enum PackageTransferStatus {
  PENDING              // Aucun transfer
  FIRST_TRANSFERRED    // 50% transféré après 1ère session
  FULLY_TRANSFERRED    // 100% transféré
}
```

**Statut:** ✅ Migrations appliquées avec succès (`npx prisma db push`)

---

### 3. Types TypeScript et constantes métier ✅

#### `src/lib/stripe/business-rules.ts` ✅

**Règles implémentées:**

- `COMMISSION_RULES` - Calcul des commissions (5% session, 3€+2% pack)
- `CANCELLATION_RULES` - Règles d'annulation (+24h = 100%, -24h = 50/50)
- `PACK_TRANSFER_RULES` - Transfer progressif 50%-50%
- `TRANSFER_TYPES` - Types d'événements de transfer

**Fonctions utilitaires:**

- `calculateCommission()` - Calcule la commission selon le type
- `calculateCancellationAmounts()` - Calcule remboursement et compensation
- `calculatePackTransferAmounts()` - Calcule les 50%-50% pour packs
- `calculatePackRefundAmount()` - Calcule remboursement pro-rata
- `isSessionCompleted()` - Vérifie si session terminée
- `isWithinFullRefundWindow()` - Vérifie délai de 24h
- Helpers de conversion: `eurosToCents()`, `centsToEuros()`, `formatPrice()`

---

#### `src/lib/stripe/transfer.ts` ✅

**Fonctions de gestion des transfers:**

- `createStripeTransfer()` - Crée un transfer Stripe + log en BDD
- `updateTransferStatus()` - Met à jour le statut d'un transfer
- `getCoachStripeAccount()` - Récupère le compte Connect du coach
- `canTransferToCoach()` - Vérifie si un transfer est possible
- `transferForCompletedSession()` - Transfer pour session unique complétée
- `transferCancellationCompensation()` - Transfer de compensation au coach

**Sécurité:**

- ✅ Vérification que `endDate` est passée
- ✅ Vérification que `transferStatus === 'PENDING'`
- ✅ Vérification que `paymentStatus === 'PAID'`
- ✅ Vérification que le coach a un compte Stripe Connect valide
- ✅ Création de logs pour chaque transfer
- ✅ Gestion d'erreurs complète

---

#### `src/lib/stripe/refund.ts` ✅

**Fonctions de gestion des remboursements:**

- `createStripeRefund()` - Crée un remboursement Stripe + log en BDD
- `canRefund()` - Vérifie si un remboursement est possible
- `refundReservationFull()` - Remboursement complet d'une réservation
- `refundReservationPartial()` - Remboursement partiel
- `refundPackageProRata()` - Remboursement pro-rata d'un pack

**Sécurité:**

- ✅ Vérification que `paymentStatus === 'PAID'`
- ✅ Vérification que `refundStatus !== 'FULL'`
- ✅ Calcul automatique du montant max remboursable
- ✅ Warning si transfer déjà effectué au coach
- ✅ Création de logs pour chaque remboursement

---

#### `src/lib/stripe/types.ts` ✅

**Nouveaux types ajoutés:**

- `TransferStatus`, `RefundStatus`, `CancelledBy`, `PackageTransferStatus`
- `CancelReservationParams` - Paramètres pour annulation
- `CancellationResult` - Résultat d'une annulation
- `CompleteSessionParams` - Paramètres pour compléter une session
- `CompletionResult` - Résultat de complétion

---

## 🚧 Ce qui reste à faire

### 4. Refactoriser `/api/stripe/create-session` 🔄 EN COURS

**Changements nécessaires:**

```typescript
// AVANT (transfert immédiat)
payment_intent_data: {
  application_fee_amount: commissionCents,
  transfer_data: {
    destination: coach.stripeAccountId, // ❌ Transfer immédiat
  },
}

// APRÈS (gel des fonds)
payment_intent_data: {
  application_fee_amount: commissionCents,
  // ✅ PAS de transfer_data → argent gelé dans solde Edgemy
  metadata: {
    reservationId,
    coachId,
    type: 'SINGLE' ou 'PACK',
  },
}
```

**Actions:**

- [ ] Supprimer `transfer_data.destination`
- [ ] Ajouter metadata complètes
- [ ] Activer Stripe Link (`payment_method_types: ['card', 'link']`)
- [ ] Mettre à jour le calcul de prix (pas de changement, juste pour info)

---

### 5. Créer `/api/reservations/[id]/complete` 📝 TODO

**Route:** `POST /api/reservations/[id]/complete`

**Fonction:**

- Vérifie que la session est terminée (`endDate` passée)
- Vérifie que `transferStatus === 'PENDING'`
- Appelle `transferForCompletedSession()`
- Met à jour le statut à `COMPLETED`
- Retourne le `transferId`

**Sécurité:**

- ✅ Authentification requise (coach ou admin)
- ✅ Vérification des permissions
- ✅ Validation des dates

---

### 6. Créer `/api/reservations/[id]/cancel` 📝 TODO

**Route:** `POST /api/reservations/[id]/cancel`

**Corps:**

```json
{
  "cancelledBy": "PLAYER", // ou "COACH"
  "reason": "Empêchement de dernière minute",
  "playerChoice": "reschedule" // Si coach annule
}
```

**Logique:**

#### Cas 1: Joueur annule

- **+24h avant** → `refundReservationFull()` (100% remboursé)
- **-24h avant** → `refundReservationPartial()` (50%) + `transferCancellationCompensation()` (50% au coach)

#### Cas 2: Coach annule

- Le joueur choisit:
  - **Reprogrammer** → Marquer comme `RESCHEDULED`, créer nouvelle session
  - **Remboursement** → `refundReservationFull()` (100%)

---

### 7. Créer `/api/reservations/[id]/refund` 📝 TODO

**Route:** `POST /api/reservations/[id]/refund`

**Protection:** Admin uniquement

**Corps:**

```json
{
  "amount": 2500, // en centimes (optionnel pour remboursement total)
  "reason": "Problème technique"
}
```

**Actions:**

- Appelle `refundReservationPartial()` ou `refundReservationFull()`
- Log dans `RefundLog`
- Met à jour `Reservation`

---

### 8. Créer `/api/packages/[id]/complete-session` 📝 TODO

**Route:** `POST /api/packages/[id]/complete-session`

**Corps:**

```json
{
  "sessionId": "pkg_session_xxx"
}
```

**Logique:**

1. Marque la `PackageSession` comme `COMPLETED`
2. Compte le nombre de sessions complétées
3. **Si 1ère session** → Transfer 50% au coach
4. **Si dernière session** → Transfer 50% restant
5. Met à jour `CoachingPackage.transferStatus`

**Code exemple:**

```typescript
const completedSessions = package.sessions.filter(s => s.status === 'COMPLETED').length;

if (completedSessions === 1 && !package.firstSessionCompleted) {
  // Transfer 50%
  const halfAmount = Math.round(package.coachEarningsCents / 2);
  const transfer = await createStripeTransfer({
    amount: halfAmount,
    // ...
    transferType: 'pack_first_half',
  });

  await prisma.coachingPackage.update({
    data: {
      firstSessionCompleted: true,
      firstTransferId: transfer.transferId,
      transferStatus: 'FIRST_TRANSFERRED',
    },
  });
}

if (completedSessions === totalSessions) {
  // Transfer 50% restant
  // ...
  transferStatus: 'FULLY_TRANSFERRED',
}
```

---

### 9. Créer `/api/packages/[id]/refund` 📝 TODO

**Route:** `POST /api/packages/[id]/refund`

**Corps:**

```json
{
  "reason": "Le joueur ne souhaite plus continuer"
}
```

**Actions:**

- Appelle `refundPackageProRata()`
- Calcule pro-rata selon sessions consommées
- Crée refund Stripe
- Marque package comme `CANCELLED`

---

### 10. Refactoriser `/api/stripe/webhook` 📝 TODO

**Événements à gérer:**

#### `checkout.session.completed`

```typescript
// Marquer comme PAID mais transferStatus = PENDING
await prisma.reservation.update({
  data: {
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    transferStatus: 'PENDING', // ✅ Argent gelé
  },
});

// Créer salon Discord
await createDiscordChannel(reservationId);
```

#### `transfer.created`, `transfer.paid`, `transfer.failed`

```typescript
// Logger les événements de transfer
await updateTransferStatus(transfer.id, 'paid');
```

#### `charge.refunded`

```typescript
// Logger le remboursement (déjà géré par nos fonctions)
console.log('Remboursement confirmé par Stripe');
```

---

## 📊 Progression

**Phases complétées:** 3/10 (30%)

- ✅ Phase 1: Documentation
- ✅ Phase 2: Migrations Prisma
- ✅ Phase 3: Types TypeScript et helpers
- 🔄 Phase 4: Refactoriser create-session (EN COURS)
- ⏳ Phase 5: API complete
- ⏳ Phase 6: API cancel
- ⏳ Phase 7: API refund
- ⏳ Phase 8: API packages
- ⏳ Phase 9: Refactoriser webhook
- ⏳ Phase 10: Tests E2E

---

## 🎯 Prochaines étapes immédiates

1. **Terminer la refactorisation de `/api/stripe/create-session`**
2. **Créer `/api/reservations/[id]/complete`**
3. **Créer `/api/reservations/[id]/cancel`**
4. **Tester le flow complet en local**

---

## 📝 Notes importantes

### Différence majeure avec l'ancien système

| Critère | Ancien système ❌ | Nouveau système ✅ |
|---------|-------------------|---------------------|
| Transfer | Immédiat via `transfer_data` | Manuel après session via `stripe.transfers.create()` |
| Argent | Arrive directement chez le coach | Gelé dans solde Edgemy |
| Annulation | Impossible proprement | Remboursement flexible |
| Packs | Tout payé d'un coup | 50% à la 1ère, 50% à la dernière |
| Logs | Aucun | `TransferLog` + `RefundLog` |

### Avantages du nouveau système

✅ **Contrôle total** sur les transfers
✅ **Remboursements flexibles** (partiel/total)
✅ **Paiement progressif** pour les packs (protection joueur + coach)
✅ **Audit trail complet** (logs de tout)
✅ **Compensation automatique** en cas d'annulation tardive
✅ **Conforme** aux best practices Stripe pour marketplaces

### Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Transfer oublié | ✅ Cron job pour vérifier les sessions terminées sans transfer |
| Double transfer | ✅ Vérification `transferStatus === 'PENDING'` avant transfer |
| Remboursement après transfer | ⚠️ Warning + nécessite reverse manuel si nécessaire |
| Compte mock en prod | ✅ Validation du compte Connect avant transfer |

---

## 🔧 Configuration requise

**Variables d'environnement:**

```env
# Stripe
STRIPE_SECRET_KEY="sk_live_..." # Ou sk_test_ en dev
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_ENABLED="true"

# Commissions
STRIPE_SINGLE_SESSION_FEE_PERCENT="0.05"
STRIPE_PACK_FIXED_FEE="3.00"
STRIPE_PACK_PERCENT_FEE="0.02"

# Discord
DISCORD_BOT_TOKEN="..."
DISCORD_GUILD_ID="..."
DISCORD_CATEGORY_ID="..."

# App URL
NEXT_PUBLIC_APP_URL="https://app.edgemy.fr"
```

**Webhooks Stripe à configurer:**

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `transfer.created`
- `transfer.paid`
- `transfer.failed`
- `charge.refunded`

---

## 📚 Fichiers créés/modifiés

### Nouveaux fichiers

- ✅ `PAYMENT_FLOW_IMPLEMENTATION.md` - Documentation complète
- ✅ `IMPLEMENTATION_STATUS.md` - Ce fichier
- ✅ `src/lib/stripe/business-rules.ts` - Règles métier
- ✅ `src/lib/stripe/transfer.ts` - Gestion des transfers
- ✅ `src/lib/stripe/refund.ts` - Gestion des remboursements

### Fichiers modifiés

- ✅ `prisma/schema.prisma` - Nouveaux champs + modèles + enums
- ✅ `src/lib/stripe/types.ts` - Nouveaux types TypeScript

### Fichiers à modifier

- 🔄 `src/app/api/stripe/create-session/route.ts` - EN COURS
- ⏳ `src/app/api/stripe/webhook/route.ts` - TODO

### Fichiers à créer

- ⏳ `src/app/api/reservations/[id]/complete/route.ts`
- ⏳ `src/app/api/reservations/[id]/cancel/route.ts`
- ⏳ `src/app/api/reservations/[id]/refund/route.ts`
- ⏳ `src/app/api/packages/[id]/complete-session/route.ts`
- ⏳ `src/app/api/packages/[id]/refund/route.ts`

---

**Dernière mise à jour:** 14 janvier 2025, 15:30
**Statut global:** 🟡 En cours d'implémentation (30% complété)
