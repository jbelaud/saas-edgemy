# 🔄 FLUX DE PAIEMENT AUTOMATIQUE - ÉTAT DES LIEUX

## 📋 RÉSUMÉ EXÉCUTIF

Votre système de paiement fonctionne avec un **modèle de transfert différé (escrow)** pour protéger contre les annulations et no-shows.

### ✅ CE QUI EST AUTOMATIQUE

1. **Capture du paiement** - Stripe capture immédiatement les fonds ✅
2. **Mise à jour réservation** - Status `CONFIRMED` + `PAID` ✅
3. **Emails de confirmation** - Joueur et coach sont notifiés ✅
4. **Canal Discord** - Création automatique (si activé) ✅
5. **Fonds bloqués en escrow** - L'argent reste sur votre compte Stripe plateforme ✅

### ⏳ CE QUI N'EST PAS AUTOMATIQUE (PAR DESIGN)

**Le transfert au coach** - Nécessite un appel API manuel à `/api/reservations/[id]/complete` après la fin de la session ❌

---

## 🏗️ ARCHITECTURE DU SYSTÈME

### Phase 1 : Paiement (AUTOMATIQUE) ✅

```
Joueur paie 90€
    ↓
Webhook Stripe: checkout.session.completed
    ↓
✅ Paiement capturé (90€ sur compte plateforme Edgemy)
✅ Réservation: status = CONFIRMED, paymentStatus = PAID
✅ transferStatus = PENDING ⏳
✅ Email joueur envoyé
✅ Email coach envoyé
✅ Canal Discord créé
```

**Fichier**: `src/app/api/stripe/webhook/route.ts`
**Lignes importantes**: 137, 244

```typescript
// Ligne 137
console.log(`🔒 NOUVEAU SYSTÈME: Argent GELÉ - Pas de transfer immédiat`);

// Ligne 244
transferStatus: 'PENDING',
console.log(`⏳ transferStatus: PENDING - Le transfer sera fait via /api/reservations/${reservationId}/complete`);
```

### Phase 2 : Session réalisée (AUTOMATIQUE) ✅

Le joueur et le coach réalisent leur session. Rien ne se passe automatiquement côté paiement.

### Phase 3 : Transfert au coach (MANUEL) ⏸️

**Actuellement** : Nécessite un appel API manuel

```
Session terminée (endDate passée)
    ↓
Coach/Admin/Joueur appelle manuellement:
POST /api/reservations/[id]/complete
    ↓
✅ Vérifications de sécurité
✅ Création du transfer Stripe (90€ → Coach)
✅ Réservation: transferStatus = TRANSFERRED
✅ Log de transfer créé
```

**Fichier**: `src/app/api/reservations/[id]/complete/route.ts`

**Conditions pour le transfert** (lignes 124-168):
- ✅ Session terminée (`endDate` passée)
- ✅ Paiement = `PAID`
- ✅ Transfer = `PENDING`
- ✅ Coach a un vrai compte Stripe (pas `acct_mock_`)
- ✅ Permissions (coach, joueur ou admin)

---

## 🎯 POURQUOI CE SYSTÈME ?

### Avantages du modèle escrow

1. **Protection contre les annulations**
   - Si annulation >24h : remboursement total au joueur
   - Si annulation <24h : 50% joueur, 50% coach

2. **Protection contre les no-shows**
   - Si le joueur ne vient pas, le coach reçoit quand même son argent
   - Si le coach ne vient pas, le joueur est remboursé

3. **Gestion des litiges**
   - L'argent est bloqué jusqu'à confirmation de la session
   - Vous gardez le contrôle en cas de problème

4. **Conformité réglementaire**
   - Respecte les règles de marketplace/plateforme
   - Vous êtes responsable de la transaction

### Règles métier (business-rules.ts)

```typescript
// Session terminée si:
export function isSessionCompleted(endDate: Date): boolean {
  return new Date() >= endDate;
}

// Remboursement total si annulation >24h
FULL_REFUND_HOURS: 24,

// Sinon 50/50
PARTIAL_REFUND_PERCENT: 0.5,
```

---

## 🔧 COMMENT DÉCLENCHER LE TRANSFERT ?

### Option 1 : Appel API manuel depuis l'interface admin

```typescript
// Depuis votre interface admin
const response = await fetch(`/api/reservations/${reservationId}/complete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Option 2 : Bouton dans l'interface coach/joueur

Après la session, afficher un bouton "Confirmer la session réalisée" qui appelle l'API.

### Option 3 : Automatisation avec Cron Job (recommandé)

Créer un endpoint cron qui:
1. Trouve toutes les sessions terminées (`endDate` passée)
2. Avec `transferStatus = PENDING`
3. Appelle automatiquement `/api/reservations/[id]/complete` pour chacune

**Exemple**: Créer `src/app/api/cron/auto-complete-sessions/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // Auth cron secret...

  // Trouver les sessions terminées avec transfer PENDING
  const completedSessions = await prisma.reservation.findMany({
    where: {
      paymentStatus: 'PAID',
      transferStatus: 'PENDING',
      endDate: {
        lt: new Date(), // Session terminée
      },
    },
  });

  // Appeler /complete pour chaque session
  for (const session of completedSessions) {
    await fetch(`${baseUrl}/api/reservations/${session.id}/complete`, {
      method: 'POST',
      headers: { /* auth */ },
    });
  }
}
```

Ajouter dans `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-complete-sessions",
      "schedule": "0 * * * *" // Toutes les heures
    }
  ]
}
```

---

## 🧪 TESTER LE FLUX COMPLET

### Test avec transfert automatique APRÈS session

1. **Créer une réservation test** avec une session très courte (ex: 5 minutes)
   - Modifier la session pour qu'elle se termine dans 5 minutes

2. **Payer la session** (carte test Stripe)
   - ✅ Payment capturé
   - ✅ transferStatus = PENDING
   - ✅ Emails envoyés

3. **Attendre 5 minutes** (endDate passée)

4. **Appeler manuellement** `/api/reservations/[id]/complete`
   ```bash
   curl -X POST http://localhost:3000/api/reservations/cmihvetbw0001uygsjz8rctu5/complete \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Vérifier**
   - ✅ transferStatus = TRANSFERRED
   - ✅ Transfer visible dans Stripe dashboard coach
   - ✅ 90€ dans la balance du coach

### Test avec cron automatique (si implémenté)

1. Créer réservation courte (5 min)
2. Payer
3. Attendre 5 minutes + attendre le cron (1h max)
4. Vérifier automatiquement transféré

---

## 📊 ÉTAT ACTUEL DE VOTRE SYSTÈME

### ✅ Ce qui fonctionne parfaitement

| Fonctionnalité | Status | Fichier |
|----------------|--------|---------|
| Paiement Stripe | ✅ | `src/app/api/stripe/webhook/route.ts` |
| Capture des fonds | ✅ | Webhook Stripe |
| Mise à jour BDD | ✅ | Webhook |
| Emails joueur/coach | ✅ | `src/lib/email/brevo.ts` |
| Canal Discord | ✅ | `src/lib/discord/channel.ts` |
| Compte Stripe Connect coach | ✅ | `acct_1SSkTd2dZ7wpKq4w` |
| Transfert manuel (script) | ✅ | `transfer-to-coach.js` |
| Transfert via API | ✅ | `/api/reservations/[id]/complete` |

### ⏸️ Ce qui nécessite action manuelle

| Fonctionnalité | Status | Solution proposée |
|----------------|--------|-------------------|
| Transfert automatique au coach | ⏸️ Manuel | Cron job auto-complete |
| Détection sessions terminées | ⏸️ Manuel | Cron job toutes les heures |
| Notification "session terminée" | ❌ Absent | Email après endDate |

---

## 🚀 RECOMMANDATIONS

### Court terme (immédiat)

**Option A : Garder le système manuel**
- Ajouter un bouton "Confirmer session réalisée" dans l'interface
- Coach ou joueur clique après la session
- Appelle `/api/reservations/[id]/complete`

**Option B : Automatiser avec délai de sécurité**
- Créer cron job qui s'exécute 1h après chaque `endDate`
- Vérifier si session confirmée par coach/joueur
- Si oui → transfert automatique
- Si litige → garde en PENDING

### Moyen terme (recommandé)

1. **Créer système de confirmation de session**
   ```typescript
   // Nouvelle table SessionConfirmation
   {
     reservationId: string;
     confirmedByCoach: boolean;
     confirmedByPlayer: boolean;
     confirmedAt: Date;
   }
   ```

2. **Workflow amélioré**
   ```
   Session terminée
       ↓
   Email "Confirmer la session" → Coach + Joueur
       ↓
   Les deux confirment (ou 1 seul + 24h délai)
       ↓
   Transfert automatique
   ```

3. **Gestion des litiges**
   ```
   Si 1 seul confirme + 48h sans réponse de l'autre
       ↓
   Transfert automatique (bénéfice du doute)
       ↓

   Si aucun ne confirme + 7 jours
       ↓
   Notification admin pour arbitrage manuel
   ```

---

## 📝 RÉPONSE À VOTRE QUESTION

> "Maintenant j'aimerais savoir si tout fonctionne automatiquement.. Enfin tout le flux complet de mon projet"

### ✅ Automatique jusqu'à la session

Tout est automatique de la réservation jusqu'à la réalisation de la session :
- ✅ Paiement capturé
- ✅ Fonds bloqués en sécurité
- ✅ Emails envoyés
- ✅ Discord créé
- ✅ Sessions visibles dans les dashboards

### ⏸️ Manuel après la session

Le transfert au coach n'est PAS automatique (par design de sécurité) :
- ❌ Nécessite appel à `/api/reservations/[id]/complete`
- ❌ Aucun cron job n'existe pour automatiser
- ⏸️ Vous devez déclencher manuellement ou via script

### 🎯 Pour rendre 100% automatique

Vous devez implémenter **une des options suivantes** :

1. **Cron job simple** - Transfère automatiquement 1h après `endDate`
2. **Système de confirmation** - Transfert après confirmation coach/joueur
3. **Transfert immédiat** - Modifier le webhook pour transférer tout de suite (risqué)

---

## 🧪 TEST RECOMMANDÉ

Pour tester le flux actuel tel qu'il existe :

1. ✅ Créer une réservation (via interface)
2. ✅ Payer avec carte test Stripe
3. ✅ Vérifier emails reçus
4. ✅ Vérifier `transferStatus = PENDING` en BDD
5. ⏸️ **Attendre que `endDate` soit passée**
6. ⏸️ **Appeler manuellement** `/api/reservations/[id]/complete`
7. ✅ Vérifier `transferStatus = TRANSFERRED`
8. ✅ Vérifier fonds dans Stripe dashboard coach

**IMPORTANT** : Sans l'étape 6 (appel manuel), le transfert ne se fera JAMAIS automatiquement.

---

## 💡 CONCLUSION

Votre système est **volontairement non-automatique** pour le transfert au coach. C'est une **décision de design** pour protéger contre les fraudes/litiges.

**Avantages** :
- 🔒 Sécurité maximale
- 🛡️ Contrôle total des paiements
- ⚖️ Gestion des litiges facilitée

**Inconvénients** :
- ⏸️ Nécessite intervention manuelle
- 🕐 Délai entre session et paiement coach
- 👨‍💼 Charge administrative

**Décision à prendre** :
- Garder manuel et assumer la charge ?
- Automatiser avec cron job ?
- Système hybride (confirmation + auto) ?

Je peux vous aider à implémenter l'une de ces solutions si vous le souhaitez ! 🚀
