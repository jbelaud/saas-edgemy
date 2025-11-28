# DIAGNOSTIC COMPLET : Bug montant 90.60€ au lieu de 95.85€

## CONTEXTE
- **Affichage Edgemy**: 95.85€ ✅ (correct)
- **Montant envoyé à Stripe**: 90.60€ ❌ (incorrect)
- **Montant attendu**: 95.85€

## FLUX ACTUEL IDENTIFIÉ

### 1. Page de réservation (BookingPageClient.tsx)
```typescript
// Ligne 47-60 : PricingSummary.tsx
const pricing = useMemo(() => {
  if (bookingType === 'single') {
    return calculateForSession(announcement.priceCents); // ✅ Utilise bien pricing.ts
  }
  // ...
}, [bookingType, selectedPackId, announcement]);
```
→ **Calcul correct**: 9000 → 9585 centimes (95.85€)

### 2. Création de la réservation (/api/reservations/create)
```typescript
// Ligne 189-244 : Détermine le prix
reservationPriceCents = announcement.priceCents; // 9000 centimes
// ...
// Ligne 358-373 : Calcul pricing
pricingBreakdown = calculateForSession(reservationPriceCents);
// ...
// Ligne 389 : Stocke dans la réservation
priceCents: reservationPriceCents, // 9000
```
→ **Calcul correct**: pricing calculé mais **priceCents stocké = 9000** (prix coach brut)

### 3. Création session Stripe (/api/stripe/create-session)
```typescript
// Ligne 44-54 : Récupère la réservation
const reservation = await prisma.reservation.findUnique({
  where: { id: reservationId },
  select: {
    priceCents: true, // ← Récupère 9000
    // ...
  },
});

// Ligne 109 : Utilise le priceCents de la réservation
const coachPriceCents = reservation.priceCents; // 9000

// Ligne 111-135 : RE-CALCULE le pricing
const pricingBreakdown = await (async () => {
  if (!isPackage) {
    const breakdown = calculateForSession(coachPriceCents); // ← DEVRAIT donner 9585
    return breakdown;
  }
  // ...
})();

// Ligne 172 : Envoie à Stripe
unit_amount: pricingBreakdown.totalCustomerCents, // ← DEVRAIT être 9585
```
→ **Question**: Pourquoi Stripe reçoit 9060 au lieu de 9585?

## ANALYSE MATHÉMATIQUE

### Montant observé: 90.60€ (9060 centimes)
```
9060 centimes = 9000 + 60
60 / 9000 = 0.006667 = 0.6667%
```

### Montant attendu: 95.85€ (9585 centimes)
```
9585 centimes = 9000 + 585
585 / 9000 = 0.065 = 6.5% ✅
```

### Diagnostic
Le montant 90.60€ correspond à **0.6667%** de commission au lieu de 6.5%

## CAUSES POSSIBLES

### ❌ Hypothèse 1: Variable .env incorrecte
```bash
# Valeur ACTUELLE dans .env:
EDGEMY_SERVICE_FEE_PERCENT="0.065"

# Test:
pricing.ts ligne 69: parseNumberEnv('EDGEMY_SERVICE_FEE_PERCENT', 6.5)
→ Lit "0.065" → Convertit en Number(0.065) = 0.065
→ Ligne 85: percentDecimal = 0.065 / 100 = 0.00065
→ Ligne 86: fee = 9000 * 0.00065 = 5.85 centimes
→ Total: 9000 + 6 = 9006 centimes (90.06€)
```
**VERDICT**: Cette hypothèse donnerait 90.06€, pas 90.60€ ❌

### ❌ Hypothèse 2: Ancien code avec 0.65%
```
Commission: 9000 * 0.0065 = 58.5 → arrondi 59 centimes
Total: 9000 + 59 = 9059 centimes (90.59€)
```
**VERDICT**: Proche mais pas exact ❌

### ✅ Hypothèse 3: Valeur dans la base de données
La base de données pourrait contenir `priceCents = 9060` au lieu de `9000`

```sql
-- Vérifier:
SELECT id, "priceCents", title FROM "Announcement" WHERE "coachId" = 'XXX';
```

### ✅ Hypothèse 4: Ancien calcul appliqué lors de la création
Lors de la création de l'annonce, le montant aurait pu être calculé incorrectement:
```typescript
// Si quelqu'un avait fait:
const priceWithFee = coachPrice * 1.006667; // Erreur de calcul
```

## BUG IDENTIFIÉ

### Ligne de code problématique
**Fichier**: `c:\Developpement\saas-edgemy\src\app\api\stripe\create-session\route.ts`
**Ligne 172**:
```typescript
unit_amount: pricingBreakdown.totalCustomerCents,
```

### Explication
Le code est **techniquement correct**, MAIS:

1. **Variable .env incorrecte**:
   ```bash
   EDGEMY_SERVICE_FEE_PERCENT="0.065"  ❌ (interprété comme 0.065%)
   ```
   Au lieu de:
   ```bash
   EDGEMY_SERVICE_FEE_PERCENT="6.5"    ✅ (6.5%)
   ```

2. **Alternative**: La valeur `priceCents` dans la base de données est peut-être déjà à 9060 au lieu de 9000

## CORRECTION NÉCESSAIRE

### Solution 1: Corriger la variable d'environnement
```bash
# Dans .env et .env.local:
EDGEMY_SERVICE_FEE_PERCENT="6.5"  # Changé de "0.065" à "6.5"
```

### Solution 2: Vérifier et corriger la base de données
```sql
-- 1. Vérifier les prix actuels
SELECT id, title, "priceCents" FROM "Announcement";

-- 2. Si priceCents contient des valeurs incorrectes, les corriger
UPDATE "Announcement"
SET "priceCents" = 9000
WHERE id = 'XXX' AND "priceCents" = 9060;
```

### Solution 3: Ajouter des logs de debug
```typescript
// Dans create-session/route.ts, après ligne 109:
console.log('🔍 DEBUG PRICING:', {
  reservationPriceCents: coachPriceCents,
  envVariable: process.env.EDGEMY_SERVICE_FEE_PERCENT,
  calculatedTotal: pricingBreakdown.totalCustomerCents,
  expectedTotal: 9585,
});
```

## PROCHAINES ÉTAPES

1. ✅ Vérifier la valeur exacte de `EDGEMY_SERVICE_FEE_PERCENT` dans l'environnement de production
2. ✅ Vérifier les valeurs `priceCents` dans la table `Announcement` de la base de données
3. ✅ Corriger la variable d'environnement si nécessaire
4. ✅ Corriger les valeurs en base de données si nécessaire
5. ✅ Tester avec une nouvelle réservation
6. ✅ Vérifier les logs Stripe pour confirmer le montant correct (9585 centimes)

## COMMANDES DE VÉRIFICATION

```bash
# 1. Vérifier variable d'environnement
grep "EDGEMY_SERVICE_FEE_PERCENT" .env .env.local

# 2. Tester le calcul en local
node verify-bug.js

# 3. Redémarrer le serveur après modification
npm run dev
```

## IMPACT

- **Perte par transaction**: 5.25€ (95.85€ - 90.60€)
- **Cause**: Commission de 0.67% au lieu de 6.5%
- **Montant réel prélevé**: 0.60€ au lieu de 5.85€
- **Marge Edgemy perdue**: 5.25€ par session de 90€
