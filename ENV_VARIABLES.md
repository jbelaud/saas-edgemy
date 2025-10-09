# Variables d'environnement requises pour Edgemy App

## 🔴 Variables OBLIGATOIRES

### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### Better Auth (CRITIQUE)
```bash
BETTER_AUTH_SECRET="votre-secret-minimum-32-caracteres-long-pour-securite"
BETTER_AUTH_URL="http://localhost:3001"  # Dev
# BETTER_AUTH_URL="https://app.edgemy.fr"  # Production
```

### Next.js Public
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3001"  # Dev
# NEXT_PUBLIC_APP_URL="https://app.edgemy.fr"  # Production
```

---

## 🟡 Variables OPTIONNELLES (OAuth)

### Google OAuth
```bash
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

### Discord OAuth
```bash
DISCORD_CLIENT_ID="votre-discord-client-id"
DISCORD_CLIENT_SECRET="votre-discord-client-secret"
```

---

## 📋 Configuration Vercel (edgemy-app)

### Pour le projet **edgemy-app** sur Vercel :

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet **edgemy-app**
3. **Settings** → **Environment Variables**
4. Ajouter ces variables pour **Production** :

```bash
DATABASE_URL=postgresql://...  # Votre URL Neon
BETTER_AUTH_SECRET=votre-secret-production-different-du-dev
BETTER_AUTH_URL=https://app.edgemy.fr
NEXT_PUBLIC_APP_URL=https://app.edgemy.fr
GOOGLE_CLIENT_ID=votre-client-id-production
GOOGLE_CLIENT_SECRET=votre-client-secret-production
```

5. **IMPORTANT** : Cliquer sur **Redeploy** après avoir ajouté les variables

---

## ⚠️ Erreurs courantes

### Erreur : "You are using the default secret"
**Cause** : `BETTER_AUTH_SECRET` n'est pas définie

**Solution** :
- Ajouter `BETTER_AUTH_SECRET` dans Vercel
- Générer un secret sécurisé : `openssl rand -base64 32`
- Redéployer l'application

### Erreur : "useLanguage must be used within a LanguageProvider"
**Cause** : Problème de build avec les composants client

**Solution** : Corrigé dans le layout (LanguageProvider ajouté)

---

## 🔐 Génération de secrets sécurisés

### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Linux/Mac
```bash
openssl rand -base64 32
```

### En ligne
[Generate Random String](https://www.random.org/strings/)
- Length: 32
- Characters: Alphanumeric

---

## 📝 Checklist de déploiement

- [ ] `DATABASE_URL` configurée dans Vercel
- [ ] `BETTER_AUTH_SECRET` configurée (différente du dev)
- [ ] `BETTER_AUTH_URL` = `https://app.edgemy.fr`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://app.edgemy.fr`
- [ ] Google OAuth configuré (optionnel)
- [ ] Redéploiement effectué après ajout des variables
- [ ] Test de connexion en production

---

## 🚀 Déploiement

Après avoir ajouté/modifié des variables d'environnement dans Vercel :

1. Aller dans **Deployments**
2. Cliquer sur les **3 points** du dernier déploiement
3. Cliquer sur **Redeploy**
4. Attendre la fin du build
5. Tester sur `https://app.edgemy.fr`
