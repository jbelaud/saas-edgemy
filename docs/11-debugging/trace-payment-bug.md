# DIAGNOSTIC BUG PAIEMENT 90.60€

## CONTEXTE
- Edgemy affiche: 95.85€ ✅
- Stripe reçoit: 90.60€ ❌
- Montant attendu: 95.85€

## ANALYSE DU CODE

### 1. FLUX DE DONNÉES

```
[Page Booking]
  ↓ announcement.priceCents = 9000 (90€)
[BookingPageClient.tsx]
  ↓ envoie announcementId + startDate + endDate
[/api/reservations/create]
  ↓ récupère announcement.priceCents = 9000
  ↓ calcule pricing via calculateForSession(9000)
  ↓ crée Reservation avec priceCents = 9000
  ↓ retourne reservationId
[BookingPageClient.tsx]
  ↓ envoie reservationId
[/api/stripe/create-session]
  ↓ récupère reservation.priceCents = 9000
  ↓ RE-CALCULE pricing via calculateForSession(9000)
  ↓ crée Stripe session avec unit_amount = ?
```

### 2. CALCUL THÉORIQUE (pricing.ts)

```javascript
calculateForSession(9000):
  coachNetCents = 9000
  serviceFeeMultiplier = 1.065 (1 + 6.5/100)
  totalCustomerCents = Math.round(9000 * 1.065) = 9585 ✅
  serviceFeeCents = 9585 - 9000 = 585
  → retourne totalCustomerCents = 9585 (95.85€)
```

### 3. CODE STRIPE CHECKOUT (create-session/route.ts ligne 172)

```typescript
line_items: [{
  price_data: {
    currency: pricingBreakdown.currency,
    product_data: { name: productName, ... },
    unit_amount: pricingBreakdown.totalCustomerCents,  // ← LIGNE 172
  },
  quantity: 1,
}]
```

**VERDICT**: Le code envoie `pricingBreakdown.totalCustomerCents` qui DEVRAIT être 9585.

### 4. HYPOTHÈSE BUG

90.60€ = 9060 centimes = 9000 + 60 centimes

60 centimes = 0.67% de 9000

**POSSIBILITÉ 1**: Variable d'environnement incorrecte
```
EDGEMY_SERVICE_FEE_PERCENT = 0.67  ❌ (au lieu de 6.5)
```

**POSSIBILITÉ 2**: priceCents dans DB = 9060 au lieu de 9000
- Vérifier: SELECT priceCents FROM "Announcement" WHERE ...

**POSSIBILITÉ 3**: Ancien code de calcul utilisé quelque part
- Ancien taux: 0.67% ?
- Code legacy qui override le calcul?

**POSSIBILITÉ 4**: Problème d'arrondi cumulé

### 5. POINTS À VÉRIFIER

1. ✅ pricing.ts ligne 16: `edgemyServiceFeePercent: 6.5`
2. ❓ Variable .env: `EDGEMY_SERVICE_FEE_PERCENT=?`
3. ❓ Valeur réelle dans DB: `announcement.priceCents`
4. ❓ Log console dans create-session/route.ts ligne 207-211
5. ❓ Dashboard Stripe: montant exact de la session

## COMMANDES DE DEBUG

```bash
# 1. Vérifier variable d'environnement
grep "EDGEMY_SERVICE_FEE_PERCENT" .env .env.local

# 2. Vérifier valeur DB (SQL direct)
# SELECT "priceCents" FROM "Announcement" WHERE "coachId" = 'ID_COACH';

# 3. Ajouter logs temporaires dans create-session/route.ts ligne 111-135:
console.log('🔍 DEBUG PRICING:', {
  input_priceCents: coachPriceCents,
  calculated_totalCustomerCents: pricingBreakdown.totalCustomerCents,
  calculated_serviceFeeCents: pricingBreakdown.serviceFeeCents,
  isPackage,
});
```

## PROCHAINES ÉTAPES

1. Vérifier .env pour EDGEMY_SERVICE_FEE_PERCENT
2. Vérifier les logs console lors d'une vraie réservation
3. Comparer avec les logs Stripe (montant exact envoyé)
4. Identifier la divergence entre 9585 (attendu) et 9060 (reçu)
