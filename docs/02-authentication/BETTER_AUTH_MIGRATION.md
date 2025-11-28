# Migration Better Auth - Instructions

## ✅ Setup Complété

Tous les fichiers Better Auth ont été créés avec succès :

### Fichiers créés
- ✅ `src/lib/prisma.ts` - Client Prisma
- ✅ `src/lib/auth.ts` - Configuration Better Auth serveur
- ✅ `src/lib/auth-client.ts` - Client Better Auth pour React
- ✅ `src/app/api/auth/[...all]/route.ts` - Routes API Better Auth
- ✅ `src/components/auth/AuthButton.tsx` - Composant de connexion
- ✅ `src/app/app/unauthorized/page.tsx` - Page d'accès refusé
- ✅ `middleware.ts` - Protection des routes mise à jour
- ✅ `prisma/schema.prisma` - Schéma mis à jour avec Better Auth

### Dépendances installées
- ✅ `better-auth` - Framework d'authentification

## ⚠️ Migration Base de Données Requise

### Situation actuelle
La base de données contient déjà la table `subscribers` avec un enum `Role`.
Le nouveau schéma Better Auth nécessite :
- Renommer l'enum `Role` en `WaitlistRole` pour `Subscriber`
- Créer un nouvel enum `Role` pour `User` (USER, PLAYER, COACH, ADMIN)
- Créer les tables : `user`, `account`, `session`, `verification`, `player`, `coach`

### Option 1 : Migration Manuelle (RECOMMANDÉ pour Production)

#### Étape 1 : Backup de la base de données
```bash
# Exporter les données existantes
pnpm prisma db pull
```

#### Étape 2 : Script SQL de migration
Créer et exécuter ce script SQL dans votre base Neon :

```sql
-- 1. Renommer l'enum Role en WaitlistRole
ALTER TYPE "Role" RENAME TO "WaitlistRole";

-- 2. Créer le nouvel enum Role pour les utilisateurs
CREATE TYPE "Role" AS ENUM ('USER', 'PLAYER', 'COACH', 'ADMIN');

-- 3. Créer la table user
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- 4. Créer la table account
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- 5. Créer la table session
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- 6. Créer la table verification
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- 7. Créer la table player
CREATE TABLE "player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abi" DOUBLE PRECISION,
    "formats" TEXT[],
    "goals" TEXT,
    "winnings" DOUBLE PRECISION,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- 8. Créer la table coach
CREATE TABLE "coach" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "specialties" TEXT[],
    "experience" INTEGER,

    CONSTRAINT "coach_pkey" PRIMARY KEY ("id")
);

-- 9. Créer les index et contraintes
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");
CREATE UNIQUE INDEX "player_userId_key" ON "player"("userId");
CREATE UNIQUE INDEX "coach_userId_key" ON "coach"("userId");

-- 10. Créer les foreign keys
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player" ADD CONSTRAINT "player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach" ADD CONSTRAINT "coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Étape 3 : Vérifier la migration
```bash
pnpm prisma db pull
pnpm prisma generate
```

### Option 2 : Reset Complet (SEULEMENT pour Développement)

⚠️ **ATTENTION : Cette option supprime TOUTES les données !**

```bash
pnpm prisma db push --force-reset
```

Cette commande va :
1. Supprimer toutes les tables existantes
2. Recréer le schéma complet
3. **Perdre toutes les données de la waitlist**

## 🔐 Variables d'Environnement

Assurez-vous d'avoir ces variables dans votre `.env.local` :

```bash
# Database
DATABASE_URL="votre-url-neon"

# Better Auth
BETTER_AUTH_SECRET="votre-secret-32-caracteres-minimum"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🧪 Test après Migration

1. Démarrer le serveur de développement :
```bash
pnpm dev
```

2. Tester la connexion Google :
   - Aller sur `http://localhost:3000/app`
   - Cliquer sur "Se connecter avec Google"
   - Vérifier que la redirection fonctionne

3. Vérifier les données en base :
```bash
pnpm prisma studio
```

## 📚 Routes Better Auth Disponibles

- `GET /api/auth/session` - Récupérer la session
- `POST /api/auth/sign-in/social` - Connexion sociale (Google)
- `POST /api/auth/sign-out` - Déconnexion
- `GET /api/auth/callback/google` - Callback Google OAuth

## 🛡️ Protection des Routes

Le middleware protège automatiquement :
- `/app/coach/*` - Réservé aux COACH et ADMIN
- `/app/player/*` - Réservé aux PLAYER et ADMIN
- `/app/admin/*` - Réservé aux ADMIN uniquement

Les utilisateurs non autorisés sont redirigés vers `/app/unauthorized`.

## 📝 Prochaines Étapes

1. ✅ Choisir l'option de migration (manuelle ou reset)
2. ⏳ Exécuter la migration
3. ⏳ Tester l'authentification Google
4. ⏳ Créer les pages dashboard pour chaque rôle
5. ⏳ Implémenter la logique de création de profils (Player/Coach)
6. ⏳ Déployer sur Vercel avec les variables d'environnement

## 🚀 Déploiement Production

Avant de déployer sur Vercel :

1. Exécuter la migration SQL manuelle sur la base Neon de production
2. Ajouter toutes les variables d'environnement dans Vercel
3. Configurer le redirect URI Google : `https://app.edgemy.fr/api/auth/callback/google`
4. Redéployer l'application

## ❓ Besoin d'Aide ?

- Documentation Better Auth : https://www.better-auth.com/docs
- Documentation Prisma : https://www.prisma.io/docs
- Google OAuth Setup : Voir `GOOGLE_OAUTH_SETUP.md`
