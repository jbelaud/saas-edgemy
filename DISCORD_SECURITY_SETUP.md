# Configuration de la sécurité Discord

Ce document explique comment configurer correctement les permissions Discord pour garantir la confidentialité des canaux de coaching.

## 🔒 Principes de sécurité

Les canaux Discord créés pour les sessions de coaching sont **strictement privés** entre :
- Le coach
- Le joueur
- Les administrateurs (pour support/modération)

**Personne d'autre ne peut voir ou accéder à ces canaux.**

## 📋 Prérequis

1. Un serveur Discord pour Edgemy
2. Un bot Discord avec les permissions suivantes :
   - `MANAGE_CHANNELS` - Créer et gérer les canaux
   - `MANAGE_ROLES` - Gérer les permissions des canaux
   - `VIEW_CHANNEL` - Voir les canaux
   - `SEND_MESSAGES` - Envoyer des messages
3. Une catégorie Discord dédiée aux sessions de coaching

## 🛠️ Configuration étape par étape

### Étape 1 : Créer un rôle Admin Discord

1. Sur votre serveur Discord, allez dans **Paramètres du serveur** > **Rôles**
2. Créez un nouveau rôle nommé **"Edgemy Admin"** (ou autre nom de votre choix)
3. Configurez les permissions du rôle :
   - ✅ Voir les salons
   - ✅ Gérer les salons (pour dépannage si nécessaire)
   - ✅ Lire l'historique des messages
   - ✅ Envoyer des messages
4. Attribuez ce rôle aux membres de votre équipe qui doivent avoir accès aux canaux pour le support
5. **Copiez l'ID du rôle** :
   - Activez le Mode Développeur dans Discord (Paramètres utilisateur > Avancé > Mode développeur)
   - Clic droit sur le rôle > Copier l'identifiant

### Étape 2 : Configurer les variables d'environnement

Ajoutez l'ID du rôle admin dans votre fichier `.env` :

```env
DISCORD_ADMIN_ROLE_ID=123456789012345678
```

**Important :** Ajoutez également cette variable dans vos paramètres de déploiement (Vercel, etc.)

### Étape 3 : Vérifier les permissions du bot

Le bot Discord doit avoir les permissions suivantes dans la catégorie des sessions :

```
Permission Value: 268446736
Permissions:
- VIEW_CHANNEL (1024)
- MANAGE_CHANNELS (16)
- MANAGE_ROLES (268435456)
- SEND_MESSAGES (2048)
- READ_MESSAGE_HISTORY (65536)
- CONNECT (1048576) [pour les canaux vocaux]
- SPEAK (2097152) [pour les canaux vocaux]
```

## 🔐 Comment fonctionnent les permissions

### Structure des permissions par canal

Chaque canal créé a les permissions suivantes :

#### Canal Texte (💬)
```javascript
{
  @everyone: DENY VIEW_CHANNEL,           // Personne ne voit par défaut
  coach: ALLOW VIEW + SEND_MESSAGES,      // Coach peut voir et écrire
  player: ALLOW VIEW + SEND_MESSAGES,     // Joueur peut voir et écrire
  edgemy-admin: ALLOW VIEW + SEND_MESSAGES // Admins peuvent voir et écrire
}
```

#### Canal Vocal (🎙️)
```javascript
{
  @everyone: DENY VIEW_CHANNEL,           // Personne ne voit par défaut
  coach: ALLOW VIEW + CONNECT + SPEAK,    // Coach peut rejoindre et parler
  player: ALLOW VIEW + CONNECT + SPEAK,   // Joueur peut rejoindre et parler
  edgemy-admin: ALLOW VIEW + CONNECT + SPEAK // Admins peuvent rejoindre et parler
}
```

### Valeurs des permissions Discord

| Permission | Valeur | Description |
|------------|--------|-------------|
| `VIEW_CHANNEL` | 1024 | Voir le canal |
| `SEND_MESSAGES` | 2048 | Envoyer des messages |
| `CONNECT` | 1048576 | Se connecter au canal vocal |
| `SPEAK` | 2097152 | Parler dans le canal vocal |
| Combined (Text) | 3072 | VIEW + SEND |
| Combined (Voice) | 3146752 | VIEW + CONNECT + SPEAK |

## 📊 Audit et traçabilité

Le système enregistre automatiquement dans les logs :

### Création de canal
```javascript
{
  action: 'CHANNEL_CREATED',
  textChannelId: '...',
  voiceChannelId: '...',
  coachId: '...',
  playerId: '...',
  coachDiscordId: '...',
  playerDiscordId: '...',
  timestamp: '2025-01-01T12:00:00.000Z',
  initiatedBy: 'userId'
}
```

### Réutilisation de canal
```javascript
{
  action: 'CHANNEL_REUSED',
  textChannelId: '...',
  voiceChannelId: '...',
  coachId: '...',
  playerId: '...',
  timestamp: '2025-01-01T12:00:00.000Z',
  initiatedBy: 'userId'
}
```

## ✅ Test de sécurité

Pour vérifier que les canaux sont bien privés :

1. **Créez une session de test** entre un coach et un joueur
2. **Connectez-vous à Discord** avec un compte qui n'a pas le rôle admin
3. **Vérifiez** que vous ne voyez PAS les canaux créés
4. **Connectez-vous avec un compte admin** et vérifiez que vous voyez les canaux
5. **Vérifiez les logs** dans la console du serveur pour confirmer l'audit trail

## 🚨 Dépannage

### Les canaux ne sont pas créés
- Vérifiez que le bot a bien les permissions `MANAGE_CHANNELS` dans la catégorie
- Vérifiez que `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID` et `DISCORD_CATEGORY_ID` sont corrects

### Les admins ne voient pas les canaux
- Vérifiez que `DISCORD_ADMIN_ROLE_ID` est correct
- Vérifiez que les membres ont bien le rôle assigné
- Rafraîchissez Discord ou reconnectez-vous

### Les utilisateurs non autorisés voient les canaux
- Vérifiez que le bot a bien `MANAGE_ROLES` permission
- Vérifiez qu'aucun autre rôle ne donne des permissions qui contournent les restrictions
- Vérifiez que la catégorie n'a pas de permissions héritées problématiques

## 📝 Meilleures pratiques

1. **Limitez le nombre d'admins** : Seules les personnes essentielles doivent avoir le rôle admin
2. **Auditez régulièrement** : Vérifiez les logs pour détecter les accès inhabituels
3. **Rotation des tokens** : Changez régulièrement le `DISCORD_BOT_TOKEN` en production
4. **Monitoring** : Mettez en place des alertes pour les erreurs de création de canaux
5. **Backup** : Sauvegardez régulièrement la base `CoachPlayerChannel`

## 🔗 Ressources

- [Discord API - Permissions](https://discord.com/developers/docs/topics/permissions)
- [Discord API - Channels](https://discord.com/developers/docs/resources/channel)
- [Discord Permission Calculator](https://discordapi.com/permissions.html)

---

**Note :** Cette configuration garantit la confidentialité totale des échanges entre coach et joueur, tout en permettant un support technique si nécessaire.
