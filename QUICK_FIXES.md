# 🔧 Corrections rapides - Session de test

**Date:** 14 novembre 2025

---

## ✅ Correction 1: "Missing required fields" (RÉSOLU)

**Problème:** L'API `/api/stripe/create-session` renvoyait une erreur 400

**Cause racine:** Le front appelait `/api/stripe/create-session` avec `reservationId: data.id`, mais l'API `/api/reservations` retournait seulement `{reservation: {...}}`, donc `data.id` était `undefined`.

**Symptômes:**
- Console logs montraient `reservationId: undefined`
- Erreur "Missing required fields" sur le front
- Le paramètre `coachName` était aussi manquant

**Solutions appliquées:**

### 1. Fix API `/api/reservations/route.ts` (ligne 267-270)
```typescript
// ✅ APRÈS: Retourner l'ID au niveau racine
return NextResponse.json({
  id: updatedReservation.id,        // Pour le front qui attend data.id
  reservation: updatedReservation,  // Pour compatibilité
}, { status: 201 });
```

### 2. Fallback dans `create-session/route.ts` (ligne 68)
```typescript
// Récupérer le nom du coach depuis la BDD si non fourni
const finalCoachName = coachName || `${coach.firstName} ${coach.lastName}`;
```

### 3. Logs détaillés pour débogage
- Ajout de logs dans `create-session` pour tracer tous les paramètres reçus
- Messages d'erreur détaillés avec chaque champ manquant

---

## ⚠️ Correction 2: Bot Discord (À VÉRIFIER)

**Problème:** "Le bot n'a pas accès au serveur Discord"

**Cause probable:** L'une de ces raisons:
1. `DISCORD_BOT_TOKEN` invalide ou expiré
2. Le bot n'est pas invité sur le serveur
3. Le bot manque de permissions

**Solutions possibles:**

### Option A: Vérifier le token

```env
DISCORD_BOT_TOKEN="your-bot-token-here"
```

### Option B: Réinviter le bot

URL d'invitation (avec les bonnes permissions):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268446736&scope=bot
```

Permissions requises:
- ✅ Manage Channels (créer/modifier salons)
- ✅ View Channels
- ✅ Send Messages
- ✅ Manage Roles (pour les permissions)

### Option C: Désactiver temporairement Discord

Si vous voulez tester le paiement SANS Discord :

**Dans** `src/app/api/reservations/route.ts` :

```typescript
// Commenter la création Discord
/*
if (coach?.user.discordId && player?.discordId) {
  await createDiscordChannel(...);
}
*/

// Ajouter un log
console.log('⚠️ Création Discord désactivée pour test');
```

**IMPORTANT:** Pour le nouveau système, la création du salon Discord se fait APRÈS le paiement confirmé, dans le webhook `checkout.session.completed`.

---

## ✅ Correction 3: Logique packs (IMPLÉMENTÉE)

**Problème initial:** La documentation mentionnait un versement 50/50 (1ère/dernière session)

**Statut actuel:** Paiement au coach **après chaque session** du pack ✔️

### Fonctionnement en production

Pour un pack de 10 sessions à 850€:

```
Sessions 1 → 9 complétées → Transfer 85€ par session
Session 10 complétée        → Transfer 85€ + reliquat si arrondi
```

### Points clés

- ✅ Calcul centralisé dans `calculatePackTransferAmounts()` (montant par session + reliquat)
- ✅ `transferPackInstallment()` crée un transfer Stripe à chaque session complétée
- ✅ `PackageTransferStatus` passe de `PENDING` → `PARTIALLY_TRANSFERRED` → `FULLY_TRANSFERRED`
- ✅ Le joueur règle l'intégralité du pack + frais (Stripe + Edgemy) dès l'achat
- ✅ Les logs `TransferLog` permettent d'auditer chaque versement

### Fichiers mis à jour

1. `src/lib/stripe/business-rules.ts`
   - `PACK_TRANSFER_RULES.PAYOUT_MODE = 'PER_SESSION'`
   - Nouveau helper `calculatePackTransferAmounts()`

2. `prisma/schema.prisma`
   - Suppression des colonnes `firstSessionCompleted` / `firstTransferId`
   - Nouvel enum `PackageTransferStatus` (PENDING → PARTIALLY_TRANSFERRED → FULLY_TRANSFERRED)

3. `src/lib/stripe/transfer.ts`
   - `transferPackInstallment()` déclenche un `transfer` après chaque session
   - Dernière session verse le reliquat éventuel

4. `src/lib/stripe/refund.ts`
   - Notes de remboursement mises à jour (sessions déjà payées individuellement)

### Tests manuels recommandés

1. Créer un pack (ex: 3 sessions à 300€)
2. Compléter chaque session via `/api/reservations/:id/complete`
3. Vérifier dans Stripe Dashboard les transfers successifs (100€ + 100€ + 100€)
4. Vérifier `CoachingPackage.transferStatus` en BDD (`PENDING` → `PARTIALLY_TRANSFERRED` → `FULLY_TRANSFERRED`)

> ℹ️ Les anciennes instructions « 50%/50% » sont obsolètes. La documentation officielle (`PAYMENT_FLOW_IMPLEMENTATION.md`) reflète désormais le paiement par session.

---

## 🧪 Test du flow complet

### ✅ État actuel des corrections

- ✅ **Correction 1 appliquée**: Le `reservationId` est maintenant correctement passé à l'API Stripe
- ✅ **Discord non-bloquant**: Les erreurs Discord n'empêchent pas la création de réservation
- ⏳ **Logique packs**: À implémenter (paiement après chaque session)

### Étape 1: Tester le paiement simple (prêt maintenant !)

1. Créer une réservation via l'interface joueur
2. Le paiement devrait maintenant fonctionner avec carte test `4242 4242 4242 4242`
3. Vérifiez que `transferStatus: PENDING` ✅
4. Vérifiez dans Stripe Dashboard: **PAS de transfer immédiat** ✅

### Étape 2: Compléter la session

```bash
# Forcer endDate dans le passé en BDD
UPDATE "Reservation" SET "endDate" = NOW() - INTERVAL '1 minute' WHERE id = 'xxx';

# Appeler l'API
curl -X POST http://localhost:3000/api/reservations/[ID]/complete \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

### Étape 3: Vérifier le transfer

- ✅ Dans la console: "Transfer complété"
- ✅ Dans Stripe Dashboard: Transfer visible
- ✅ En BDD: `transferStatus: TRANSFERRED`

---

## 🚀 Prochaines étapes

1. ✅ **Corrections appliquées** - Le flow de paiement est prêt à être testé
2. 🧪 **PRÊT POUR TEST** - Vous pouvez maintenant tester une réservation complète
3. ⏳ **Implémenter la logique packs** (paiement après chaque session) - Après validation du test

---

## 📋 Récapitulatif des changements

### Fichiers modifiés:
1. **[src/app/api/reservations/route.ts:267-270](src/app/api/reservations/route.ts#L267-L270)** - Fix retour API avec `id` au niveau racine
2. **[src/app/api/stripe/create-session/route.ts:68](src/app/api/stripe/create-session/route.ts#L68)** - Fallback pour `coachName`
3. **[src/app/api/stripe/create-session/route.ts:15-24](src/app/api/stripe/create-session/route.ts#L15-L24)** - Logs détaillés

### Ce qui devrait maintenant fonctionner:
- ✅ Création de réservation retourne `{id: "...", reservation: {...}}`
- ✅ Le front peut accéder à `data.id` pour le passer à Stripe
- ✅ L'API Stripe reçoit tous les champs requis
- ✅ Le paiement se fait avec `transferStatus: PENDING`
- ✅ Les erreurs Discord ne bloquent pas la création

---

**🎯 Action requise:** Testez maintenant une réservation pour valider que le flow complet fonctionne !
