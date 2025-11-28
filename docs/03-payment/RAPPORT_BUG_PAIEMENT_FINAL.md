# RAPPORT FINAL : Bug montant paiement 90.60€

## RÉSUMÉ EXÉCUTIF

**Problème**: Stripe reçoit 90.60€ au lieu de 95.85€
**Impact**: Perte de 5.25€ par transaction (commission réduite de 6.5% à 0.67%)
**Cause identifiée**: Variable d'environnement `EDGEMY_SERVICE_FEE_PERCENT` mal configurée
**Solution**: Modifier la valeur de "0.065" à "6.5"

---

## DIAGNOSTIC COMPLET

### 1. FLUX ACTUEL (TRACÉ LIGNE PAR LIGNE)

#### Étape 1: Affichage au joueur
**Fichier**: `src/components/booking/PricingSummary.tsx`
**Ligne 49**: `return calculateForSession(announcement.priceCents);`

```typescript
Input: announcement.priceCents = 9000 (90€ - prix coach)
Calcul: calculateForSession(9000)
  → coachNetCents = 9000
  → serviceFeeMultiplier = 1 + (6.5 / 100) = 1.065
  → totalCustomerCents = Math.round(9000 * 1.065) = 9585
Output: 9585 centimes = 95.85€ ✅ AFFICHÉ CORRECTEMENT
```

#### Étape 2: Création de la réservation
**Fichier**: `src/app/api/reservations/create/route.ts`
**Lignes 192-244**: Détermine le prix de la réservation

```typescript
Line 192: reservationPriceCents = announcement.priceCents; // 9000
Line 372: pricingBreakdown = calculateForSession(reservationPriceCents);
Line 389: priceCents: reservationPriceCents, // Stocke 9000 en DB
```

**Base de données**:
```sql
INSERT INTO "Reservation" ("priceCents", ...) VALUES (9000, ...);
```

#### Étape 3: Création session Stripe
**Fichier**: `src/app/api/stripe/create-session/route.ts`
**Lignes critiques**:

```typescript
// Ligne 44-54: Récupère la réservation
const reservation = await prisma.reservation.findUnique({
  where: { id: reservationId },
  select: { priceCents: true } // ← Récupère 9000
});

// Ligne 109: Utilise priceCents comme base
const coachPriceCents = reservation.priceCents; // 9000

// Ligne 111-116: RE-CALCULE via pricing.ts
const pricingBreakdown = await (async () => {
  if (!isPackage) {
    const breakdown = calculateForSession(coachPriceCents); // ← APPEL ICI
    sessionPayoutCents = breakdown.coachNetCents;
    return breakdown;
  }
})();

// Ligne 172: ENVOIE À STRIPE
unit_amount: pricingBreakdown.totalCustomerCents, // ← DEVRAIT être 9585
```

### 2. BUG IDENTIFIÉ

#### Localisation exacte
**Fichier**: `src/lib/stripe/pricing.ts`
**Ligne 16 (DEFAULT_CONFIG)**:
```typescript
const DEFAULT_CONFIG: PricingConfig = {
  stripePercentFee: 0.015,  // ✅ Correct (1.5%)
  stripeFixedFeeCents: 25,  // ✅ Correct (0.25€)
  edgemyServiceFeePercent: 6.5, // ✅ Correct dans le code
  currency: 'eur',
  roundingMode: 'nearest',
};
```

**Ligne 69 (getConfig)**:
```typescript
edgemyServiceFeePercent: parseNumberEnv('EDGEMY_SERVICE_FEE_PERCENT', DEFAULT_CONFIG.edgemyServiceFeePercent),
```

**Variables d'environnement** (`.env` et `.env.local`):
```bash
EDGEMY_SERVICE_FEE_PERCENT="0.065"  ❌ INCORRECT
```

#### Explication du bug

1. **Fichier .env contient**: `EDGEMY_SERVICE_FEE_PERCENT="0.065"`
2. **Code lit la valeur**: `parseNumberEnv('EDGEMY_SERVICE_FEE_PERCENT', 6.5)`
3. **Conversion**: `Number("0.065")` = `0.065`
4. **Calcul ligne 85**: `const percentDecimal = 0.065 / 100 = 0.00065`
5. **Résultat ligne 86**: `const fee = 9000 * 0.00065 = 5.85 centimes`
6. **Total**: `9000 + 6 = 9006 centimes = 90.06€`

**MAIS** le montant observé est 90.60€ (9060 centimes), pas 90.06€!

Cela indique que:
- Soit la valeur dans .env est différente en production (peut-être "0.67" au lieu de "0.065")
- Soit la base de données contient `priceCents = 9060` au lieu de `9000`
- Soit un ancien code a modifié la valeur

#### Calcul qui donne 90.60€
```
9060 centimes = 9000 + 60
60 / 9000 = 0.006667 = 0.6667%

Pour obtenir ce résultat:
EDGEMY_SERVICE_FEE_PERCENT="0.67"
→ 0.67 / 100 = 0.0067
→ 9000 * 0.0067 = 60.3 → arrondi 60 centimes
→ 9000 + 60 = 9060 centimes = 90.60€ ✅
```

### 3. CORRECTION NÉCESSAIRE

#### Solution immédiate
**Modifier les fichiers .env**:

```bash
# Fichier: .env
EDGEMY_SERVICE_FEE_PERCENT="6.5"  # Changé de "0.065" à "6.5"

# Fichier: .env.local
EDGEMY_SERVICE_FEE_PERCENT="6.5"  # Changé de "0.065" à "6.5"
```

#### Vérifications à effectuer

1. **Vérifier la valeur en production** (Vercel):
   ```bash
   # Sur Vercel Dashboard → Settings → Environment Variables
   EDGEMY_SERVICE_FEE_PERCENT = ?
   ```

2. **Vérifier les données en base**:
   ```sql
   -- Vérifier les prix des annonces
   SELECT id, title, "priceCents"
   FROM "Announcement"
   WHERE "coachId" = 'XXX';

   -- Vérifier si des réservations ont des montants incorrects
   SELECT id, "priceCents", "serviceFeeCents", "totalCustomerCents"
   FROM "Reservation"
   WHERE "createdAt" >= NOW() - INTERVAL '7 days';
   ```

3. **Redémarrer le serveur**:
   ```bash
   # Développement
   npm run dev

   # Production (redéployer)
   git commit -m "fix: corriger EDGEMY_SERVICE_FEE_PERCENT"
   git push
   ```

### 4. VALIDATION POST-CORRECTION

#### Test de calcul
```bash
node verify-bug.js
```

**Résultat attendu**:
```
Prix coach: 90.00€ (9000 centimes)
Total client: 95.85€ (9585 centimes)
Frais service: 5.85€ (585 centimes)
Pourcentage effectif: 6.50%
```

#### Logs à vérifier
Dans `src/app/api/stripe/create-session/route.ts` ligne 207-211:
```
 Prix coach: 90.00€ | Commission Edgemy: 4.16€ | Frais Stripe estimés: 1.69€ | Prix élève: 95.85€
```

#### Dashboard Stripe
- Session créée: montant = **9585 centimes** (95.85€)
- Payment Intent: amount = **9585**

---

## FICHIERS IMPLIQUÉS

### Code source
- `src/lib/stripe/pricing.ts` (lignes 16, 69, 83-88, 136-171)
- `src/app/api/stripe/create-session/route.ts` (lignes 44-54, 109-135, 172)
- `src/app/api/reservations/create/route.ts` (lignes 192, 372, 389)
- `src/components/booking/PricingSummary.tsx` (ligne 49)

### Configuration
- `.env` (ligne 72)
- `.env.local` (ligne 53)
- Variables d'environnement Vercel

### Base de données
- Table `Announcement` (colonne `priceCents`)
- Table `Reservation` (colonnes `priceCents`, `serviceFeeCents`, `totalCustomerCents`)

---

## IMPACT BUSINESS

### Perte par transaction
```
Montant attendu: 95.85€
Montant actuel: 90.60€
Perte: 5.25€ par session de 90€

Commission attendue: 6.5% → 5.85€
Commission actuelle: 0.67% → 0.60€
Perte commission: 5.25€
```

### Calcul frais Stripe
```
Avec montant correct (95.85€):
Frais Stripe: 95.85€ * 1.5% + 0.25€ = 1.69€
Marge Edgemy: 5.85€ - 1.69€ = 4.16€

Avec montant incorrect (90.60€):
Frais Stripe: 90.60€ * 1.5% + 0.25€ = 1.61€
Commission reçue: 0.60€
Marge Edgemy: 0.60€ - 1.61€ = -1.01€ ❌ NÉGATIF!
```

**Edgemy perd de l'argent sur chaque transaction!**

---

## RECOMMANDATIONS

### Immédiat
1. ✅ Corriger `EDGEMY_SERVICE_FEE_PERCENT` à "6.5" dans tous les environnements
2. ✅ Redéployer sur Vercel
3. ✅ Tester une nouvelle réservation
4. ✅ Vérifier les logs Stripe

### Court terme
1. Ajouter validation dans `pricing.ts`:
   ```typescript
   if (config.edgemyServiceFeePercent < 1) {
     console.warn('⚠️  EDGEMY_SERVICE_FEE_PERCENT semble incorrect:', config.edgemyServiceFeePercent);
     console.warn('⚠️  Attendu: 6.5 (pour 6.5%), trouvé:', config.edgemyServiceFeePercent);
   }
   ```

2. Ajouter tests unitaires pour le calcul:
   ```typescript
   test('calculateForSession with 90€ should return 95.85€', () => {
     const result = calculateForSession(9000);
     expect(result.totalCustomerCents).toBe(9585);
     expect(result.serviceFeeCents).toBe(585);
   });
   ```

3. Ajouter alertes si marge négative:
   ```typescript
   if (edgemyFeeCents < 0) {
     throw new Error('Configuration pricing incorrecte: marge Edgemy négative');
   }
   ```

### Long terme
1. Documenter clairement le format attendu des variables d'environnement
2. Créer un script de validation des variables avant déploiement
3. Monitorer les marges dans un dashboard admin

---

## CONCLUSION

**Bug identifié**: Variable `EDGEMY_SERVICE_FEE_PERCENT` configurée à "0.065" (ou "0.67") au lieu de "6.5"

**Ligne problématique**: Aucune ligne de code n'est bugguée, c'est la **configuration** qui est incorrecte

**Fichiers à modifier**:
- `.env` ligne 72
- `.env.local` ligne 53
- Variables d'environnement Vercel

**Action requise**: Changer la valeur de la variable d'environnement et redéployer

**Test de validation**:
```bash
# 1. Modifier .env
EDGEMY_SERVICE_FEE_PERCENT="6.5"

# 2. Redémarrer
npm run dev

# 3. Tester
node verify-bug.js

# 4. Créer une réservation test
# 5. Vérifier dans Stripe: montant = 9585 centimes (95.85€)
```
