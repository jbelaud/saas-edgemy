# Intégration Discord - Documentation

## 📋 Vue d'ensemble

L'intégration Discord permet de créer automatiquement des salons privés (texte + vocal) pour chaque session de coaching réservée sur la plateforme Edgemy.

## 🎯 Fonctionnalités

### ✅ Implémenté

1. **Liaison compte Discord**
   - OAuth2 Discord pour lier le compte utilisateur
   - Bouton "Connecter Discord" dans les dashboards
   - Vérification unicité du Discord ID

2. **Création automatique de salons**
   - Salon texte privé pour chaque réservation
   - Salon vocal privé associé
   - Permissions limitées au coach et au joueur uniquement
   - Message de bienvenue automatique avec détails de la session

3. **Base de données**
   - Champ `discordId` dans le modèle `User`
   - Champ `discordChannelId` dans le modèle `Reservation`

## 🔧 Configuration

### Variables d'environnement requises

Ajouter dans `.env` :

```env
# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_CATEGORY_ID=your_category_id_here

# Discord OAuth2
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://app.edgemy.fr/api/discord/oauth/callback
```

### Étapes de configuration Discord

#### 1. Créer une application Discord

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquer sur "New Application"
3. Donner un nom (ex: "Edgemy Bot")
4. Copier le **Client ID** → `DISCORD_CLIENT_ID`

#### 2. Créer un Bot

1. Dans l'application, aller dans "Bot"
2. Cliquer sur "Add Bot"
3. Copier le **Token** → `DISCORD_BOT_TOKEN`
4. Activer les intents suivants :
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

#### 3. Configurer OAuth2

1. Dans l'application, aller dans "OAuth2" → "General"
2. Copier le **Client Secret** → `DISCORD_CLIENT_SECRET`
3. Ajouter une Redirect URL :
   - Development: `http://localhost:3000/api/discord/oauth/callback`
   - Production: `https://app.edgemy.fr/api/discord/oauth/callback`

#### 4. Inviter le Bot sur votre serveur

1. Aller dans "OAuth2" → "URL Generator"
2. Sélectionner les scopes :
   - ✅ `bot`
3. Sélectionner les permissions :
   - ✅ Manage Channels
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
4. Copier l'URL générée et ouvrir dans un navigateur
5. Sélectionner votre serveur et autoriser

#### 5. Récupérer les IDs

1. Activer le Mode Développeur dans Discord :
   - Paramètres → Avancés → Mode développeur
2. Clic droit sur votre serveur → "Copier l'identifiant du serveur" → `DISCORD_GUILD_ID`
3. Créer une catégorie "Sessions de Coaching" sur votre serveur
4. Clic droit sur la catégorie → "Copier l'identifiant" → `DISCORD_CATEGORY_ID`

## 📁 Structure des fichiers

### APIs

- `src/app/api/discord/create-channel/route.ts` - Création de salons Discord
- `src/app/api/discord/oauth/authorize/route.ts` - Initie le flux OAuth2
- `src/app/api/discord/oauth/callback/route.ts` - Callback OAuth2
- `src/app/api/user/profile/route.ts` - Récupération profil utilisateur
- `src/app/api/reservations/route.ts` - Modifié pour appeler Discord

### Composants

- `src/components/discord/ConnectDiscordButton.tsx` - Bouton de connexion Discord

### Base de données

- `prisma/schema.prisma` - Modèles `User` et `Reservation` mis à jour

## 🔄 Flux utilisateur

### 1. Liaison du compte Discord

```
Utilisateur → Clique "Connecter Discord"
  ↓
Redirection vers Discord OAuth
  ↓
Utilisateur autorise l'application
  ↓
Callback → Récupération Discord ID
  ↓
Sauvegarde dans la base de données
  ↓
Retour au dashboard avec confirmation
```

### 2. Réservation d'une session

```
Joueur réserve une session
  ↓
API /api/reservations crée la réservation
  ↓
Vérification : coach et joueur ont Discord lié ?
  ↓ OUI
Appel API /api/discord/create-channel
  ↓
Création salon texte + vocal privés
  ↓
Message de bienvenue envoyé
  ↓
Sauvegarde discordChannelId dans Reservation
```

## 🎨 Utilisation du composant

### Dans un dashboard

```tsx
import { ConnectDiscordButton } from '@/components/discord/ConnectDiscordButton';

export default function Dashboard() {
  return (
    <div>
      <h2>Paramètres</h2>
      <ConnectDiscordButton />
    </div>
  );
}
```

## 🔒 Sécurité

- ✅ Authentification requise pour toutes les APIs
- ✅ Vérification que l'utilisateur est propriétaire de la réservation
- ✅ Discord ID unique par utilisateur
- ✅ Salons privés (permissions limitées)
- ✅ Pas d'échec de réservation si Discord échoue

## 🐛 Gestion des erreurs

### Erreurs OAuth

- `access_denied` - Utilisateur a refusé l'accès
- `no_code` - Code d'autorisation manquant
- `config` - Configuration Discord incomplète
- `token_exchange` - Erreur lors de l'échange du token
- `user_fetch` - Erreur lors de la récupération des données
- `already_linked` - Ce Discord ID est déjà utilisé
- `server` - Erreur serveur

### Logs

Tous les appels Discord sont loggés dans la console :
- ✅ Succès de création de salon
- ⚠️ Utilisateurs sans Discord lié
- ❌ Erreurs de création de salon

## 📊 Base de données

### Modèle User

```prisma
model user {
  id        String   @id
  email     String?  @unique
  discordId String?  @unique  // ← Nouveau champ
  // ... autres champs
}
```

### Modèle Reservation

```prisma
model Reservation {
  id               String   @id @default(cuid())
  discordChannelId String?  // ← Nouveau champ
  // ... autres champs
}
```

## 🚀 Prochaines étapes

### Améliorations possibles

1. **Notifications Discord**
   - Rappel 1h avant la session
   - Notification quand le coach/joueur rejoint le salon vocal

2. **Gestion des salons**
   - Archivage automatique après la session
   - Suppression automatique après X jours

3. **Commandes Discord**
   - `/session info` - Afficher les détails de la session
   - `/session reschedule` - Reprogrammer la session
   - `/session cancel` - Annuler la session

4. **Intégration calendrier**
   - Sync avec Google Calendar
   - Événements Discord

## 📝 Notes importantes

- Les salons sont créés dans la catégorie spécifiée par `DISCORD_CATEGORY_ID`
- Le format du nom de salon : `session-coach-joueur-timestamp`
- Les permissions sont configurées pour que seuls le coach et le joueur puissent voir/accéder aux salons
- Si Discord échoue, la réservation est quand même créée (graceful degradation)

## 🔗 Liens utiles

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs/intro)
- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Discord Permissions Calculator](https://discordapi.com/permissions.html)
