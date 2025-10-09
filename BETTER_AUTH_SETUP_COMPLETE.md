# ✅ Better Auth Setup - Complété

## 📦 Installation Effectuée

```bash
✅ better-auth@1.3.27 installé
✅ Prisma Client généré
```

## 📁 Fichiers Créés

### Configuration Backend
- ✅ `src/lib/prisma.ts` - Client Prisma avec singleton
- ✅ `src/lib/auth.ts` - Configuration Better Auth serveur
- ✅ `src/lib/auth-client.ts` - Client Better Auth pour React
- ✅ `src/types/better-auth.d.ts` - Types TypeScript étendus

### Routes API
- ✅ `src/app/api/auth/[...all]/route.ts` - Handler Better Auth (GET/POST)

### Composants
- ✅ `src/components/auth/AuthButton.tsx` - Bouton de connexion/déconnexion avec dropdown

### Pages
- ✅ `src/app/app/unauthorized/page.tsx` - Page d'accès refusé
- ✅ `src/app/app/page.tsx` - Mise à jour avec AuthButton
- ✅ `src/app/app/dashboard/page.tsx` - Mise à jour avec session utilisateur

### Middleware
- ✅ `middleware.ts` - Protection des routes par rôle

### Base de Données
- ✅ `prisma/schema.prisma` - Schéma mis à jour avec:
  - Enum `WaitlistRole` (PLAYER, COACH) pour `Subscriber`
  - Enum `Role` (USER, PLAYER, COACH, ADMIN) pour `User`
  - Tables: `user`, `account`, `session`, `verification`, `player`, `coach`

### Documentation
- ✅ `BETTER_AUTH_MIGRATION.md` - Guide de migration de la base de données
- ✅ `BETTER_AUTH_SETUP_COMPLETE.md` - Ce fichier

## 🔐 Variables d'Environnement Requises

Ajoutez ces variables dans votre `.env.local` :

```bash
# Database (déjà configuré)
DATABASE_URL="votre-url-neon"

# Better Auth (NOUVEAU)
BETTER_AUTH_SECRET="générer-avec-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (NOUVEAU)
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Prochaines Étapes

### 1. Migration de la Base de Données

⚠️ **IMPORTANT** : Vous devez migrer la base de données avant de tester.

**Option A - Migration Manuelle (RECOMMANDÉ pour Production)**
- Suivez les instructions dans `BETTER_AUTH_MIGRATION.md`
- Exécutez le script SQL fourni dans votre base Neon

**Option B - Reset Complet (SEULEMENT pour Dev)**
```bash
pnpm prisma db push --force-reset
```
⚠️ Cette commande supprime TOUTES les données !

### 2. Configurer Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer l'API Google+ 
4. Créer des identifiants OAuth 2.0
5. Ajouter les URIs de redirection :
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://app.edgemy.fr/api/auth/callback/google`
6. Copier Client ID et Client Secret dans `.env.local`

### 3. Générer un Secret Better Auth

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### 4. Tester l'Authentification

```bash
# Démarrer le serveur
pnpm dev

# Ouvrir dans le navigateur
http://localhost:3000/app
```

1. Cliquer sur "Se connecter avec Google"
2. Autoriser l'application
3. Vérifier la redirection vers `/app/dashboard`
4. Vérifier que votre nom et email s'affichent

### 5. Vérifier la Base de Données

```bash
pnpm prisma studio
```

Vérifier que :
- La table `user` contient votre compte
- La table `account` contient la connexion Google
- La table `session` contient votre session active

## 🛡️ Protection des Routes

Le middleware protège automatiquement :

| Route | Accès |
|-------|-------|
| `/app/dashboard` | Tous les utilisateurs connectés |
| `/app/coach/*` | COACH et ADMIN uniquement |
| `/app/player/*` | PLAYER et ADMIN uniquement |
| `/app/admin/*` | ADMIN uniquement |
| `/app/unauthorized` | Page d'erreur d'accès |

## 📚 Routes API Better Auth

Better Auth crée automatiquement ces routes :

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/sign-in/social` | Connexion sociale (Google) |
| POST | `/api/auth/sign-out` | Déconnexion |
| GET | `/api/auth/session` | Récupérer la session |
| GET | `/api/auth/callback/google` | Callback OAuth Google |

## 🎨 Utilisation dans les Composants

### Client Component

```tsx
'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';

export function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Chargement...</div>;

  if (!session?.user) {
    return (
      <button onClick={() => signIn.social({ provider: 'google' })}>
        Se connecter
      </button>
    );
  }

  return (
    <div>
      <p>Bonjour {session.user.name}</p>
      <p>Rôle: {session.user.role}</p>
      <button onClick={() => signOut()}>Déconnexion</button>
    </div>
  );
}
```

### Server Component

```tsx
import { auth } from '@/lib/auth';

export default async function ServerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <h1>Bonjour {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Rôle: {session.user.role}</p>
    </div>
  );
}
```

## 🔧 Dépannage

### Erreur: "You are using the default secret"
- Générer et ajouter `BETTER_AUTH_SECRET` dans `.env.local`
- Redémarrer le serveur

### Erreur: "Prisma schema validation error"
- Exécuter `pnpm prisma generate`
- Vérifier que le schéma est correct

### Erreur: "Cannot find module '@/lib/auth'"
- Vérifier que tous les fichiers ont été créés
- Redémarrer le serveur TypeScript

### La connexion Google ne fonctionne pas
- Vérifier `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
- Vérifier l'URI de redirection dans Google Cloud Console
- Vérifier `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL`

### Erreur: "Property 'role' does not exist"
- Le fichier `src/types/better-auth.d.ts` étend les types
- Redémarrer le serveur TypeScript dans VS Code

## 📦 Déploiement Production (Vercel)

### 1. Variables d'Environnement Vercel

Dans le projet `edgemy-app` sur Vercel :

```bash
DATABASE_URL=votre-url-neon-production
BETTER_AUTH_SECRET=générer-un-nouveau-secret-différent-du-dev
BETTER_AUTH_URL=https://app.edgemy.fr
NEXT_PUBLIC_APP_URL=https://app.edgemy.fr
GOOGLE_CLIENT_ID=votre-client-id-production
GOOGLE_CLIENT_SECRET=votre-client-secret-production
```

### 2. Google OAuth Production

Ajouter l'URI de redirection production :
```
https://app.edgemy.fr/api/auth/callback/google
```

### 3. Migration Base de Données

Exécuter le script SQL de migration sur la base Neon de production (voir `BETTER_AUTH_MIGRATION.md`)

### 4. Redéployer

```bash
git add .
git commit -m "feat: ajout authentification Better Auth avec Google OAuth"
git push
```

## ✅ Checklist Finale

- [ ] Variables d'environnement configurées
- [ ] Google OAuth configuré
- [ ] Base de données migrée
- [ ] Test de connexion Google réussi
- [ ] Session utilisateur affichée dans le dashboard
- [ ] Protection des routes testée
- [ ] Variables Vercel configurées (pour prod)
- [ ] Déployé en production

## 📖 Documentation

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Auth](https://nextjs.org/docs/authentication)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)

## 🎉 Félicitations !

Le setup Better Auth est maintenant complet. Vous pouvez :
- ✅ Authentifier des utilisateurs avec Google
- ✅ Gérer les sessions
- ✅ Protéger les routes par rôle
- ✅ Créer des profils Player/Coach

Prochaines fonctionnalités à implémenter :
1. Page de création de profil (Player/Coach)
2. Dashboard spécifique par rôle
3. Gestion des sessions de coaching
4. Système de réservation
