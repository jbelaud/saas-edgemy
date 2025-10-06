# Configuration Better Auth pour Edgemy

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (optionnel pour le développement)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Discord OAuth (optionnel pour le développement)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Configuration des méthodes d'auth disponibles
NEXT_PUBLIC_AUTH_METHODS="credential,google,discord"
```

## Configuration OAuth

### Google OAuth
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API Google+ 
4. Créer des identifiants OAuth 2.0
5. Ajouter les URLs de redirection :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://app.edgemy.fr/api/auth/callback/google` (production)

### Discord OAuth
1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une nouvelle application
3. Aller dans OAuth2 → General
4. Ajouter les URLs de redirection :
   - `http://localhost:3000/api/auth/callback/discord` (développement)
   - `https://app.edgemy.fr/api/auth/callback/discord` (production)

## Test de la configuration

1. Démarrer le serveur : `pnpm dev`
2. Aller sur `http://localhost:3000/app/auth/login`
3. Tester la connexion email/password
4. Tester la connexion Google (si configuré)

## Problèmes courants

- **Erreur Prisma** : Redémarrer le serveur après modification du schéma
- **Variables d'environnement** : Redémarrer le serveur après ajout de nouvelles variables
- **OAuth** : Vérifier que les URLs de callback correspondent exactement
