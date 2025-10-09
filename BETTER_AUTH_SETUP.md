# Configuration Better Auth pour Edgemy

## 📚 Documentation officielle

- [Better Auth - Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Better Auth - Google OAuth](https://www.better-auth.com/docs/authentication/google)
- [Better Auth - Discord OAuth](https://www.better-auth.com/docs/authentication/discord)

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Better Auth Configuration (OBLIGATOIRE)
BETTER_AUTH_SECRET="edgemy-super-secret-key-minimum-32-characters-long-for-security"
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Google OAuth (OBLIGATOIRE pour Google Sign-In)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Discord OAuth (OBLIGATOIRE pour Discord Sign-In)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
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

1. **Ajouter les variables d'environnement** dans `.env.local`
2. **Démarrer le serveur** : `pnpm dev`
3. **Tester la configuration** : `http://localhost:3001/app/auth/test`
4. **Tester la page de connexion** : `http://localhost:3001/app/auth/login`
5. **Tester l'inscription/connexion** avec email/password
6. **Tester OAuth** (si configuré)

## Problèmes courants

- **Erreur Prisma** : Redémarrer le serveur après modification du schéma
- **Variables d'environnement** : Redémarrer le serveur après ajout de nouvelles variables
- **OAuth** : Vérifier que les URLs de callback correspondent exactement
