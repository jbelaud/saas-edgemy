# 🔄 Migration vers Destination Charges avec Protection

**Date**: 17 novembre 2025
**Objectif**: Migrer vers un système sécurisé avec l'argent allant directement au coach + système de protection

---

## 🎯 Nouveau système

### Architecture

```
Paiement:
├─ Joueur paie: 105€
├─ → 100€ vont DIRECTEMENT au coach (via transfer_data)
├─ → 5€ restent sur votre compte (application_fee_amount)
└─ → Payout du coach retardé de 7 jours (on_behalf_of + delay_days)
```

### Avantages

✅ **Fiscal**: L'argent ne transite PAS par votre compte
✅ **Protection**: Holding period de 7 jours pour gérer les litiges
✅ **Remboursements**: Possible via Stripe API
✅ **Comptabilité**: Vous ne comptabilisez QUE vos 5€ de commission

---

## 📋 Scénarios de protection

### 1. Session réussie ✅
```
J+0: Paiement 105€ (100€ au coach, 5€ pour vous)
J+1: Confirmation automatique via webhook ou API
J+7: Déblocage automatique des fonds au coach
```

### 2. Coach absent 🚫
```
J+0: Paiement 105€
J+0: Joueur signale l'absence du coach
J+0: Investigation (vérifier logs Discord, etc.)
J+0: Remboursement TOTAL au joueur (100€)
J+0: Vous récupérez la commission via refund ou reversal
```

### 3. Joueur absent 🚫
```
J+0: Paiement 105€
J+0: Coach signale l'absence du joueur
J+1: Investigation
J+1: Confirmation → Coach garde 100%
J+7: Déblocage automatique
```

### 4. Annulation <24h par le joueur ⏰
```
J+0: Paiement 105€
J-1: Joueur annule à moins de 24h de la session
Politique:
├─ Coach reçoit 50€ (compensation temps bloqué)
├─ Joueur récupère 50€ (remboursement partiel)
└─ Vous gardez 5€ (frais de traitement)
```

### 5. Annulation <24h par le coach ⏰
```
J+0: Paiement 105€
J-1: Coach annule à moins de 24h
Politique:
├─ Joueur récupère 105€ (remboursement TOTAL)
├─ + 10€ de dédommagement (prélevé sur votre commission future)
└─ Coach ne reçoit rien + pénalité
```

### 6. Litige qualité 🔍
```
J+0: Paiement 105€, session effectuée
J+1: Joueur ouvre un litige (qualité insuffisante)
J+1 à J+7: Investigation
  ├─ Logs Discord
  ├─ Messages échangés
  ├─ Avis des deux parties
Décision:
├─ Joueur a raison → Remboursement 100% (100€)
├─ Coach a raison → Coach garde 100% (déblocage immédiat)
└─ Mi-chemin → Remboursement 50% / Coach garde 50%
```

---

## 🔧 Implémentation technique

### Modification 1: create-session/route.ts

**Ancien code** (lignes 176-183):
```typescript
payment_intent_data: {
  transfer_group: `reservation_${reservationId}`,
  // ❌ Ne PAS utiliser application_fee_amount ici
  metadata: {
    ...metadataBase,
  },
},
```

**Nouveau code**:
```typescript
payment_intent_data: {
  application_fee_amount: pricingBreakdown.serviceFeeCents, // Votre commission (5€)
  on_behalf_of: coach.stripeAccountId, // Le paiement est "au nom" du coach
  transfer_data: {
    destination: coach.stripeAccountId, // 100€ vont directement au coach
  },
  metadata: {
    ...metadataBase,
    holdingPeriodDays: '7', // Période de protection
  },
},
```

### Modification 2: Configuration du compte coach

Lors de la création du compte Stripe Connect du coach, configurer:

```typescript
await stripe.accounts.update(coachStripeAccountId, {
  settings: {
    payouts: {
      schedule: {
        delay_days: 7, // Retarde les payouts de 7 jours
        interval: 'daily',
      },
    },
  },
});
```

### Modification 3: API de gestion des litiges

Créer `/api/reservations/[id]/dispute` pour gérer:
- Signalement d'absence
- Ouverture de litige
- Remboursements partiels/totaux

---

## 💰 Gestion des remboursements

### Remboursement TOTAL (100%)

```typescript
// 1. Annuler le transfer au coach (si pas encore payé)
await stripe.transfers.cancel(transferId);

// OU reverse si déjà payé
await stripe.transfers.createReversal(transferId, {
  amount: coachNetCents, // 10000 centimes = 100€
});

// 2. Rembourser le joueur
await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: totalCustomerCents, // 10500 centimes = 105€
});

// 3. Votre commission est automatiquement remboursée par Stripe
```

### Remboursement PARTIEL (50%)

```typescript
// 1. Reverse partiel du transfer
await stripe.transfers.createReversal(transferId, {
  amount: 5000, // 50€
});

// 2. Remboursement partiel au joueur
await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: 5250, // 52.50€ (50€ + la moitié des frais)
});

// 3. Coach garde 50€
// 4. Vous gardez 2.50€ (la moitié de votre commission)
```

---

## 🎛️ Tableau de bord nécessaire

### Pour les ADMINS (vous)

Dashboard `/admin/disputes`:
```
┌─────────────────────────────────────────────────────┐
│ 🔍 LITIGES EN COURS                                 │
├─────────────────────────────────────────────────────┤
│ Réservation #abc123                                 │
│ Coach: Olivier Belaud                               │
│ Joueur: Jérémy Belaud                               │
│ Montant: 100€                                       │
│ Raison: Coach absent                                │
│ Statut: En investigation                            │
│                                                      │
│ [Voir détails] [Rembourser joueur] [Rejeter]       │
└─────────────────────────────────────────────────────┘
```

### Pour les COACHS

Notification si litige:
```
⚠️  Un joueur a signalé un problème avec votre session
Session: 17/11/2025 18:00
Joueur: Jérémy B.
Raison: Absence

Vous avez 24h pour répondre.
[Voir détails] [Répondre]
```

### Pour les JOUEURS

Bouton après la session:
```
✅ Session terminée

Tout s'est bien passé ?
[Oui, parfait!] [Signaler un problème]
```

---

## 📊 Base de données

Ajouter une table `Dispute`:

```prisma
model Dispute {
  id              String          @id @default(cuid())
  reservationId   String
  reservation     Reservation     @relation(fields: [reservationId], references: [id])

  reportedBy      String          // 'PLAYER' ou 'COACH'
  reason          DisputeReason
  description     String?

  status          DisputeStatus   @default(PENDING)
  resolution      String?         // Explication de la décision
  refundAmount    Int?            // Montant remboursé (centimes)

  createdAt       DateTime        @default(now())
  resolvedAt      DateTime?
  resolvedBy      String?         // Admin qui a résolu

  @@index([reservationId])
  @@index([status])
}

enum DisputeReason {
  COACH_ABSENT
  PLAYER_ABSENT
  POOR_QUALITY
  TECHNICAL_ISSUE
  OTHER
}

enum DisputeStatus {
  PENDING           // En attente d'investigation
  INVESTIGATING     // En cours d'investigation
  RESOLVED_REFUND   // Résolu avec remboursement
  RESOLVED_NO_REFUND // Résolu sans remboursement
  REJECTED          // Litige rejeté
}
```

---

## ⚡ Actions immédiates

1. ✅ Modifier `create-session/route.ts` pour utiliser Destination Charges
2. ✅ Configurer holding period sur comptes coachs
3. ✅ Créer `/api/reservations/[id]/dispute` (création litige)
4. ✅ Créer `/api/admin/disputes` (gestion admin)
5. ✅ Ajouter bouton "Signaler problème" dans UI joueur
6. ✅ Créer système de notification coach/joueur
7. ✅ Ajouter migration Prisma pour table Dispute

---

## 🚀 Ordre de déploiement

1. **Phase 1**: Migration du code (Destination Charges)
2. **Phase 2**: Table Dispute + API de signalement
3. **Phase 3**: Dashboard admin disputes
4. **Phase 4**: Notifications automatiques
5. **Phase 5**: Tests complets de tous les scénarios

---

## ✅ Checklist avant migration

- [ ] Backup de la base de données
- [ ] Tests en environnement de test Stripe
- [ ] Validation avec expert-comptable
- [ ] Documentation CGV mise à jour (politique remboursement)
- [ ] Tests de tous les scénarios de litige
- [ ] Formation équipe support

---

**Note importante**: Cette migration est CRITIQUE car elle change votre modèle comptable et fiscal. À faire valider par votre comptable avant déploiement en production.
