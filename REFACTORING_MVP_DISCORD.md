# Refactoring MVP - Retour à Discord uniquement

## Contexte

Nous avions commencé à intégrer Daily.co pour la visioconférence et l'enregistrement automatique des sessions. Après analyse des coûts (99$/mois pour le plan premium requis pour l'enregistrement cloud), nous revenons à une version MVP simplifiée.

## Objectif

- Supprimer tout le code lié à Daily.co et MediaRecorder
- Conserver uniquement la messagerie Discord texte entre coach et joueur
- Garder les fichiers de documentation pour référence future
- Maintenir le flux de réservation et paiement fonctionnel

## Modifications effectuées

### 1. Fichiers supprimés

**Librairie et composants Daily.co :**
- `src/lib/daily.ts` - Service Daily.co
- `src/components/daily/DailySessionDialog.tsx` - Modal vidéo
- `src/components/daily/DailyVideoCall.tsx` - Composant vidéo
- `src/components/daily/CoachRecordingControls.tsx` - Contrôles enregistrement

**Hooks et enregistrement :**
- `src/hooks/useScreenRecording.ts` - Hook MediaRecorder
- `src/components/sessions/SessionReplayViewer.tsx` - Lecteur replay

**APIs :**
- `src/app/api/reservations/[id]/daily-token/` - API tokens Daily
- `src/app/api/upload-replay/` - API upload enregistrements

**Scripts de test/maintenance :**
- `scripts/regenerate-daily-rooms.ts`
- `scripts/delete-olivier-jeremy-reservations.ts`
- `scripts/delete-test-reservations.ts`
- `scripts/list-all-reservations.ts`
- `scripts/test-reservation-system.ts`

**Dossier replays :**
- `public/replays/` - Stockage local des enregistrements

**Package npm :**
- `@daily-co/daily-js` - Désinstallé

### 2. Fichiers conservés (documentation)

✅ Ces fichiers restent dans le projet pour référence future :
- `DAILY_INTEGRATION_PHASE1.md` - Guide d'intégration Daily Phase 1
- `DAILY_RECORDING_INFO.md` - Documentation enregistrement Daily
- `RECORDING_SYSTEM.md` - Architecture système d'enregistrement

### 3. Schéma Prisma modifié

**Champs supprimés du modèle `Reservation` :**
```prisma
// SUPPRIMÉ
dailyRoomUrl      String?  // URL de la room Daily.co
dailyRoomName     String?  // Nom unique de la room Daily.co
dailyRecordingUrl String?  // URL de l'enregistrement Daily.co (post-session)
dailyTokenCoach   String?  // Token Daily pour le coach
dailyTokenPlayer  String?  // Token Daily pour le joueur
```

**Champ conservé :**
```prisma
discordChannelId  String?  // ID du salon Discord privé coach-joueur
```

### 4. Code modifié

#### [src/app/api/reservations/route.ts](src/app/api/reservations/route.ts)
- ✅ Suppression de l'import `createCoachingSessionRoom` de Daily
- ✅ Suppression du bloc de création de room Daily
- ✅ Conservation uniquement de la logique Discord
- ✅ Ajout de logs de rappel pour envoi manuel du lien visio

**Avant :**
```typescript
import { createCoachingSessionRoom } from '@/lib/daily';

// 1. Créer la room Daily.co
const dailyRoom = await createCoachingSessionRoom(...);
await prisma.reservation.update({
  where: { id: result.id },
  data: {
    dailyRoomUrl: dailyRoom.roomUrl,
    dailyRoomName: dailyRoom.roomName,
    dailyTokenCoach: dailyRoom.coachToken,
    dailyTokenPlayer: dailyRoom.playerToken,
  },
});

// 2. Créer le salon Discord
if (coach?.user.discordId && player?.discordId) { ... }
```

**Après :**
```typescript
// Créer le salon Discord texte pour la communication coach-joueur
if (coach?.user.discordId && player?.discordId) {
  // Création du canal Discord privé
  ...
} else {
  console.log('⚠️ Salon Discord non créé: un ou plusieurs utilisateurs n\'ont pas lié leur compte Discord');
  console.log('💡 Rappel: Le coach devra envoyer manuellement un lien de visioconférence (Google Meet, Zoom, etc.)');
}
```

#### [src/app/api/player/sessions/route.ts](src/app/api/player/sessions/route.ts)
- ✅ Suppression des champs `dailyRoomUrl` et `dailyRecordingUrl` du select Prisma

#### [src/components/sessions/SessionActionsButtons.tsx](src/components/sessions/SessionActionsButtons.tsx)
- ✅ Suppression des imports Daily et SessionReplayViewer
- ✅ Suppression du bouton "Rejoindre la session" (vidéo)
- ✅ Suppression du bouton "Replay"
- ✅ Conservation uniquement du bouton "Ouvrir Discord"
- ✅ Simplification de l'interface (suppression des props `reservationId`, `sessionTitle`, `dailyRoomUrl`, `dailyRecordingUrl`)

#### [src/app/[locale]/(app)/player/sessions/page.tsx](src/app/[locale]/(app)/player/sessions/page.tsx)
- ✅ Suppression des champs Daily de l'interface `Reservation`
- ✅ Mise à jour du mapping des données API
- ✅ Mise à jour du composant `SessionActionsButtons` (props simplifiées)

### 5. Base de données

Migration Prisma effectuée avec `npx prisma db push --accept-data-loss` :
- ✅ Colonnes Daily supprimées de la table `Reservation`
- ⚠️ Perte de données : 2 réservations avaient des données Daily (acceptée car retour MVP)

## Flux actuel (MVP)

### Réservation d'une session

1. **Joueur réserve** une session (unique ou pack)
2. **Paiement Stripe** (si session unique ou achat de pack)
3. **Création automatique** d'un canal Discord privé texte entre coach et joueur
4. **Rappel dans les logs** : Le coach doit envoyer manuellement un lien de visio

### Communication coach-joueur

- ✅ **Messagerie texte** : Via Discord (canal privé automatique)
- ❌ **Vidéo** : Le coach envoie manuellement un lien (Google Meet, Zoom, Discord, etc.)
- ❌ **Enregistrement** : Le coach gère manuellement l'enregistrement si nécessaire

## État du projet

### ✅ Fonctionnel
- Réservation de sessions (unique et pack)
- Paiement Stripe
- Création automatique de canaux Discord
- Dashboard coach/joueur
- Suivi des packs (heures restantes)
- Calendrier et disponibilités
- Build Next.js sans erreur

### ⚠️ Manuel (MVP)
- Envoi du lien de visioconférence par le coach
- Gestion de l'enregistrement par le coach
- Partage du replay via Discord ou autre moyen

## Prochaines étapes (si budget disponible)

Si vous décidez de réintégrer Daily.co avec le plan premium (99$/mois) :

1. **Référez-vous aux fichiers de documentation conservés** :
   - `DAILY_INTEGRATION_PHASE1.md`
   - `DAILY_RECORDING_INFO.md`
   - `RECORDING_SYSTEM.md`

2. **Restaurez le code depuis Git** (avant ce refactoring)

3. **Réactivez les champs Prisma** Daily dans le schéma

4. **Réinstallez** `@daily-co/daily-js`

## Build et déploiement

```bash
# Build local
pnpm build

# Le build passe avec succès ✅
# Warnings ESLint mineurs (variables non utilisées) - non bloquants
```

## Notes importantes

- Les fichiers de documentation Daily sont **intentionnellement conservés** pour référence future
- La structure du code Discord reste intacte
- Le schéma Prisma peut facilement être modifié pour rajouter les champs Daily si nécessaire
- L'architecture permet une réintégration future de Daily.co sans refactoring majeur

---

**Date du refactoring :** 14 janvier 2025
**Raison :** Coût du plan Daily.co premium (99$/mois) non viable pour le MVP
**Solution retenue :** Messagerie Discord + lien visio manuel par le coach
