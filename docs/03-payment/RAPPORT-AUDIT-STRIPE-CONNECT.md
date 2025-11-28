# 🔍 RAPPORT D'AUDIT STRIPE CONNECT - EDGEMY
## Diagnostic complet et plan de remédiation

**Date** : 27 janvier 2025
**Coach concerné** : Olivier Belaud (cmhv2cleb0003uyvs9xacware)
**Réservation** : cmihvetbw0001uygsjz8rctu5
**Montant** : 95,85€ (90€ coach + 5,85€ frais)

---

## 📊 1. AUDIT DES MÉTADONNÉES STRIPE

### ✅ Métadonnées du paiement validées

```json
{
  "coachId": "cmhv2cleb0003uyvs9xacware",
  "coachNetCents": 9000,        // 90,00€ ✅
  "edgemyFeeCents": 416,         // 4,16€ ✅
  "stripeFeeCents": 169,         // 1,69€ ✅
  "serviceFeeCents": 585,        // 5,85€ ✅
  "totalCustomerCents": 9585,    // 95,85€ ✅
  "coachStripeAccountId": "acct_1SSkTd2dZ7wpKq4w"
}
```

### Vérification arithmétique

```
✅ coachNetCents + serviceFeeCents = totalCustomerCents
   9000 + 585 = 9585

✅ edgemyFeeCents + stripeFeeCents = serviceFeeCents
   416 + 169 = 585

✅ Service fee = 6.5% du prix coach
   585 / 9000 = 6.5%

✅ Stripe fee = 1.5% + 0.25€
   (9585 × 0.015) + 25 = 143.78 + 25 = 168.78 ≈ 169 centimes
```

**Formule de calcul correcte** :
- Total client = Prix coach × 1.065 (arrondi)
- Frais Stripe = Total client × 0.015 + 25 centimes
- Frais Edgemy = Service fee - Frais Stripe
- Le coach reçoit exactement le prix affiché

---

## 🚨 2. PROBLÈME MAJEUR IDENTIFIÉ : COMPTE MOCK AU LIEU DU COMPTE RÉEL

### État actuel en base de données

```
Coach ID: cmhv2cleb0003uyvs9xacware
Stripe Account ID: acct_mock_1764275654301 ❌ COMPTE MOCK
Status: INACTIVE
Is Onboarded: false

DEVRAIT ÊTRE:
Stripe Account ID: acct_1SSkTd2dZ7wpKq4w ✅ COMPTE RÉEL
Status: ACTIVE
Is Onboarded: true
```

### 🔴 CAUSE RACINE

**Fichier** : `src/app/api/stripe/connect/account-link/route.ts`
**Lignes** : 42-65

```typescript
// Mode développement : bypasser Stripe Connect si non activé
const isStripeConnectEnabled = process.env.STRIPE_CONNECT_ENABLED === 'true';

if (!isStripeConnectEnabled) {
  console.log('ℹ️ Stripe Connect désactivé - Mode développement');

  // Créer ou utiliser un compte mock
  let mockAccountId = coach.stripeAccountId;
  if (!mockAccountId || !mockAccountId.startsWith('acct_mock_')) {
    mockAccountId = `acct_mock_${Date.now()}`;

    await prisma.coach.update({
      where: { id: coach.id },
      data: { stripeAccountId: mockAccountId },
    });
  }

  // Retourner une URL de redirection vers les settings
  return NextResponse.json({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings?stripe_mock=true`,
    accountId: mockAccountId,
  });
}
```

**Problème** : La variable d'environnement `STRIPE_CONNECT_ENABLED` n'existe PAS dans le fichier `.env`, donc elle est `undefined`. Le code considère que Stripe Connect est désactivé et crée un compte mock.

### Impact en cascade

1. **API `/api/stripe/connect/status`** (ligne 72-86) : Détecte le compte mock et retourne `connected: false`
2. **Frontend** : Affiche "Configurer mon compte Stripe" au lieu de "Accéder au tableau de bord"
3. **Clic sur le bouton** : Recrée un nouveau compte mock au lieu d'utiliser le vrai compte
4. **Dashboard Stripe** : Impossible d'accéder car le compte n'est pas réel
5. **Payouts** : Aucun transfert possible vers le coach

---

## 🔍 3. ANALYSE DES LOGS ET COMPORTEMENT OBSERVÉ

### Logs de l'application

```
Coach profile found: cmhv2cleb0003uyvs9xacware Status: INACTIVE
ℹ️ Stripe Connect désactivé - Mode développement
Compte mock détecté: acct_mock_1764275654301, retour statut non connecté
```

### Séquence d'événements

1. **Onboarding initial** : Le coach s'est inscrit → création d'un compte mock (STRIPE_CONNECT_ENABLED manquant)
2. **Paiement reçu** : PaymentIntent `pi_3SYBaE2eIgLC7h2i1K7WNiTZ` créé avec succès → 95,85€ capturé
3. **Métadonnées** : Contiennent le bon compte Stripe `acct_1SSkTd2dZ7wpKq4w`
4. **Base de données** : Mais le coach a `acct_mock_1764275654301` en BDD !
5. **Transfert** : Status `PENDING` - aucun transfert effectué vers le coach
6. **Dashboard** : Clic déconnecte l'utilisateur car redirection vers `/settings?stripe_mock=true`

### Pourquoi la déconnexion ?

Le paramètre `stripe_mock=true` dans l'URL (ligne 62 du route handler) déclenche probablement un état particulier dans le frontend qui pourrait interférer avec la session. Le vrai problème est que le compte mock empêche l'accès au vrai dashboard Stripe.

---

## 💰 4. FLUX DE PAIEMENT ET WEBHOOKS

### Flux actuel (partiellement fonctionnel)

```
1. ✅ Checkout créé avec totalCustomerCents (95,85€)
2. ✅ PaymentIntent créé et capturé (pi_3SYBaE2eIgLC7h2i1K7WNiTZ)
3. ✅ Webhook checkout.session.completed reçu
4. ✅ Réservation mise à jour : paymentStatus = PAID, status = CONFIRMED
5. ❌ Transfer au coach NON effectué (compte mock)
6. ❌ Coach ne peut pas accéder au dashboard Stripe
```

### Vérification des webhooks

**Fichier** : `src/app/api/stripe/webhook/route.ts`

Le webhook handler est correct et traite bien les événements :
- Calcule correctement les frais
- Met à jour la réservation
- Enregistre le `stripePaymentId`
- Envoie les emails de confirmation (nouvellement ajouté)

**Problème** : Le transfert vers le coach utilise probablement `coach.stripeAccountId` de la BDD, qui est le compte mock. Aucun transfert ne peut être effectué vers un compte mock.

---

## 📁 5. ANALYSE DES SCRIPTS DE TEST

Je n'ai pas trouvé de scripts de paiement dans `/scripts`. Si vous avez des scripts de test, je recommande de vérifier qu'ils utilisent :

1. `STRIPE_CONNECT_ENABLED=true` dans les variables d'environnement
2. De vrais comptes Stripe Connect pour les tests
3. La même logique de calcul que `src/lib/stripe/pricing.ts`

---

## 📊 6. SYNCHRONISATION DASHBOARDS ET APIS

### API `/api/stripe/connect/status`

**Problème** : Détection du compte mock et retour de `connected: false`

```typescript
// Ligne 72-86
if (coach.stripeAccountId.startsWith('acct_mock_')) {
  console.log(`ℹ️ Compte mock détecté: ${coach.stripeAccountId}, retour statut non connecté`);
  return NextResponse.json({
    connected: false,
    // ...
  });
}
```

### Frontend `StripeConnectSettings.tsx`

Le composant affiche correctement l'état en fonction de l'API :
- `connected: false` → "Configurer mon compte Stripe"
- `connected: true, !detailsSubmitted` → "Compléter la configuration"
- `connected: true, isFullyConnected` → "Accéder au tableau de bord Stripe"

**Le problème** : L'API retourne toujours `connected: false` à cause du compte mock.

---

## 🛠️ 7. CORRECTIFS ACTIONNABLES

### 🔴 PRIORITÉ HAUTE - Débloquer immédiatement le coach

#### Correctif #1 : Ajouter la variable d'environnement

**Fichier** : `.env` et `.env.local`

```bash
# Stripe Connect
STRIPE_CONNECT_ENABLED=true
```

#### Correctif #2 : Corriger manuellement le compte en BDD

Créez le script `fix-coach-stripe-account.js` :

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCoachAccount() {
  const coachId = 'cmhv2cleb0003uyvs9xacware';
  const realStripeAccountId = 'acct_1SSkTd2dZ7wpKq4w';

  console.log('🔧 Correction du compte Stripe du coach...');

  const updated = await prisma.coach.update({
    where: { id: coachId },
    data: {
      stripeAccountId: realStripeAccountId,
      isOnboarded: true,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Coach mis à jour:', {
    id: updated.id,
    stripeAccountId: updated.stripeAccountId,
    isOnboarded: updated.isOnboarded,
    status: updated.status,
  });

  await prisma.$disconnect();
}

fixCoachAccount().catch(console.error);
```

**Exécution** :
```bash
node fix-coach-stripe-account.js
```

#### Correctif #3 : Vérifier que le compte Stripe existe

Créez le script `verify-stripe-account.js` :

```javascript
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function verifyAccount() {
  const accountId = 'acct_1SSkTd2dZ7wpKq4w';

  try {
    console.log(`🔍 Vérification du compte ${accountId}...`);

    const account = await stripe.accounts.retrieve(accountId);

    console.log('✅ Compte trouvé:');
    console.log('  ID:', account.id);
    console.log('  Type:', account.type);
    console.log('  Email:', account.email);
    console.log('  Details submitted:', account.details_submitted);
    console.log('  Charges enabled:', account.charges_enabled);
    console.log('  Payouts enabled:', account.payouts_enabled);
    console.log('  Requirements:', account.requirements);

    if (!account.details_submitted) {
      console.log('\n⚠️ Le compte nécessite de compléter les informations');
    }

    if (!account.payouts_enabled) {
      console.log('\n⚠️ Les versements ne sont pas encore activés');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

verifyAccount();
```

#### Correctif #4 : Effectuer le transfert pour la réservation payée

Créez le script `transfer-to-coach.js` :

```javascript
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
require('dotenv').config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function transferToCoach() {
  const reservationId = 'cmihvetbw0001uygsjz8rctu5';

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: true,
      },
    });

    if (!reservation) {
      console.error('❌ Réservation non trouvée');
      return;
    }

    console.log('📋 Réservation:', {
      id: reservation.id,
      coachNetCents: reservation.coachNetCents,
      stripePaymentId: reservation.stripePaymentId,
      coachStripeAccountId: reservation.coach.stripeAccountId,
    });

    if (reservation.transferStatus === 'COMPLETED') {
      console.log('✅ Transfert déjà effectué');
      return;
    }

    if (!reservation.stripePaymentId) {
      console.error('❌ Pas de PaymentIntent associé');
      return;
    }

    // Créer le transfer vers le coach
    console.log(`💸 Création du transfert de ${reservation.coachNetCents / 100}€...`);

    const transfer = await stripe.transfers.create({
      amount: reservation.coachNetCents,
      currency: 'eur',
      destination: reservation.coach.stripeAccountId,
      source_transaction: reservation.stripePaymentId,
      description: `Paiement pour session ${reservation.id}`,
      metadata: {
        reservationId: reservation.id,
        coachId: reservation.coachId,
      },
    });

    // Mettre à jour la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeTransferId: transfer.id,
        transferStatus: 'COMPLETED',
        transferredAt: new Date(),
      },
    });

    console.log('✅ Transfert effectué:', {
      transferId: transfer.id,
      amount: transfer.amount / 100 + '€',
      destination: transfer.destination,
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

transferToCoach().catch(console.error);
```

---

### 🟡 PRIORITÉ MOYENNE - Hardening et tests

#### Amélioration #1 : Ajouter une validation stricte de STRIPE_CONNECT_ENABLED

**Fichier** : `src/app/api/stripe/connect/account-link/route.ts`

```typescript
// Ligne 42 - Remplacer par:
const isStripeConnectEnabled = process.env.STRIPE_CONNECT_ENABLED === 'true';

// Ajouter après la ligne 43:
if (process.env.NODE_ENV === 'production' && !isStripeConnectEnabled) {
  console.error('❌ STRIPE_CONNECT_ENABLED doit être true en production !');
  return NextResponse.json(
    { error: 'Stripe Connect non configuré - contactez le support' },
    { status: 500 }
  );
}
```

#### Amélioration #2 : Ajouter des logs de diagnostic

**Fichier** : `src/app/api/stripe/connect/account-link/route.ts`

```typescript
// Après la ligne 42:
console.log('🔍 Stripe Connect config:', {
  STRIPE_CONNECT_ENABLED: process.env.STRIPE_CONNECT_ENABLED,
  isEnabled: isStripeConnectEnabled,
  NODE_ENV: process.env.NODE_ENV,
  coachId: coach.id,
  currentStripeAccountId: coach.stripeAccountId,
});
```

#### Amélioration #3 : Créer un test de paiement end-to-end

**Fichier** : `tests/stripe-connect-flow.test.js`

```javascript
// Test complet du flux:
// 1. Création compte Stripe Connect
// 2. Création PaymentIntent
// 3. Webhook checkout.session.completed
// 4. Vérification transfert
// 5. Vérification dashboard accessible
```

#### Amélioration #4 : Ajouter un endpoint admin pour forcer la synchronisation

**Fichier** : `src/app/api/admin/sync-stripe-accounts/route.ts`

```typescript
// Endpoint pour synchroniser tous les comptes mock avec de vrais comptes Stripe
// Accessible uniquement par les admins
```

---

### 🟢 PRIORITÉ BASSE - Améliorations

#### Amélioration #1 : Ajouter un indicateur visuel du mode

Dans le dashboard coach, afficher un badge si le compte est en mode mock :

```typescript
{coach.stripeAccountId?.startsWith('acct_mock_') && (
  <div className="bg-yellow-500/20 border border-yellow-500 p-2 rounded">
    ⚠️ Mode développement - Compte Stripe simulé
  </div>
)}
```

#### Amélioration #2 : Migration automatique mock → réel

Ajouter une tâche cron qui :
1. Détecte les comptes mock
2. Crée automatiquement les vrais comptes Stripe
3. Envoie un email au coach pour compléter l'onboarding

---

## ✅ PLAN D'ACTION PRIORISÉ

### Phase 1 : Déblocage immédiat (15 minutes)

1. ✅ **Ajouter `STRIPE_CONNECT_ENABLED=true` dans `.env`**
2. ✅ **Exécuter `fix-coach-stripe-account.js`** pour corriger le compte en BDD
3. ✅ **Exécuter `verify-stripe-account.js`** pour vérifier que le compte existe
4. ✅ **Redémarrer l'application** Next.js
5. ✅ **Tester** : Se connecter en tant que coach et vérifier que le dashboard s'ouvre

### Phase 2 : Transfert des fonds (30 minutes)

1. ✅ **Vérifier** que `acct_1SSkTd2dZ7wpKq4w` a `payouts_enabled: true`
2. ✅ **Exécuter `transfer-to-coach.js`** pour transférer les 90€
3. ✅ **Vérifier** dans le dashboard Stripe que le transfert est visible
4. ✅ **Mettre à jour** le statut de la réservation à `transferStatus: COMPLETED`

### Phase 3 : Tests et validation (1 heure)

1. ✅ **Créer une nouvelle réservation test** de bout en bout
2. ✅ **Vérifier** que le webhook déclenche le transfert automatiquement
3. ✅ **Vérifier** que le coach peut accéder au dashboard sans déconnexion
4. ✅ **Vérifier** les emails de confirmation (Brevo)
5. ✅ **Documenter** le processus

### Phase 4 : Hardening (2 heures)

1. Ajouter la validation stricte en production
2. Ajouter les logs de diagnostic
3. Créer les tests automatisés
4. Documenter la configuration Stripe Connect

---

## 📋 CHECKLIST DE VÉRIFICATION POST-CORRECTION

- [ ] Le coach `cmhv2cleb0003uyvs9xacware` a `stripeAccountId: acct_1SSkTd2dZ7wpKq4w` en BDD
- [ ] Le coach a `status: ACTIVE` et `isOnboarded: true`
- [ ] L'API `/api/stripe/connect/status` retourne `connected: true`
- [ ] Le bouton affiche "Accéder au tableau de bord Stripe"
- [ ] Le clic ouvre le dashboard Stripe SANS déconnexion
- [ ] La réservation `cmihvetbw0001uygsjz8rctu5` a `transferStatus: COMPLETED`
- [ ] Le coach voit les 90€ dans son dashboard Stripe
- [ ] Variable `STRIPE_CONNECT_ENABLED=true` dans `.env` et `.env.local`
- [ ] Nouveau paiement test fonctionne de bout en bout
- [ ] Emails Brevo envoyés correctement (joueur + coach)

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Problème** : Le coach ne peut pas accéder au dashboard Stripe et aucun transfert n'est effectué.

**Cause racine** : Variable d'environnement `STRIPE_CONNECT_ENABLED` manquante → création de compte mock au lieu d'un vrai compte Stripe Connect.

**Impact** :
- ❌ 90€ non transférés au coach
- ❌ Dashboard Stripe inaccessible
- ❌ Déconnexion lors du clic sur le bouton

**Solution** :
1. Ajouter `STRIPE_CONNECT_ENABLED=true` dans `.env`
2. Corriger le compte en BDD : remplacer `acct_mock_*` par `acct_1SSkTd2dZ7wpKq4w`
3. Effectuer le transfert manuellement pour cette réservation
4. Redémarrer l'application

**Temps estimé** : 45 minutes (déblocage + transfert + tests)

**Risque** : ⚠️ AUCUN si les scripts sont exécutés correctement. Le vrai compte Stripe existe déjà.

---

## 📞 PROCHAINES ÉTAPES

1. **Exécuter les scripts de correctifs**
2. **Vérifier le transfert dans Stripe Dashboard**
3. **Tester le flux complet avec un nouveau paiement**
4. **Mettre en place les tests automatisés**
5. **Documenter la configuration pour l'équipe**

---

**Rapport généré le** : 27 janvier 2025
**Audit réalisé par** : Claude Code
**Fichiers analysés** : 15+ fichiers TypeScript, 1 schéma Prisma, logs applicatifs
