# 🧪 Guide de test du nouveau système de paiement

**Date:** 14 janvier 2025
**Système:** Paiement avec gel des fonds (Phase 1 MVP)

---

## 🎯 Test automatisé rapide

```bash
pnpm exec tsx scripts/test-payment-flow.ts
```

Ce script teste la logique complète sans vraiment payer.

---

## 🧑‍💻 Test manuel complet (Stripe Test Mode)

### Prérequis

1. **Stripe CLI installé** et connecté
2. **Serveur démarré** : `pnpm dev`
3. **Webhooks actifs** : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. **Coach avec Stripe Connect** configuré (compte réel, pas mock)

### Scénario: Session unique (50€)

#### 1. Créer une réservation et payer

- Connectez-vous en tant que joueur
- Réservez une session (ex: 50€)
- Payez avec carte test: **4242 4242 4242 4242**

#### 2. Vérifier le paiement gelé

**Dans la console Stripe CLI:**
```
✅ checkout.session.completed
🔒 NOUVEAU SYSTÈME: Argent GELÉ
⏳ transferStatus: PENDING
```

**Dans la base de données:**
```json
{
  "paymentStatus": "PAID",
  "transferStatus": "PENDING",  // ✅ Argent gelé !
  "coachEarningsCents": 5000,   // 50€
  "commissionCents": 250        // 2.50€ (5%)
}
```

**Dans Stripe Dashboard:**
- ✅ Payment réussi
- ✅ Application fee: 2.50€
- ❌ **PAS de transfer vers le coach** (c'est normal !)

#### 3. Simuler la fin de session

Pour tester rapidement, modifiez `endDate` en BDD:

```sql
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 minute'
WHERE id = 'votre_reservation_id';
```

#### 4. Déclencher le transfer au coach

```bash
curl -X POST http://localhost:3000/api/reservations/[RESERVATION_ID]/complete \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

**Réponse attendue:**
```json
{
  "success": true,
  "transfer": {
    "transferId": "tr_xxxxx",
    "amount": 5000,
    "amountEuros": 50
  }
}
```

#### 5. Vérifier le transfer

**Dans Stripe Dashboard:**
- ✅ Transfer créé
- ✅ Montant: 50€
- ✅ Destination: Compte Connect du coach
- ✅ Status: Paid

**Dans la base de données:**
```json
{
  "status": "COMPLETED",
  "transferStatus": "TRANSFERRED",
  "stripeTransferId": "tr_xxxxx",
  "transferredAt": "2025-01-14T..."
}
```

---

## ✅ Checklist de validation

### Après le paiement
- [ ] `transferStatus` = `PENDING` ✅ **Argent gelé**
- [ ] `paymentStatus` = `PAID`
- [ ] **Pas de transfer dans Stripe** ✅

### Après la complétion
- [ ] `transferStatus` = `TRANSFERRED`
- [ ] `status` = `COMPLETED`
- [ ] **Transfer visible dans Stripe Dashboard** ✅
- [ ] `TransferLog` créé en BDD

---

## 🐛 Résolution de problèmes

### "Missing stripe-signature header"
→ Démarrez Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### "Coach Stripe Connect account not configured"
→ Le coach doit configurer son compte Stripe Express (pas de compte mock)

### "La session n'est pas encore terminée"
→ Modifiez `endDate` en BDD pour qu'elle soit dans le passé

---

## 📊 Différence avec l'ancien système

| Critère | Ancien ❌ | Nouveau ✅ |
|---------|----------|-----------|
| Transfer | Immédiat | Après session |
| Argent | Chez le coach immédiatement | Gelé dans solde Edgemy |
| Statut | Pas de tracking | `PENDING` → `TRANSFERRED` |
| Annulation | Impossible | Remboursement flexible |
| Logs | Aucun | `TransferLog` complet |

---

**Pour plus de détails:** Voir [PAYMENT_FLOW_IMPLEMENTATION.md](PAYMENT_FLOW_IMPLEMENTATION.md)
