# Configuration Google OAuth pour Edgemy

## 🎯 Objectif
Permettre aux utilisateurs de se connecter/s'inscrire avec leur compte Google.

---

## 📋 Étapes de configuration

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner "Edgemy" si existant
3. Activer le projet

### 2. Configurer l'écran de consentement OAuth

1. Dans le menu latéral : **APIs & Services** → **OAuth consent screen**
2. Choisir **External** (pour permettre à tous les utilisateurs Google de se connecter)
3. Remplir les informations :
   - **App name** : Edgemy
   - **User support email** : votre email
   - **Developer contact** : votre email
4. **Scopes** : Ajouter les scopes suivants :
   - `userinfo.email`
   - `userinfo.profile`
5. Cliquer sur **Save and Continue**

### 3. Créer les identifiants OAuth 2.0

1. Dans le menu : **APIs & Services** → **Credentials**
2. Cliquer sur **Create Credentials** → **OAuth client ID**
3. Choisir **Web application**
4. Configurer :

   **Nom** : Edgemy Web Client

   **Authorized JavaScript origins** :
   ```
   http://localhost:3001
   https://app.edgemy.fr
   ```

   **Authorized redirect URIs** :
   ```
   http://localhost:3001/api/auth/callback/google
   https://app.edgemy.fr/api/auth/callback/google
   ```

5. Cliquer sur **Create**
6. **IMPORTANT** : Copier le **Client ID** et le **Client Secret**

---

## 🔐 Configuration des variables d'environnement

### Développement local (`.env.local`)

Ajouter ces lignes dans votre fichier `.env.local` :

```bash
# Google OAuth
GOOGLE_CLIENT_ID="votre-client-id-google.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret-google"

# Better Auth (si pas déjà présent)
BETTER_AUTH_SECRET="edgemy-super-secret-key-minimum-32-characters-long-for-security"
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### Production (Vercel)

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet **saas-edgemy**
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter les variables suivantes pour **Production** :

```bash
GOOGLE_CLIENT_ID=votre-client-id-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret-google
BETTER_AUTH_SECRET=votre-secret-production-different-du-dev
BETTER_AUTH_URL=https://app.edgemy.fr
NEXT_PUBLIC_APP_URL=https://app.edgemy.fr
```

5. **Redéployer** l'application après avoir ajouté les variables

---

## ✅ Test de la configuration

### En développement

1. Démarrer le serveur : `pnpm dev`
2. Aller sur : `http://localhost:3001/app/auth/login`
3. Cliquer sur le bouton **Google**
4. Vous devriez être redirigé vers Google pour l'authentification
5. Après connexion, retour sur `/app/dashboard`

### En production

1. Aller sur : `https://app.edgemy.fr/app/auth/login`
2. Cliquer sur le bouton **Google**
3. Authentification Google
4. Redirection vers le dashboard

---

## 🐛 Problèmes courants

### Erreur "redirect_uri_mismatch"

**Cause** : L'URL de callback n'est pas autorisée dans Google Cloud Console

**Solution** :
1. Vérifier que l'URL dans Google Cloud Console correspond EXACTEMENT
2. Format attendu : `http://localhost:3001/api/auth/callback/google`
3. Pas d'espace, pas de slash final

### Erreur "invalid_client"

**Cause** : Client ID ou Client Secret incorrect

**Solution** :
1. Vérifier les variables d'environnement
2. Redémarrer le serveur après modification du `.env.local`
3. Vérifier qu'il n'y a pas d'espaces avant/après les valeurs

### Erreur "Access blocked: This app's request is invalid"

**Cause** : Écran de consentement OAuth non configuré correctement

**Solution** :
1. Retourner dans **OAuth consent screen**
2. Vérifier que les scopes `userinfo.email` et `userinfo.profile` sont ajoutés
3. Publier l'application (passer en "In production" si nécessaire)

### L'utilisateur n'est pas créé dans la base de données

**Cause** : Problème avec Prisma ou la configuration Better Auth

**Solution** :
1. Vérifier que Prisma est à jour : `pnpm prisma generate`
2. Vérifier la connexion à la base de données (variable `DATABASE_URL`)
3. Regarder les logs du serveur pour plus de détails

---

## 📊 Vérification de la base de données

Après une connexion Google réussie, vérifier que l'utilisateur est bien créé :

```bash
# Ouvrir Prisma Studio
pnpm prisma studio

# Ou via SQL direct (Neon)
# Vérifier la table "user" et "account"
```

L'utilisateur devrait avoir :
- Un enregistrement dans la table `user`
- Un enregistrement dans la table `account` avec `providerId = "google"`

---

## 🚀 Prochaines étapes

Une fois Google OAuth configuré, vous pouvez :
1. Ajouter Discord OAuth (même principe)
2. Activer la vérification d'email pour les inscriptions email/password
3. Ajouter l'authentification à deux facteurs (2FA)

---

## 📝 Notes importantes

- **Ne jamais commiter** les fichiers `.env.local` ou `.env`
- Les secrets de production doivent être **différents** du développement
- Régénérer les secrets régulièrement pour la sécurité
- Tester en mode incognito pour éviter les problèmes de cache
