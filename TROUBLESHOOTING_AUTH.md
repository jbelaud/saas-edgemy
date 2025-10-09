# Dépannage Authentification Better Auth

## ❌ Erreur: "SocketError: other side closed" lors de la connexion Google

### Symptômes
```
ERROR [Better Auth]: [TypeError: fetch failed]
cause: [Error [SocketError]: other side closed]
GET /api/auth/error?error=invalid_code
```

### Cause
Node.js essaie de se connecter à Google via IPv6, mais la connexion échoue. Better Auth ne peut pas échanger le code OAuth avec les serveurs Google.

### Solutions

#### Solution 1 : Forcer IPv4 dans Node.js (RECOMMANDÉ)

Redémarrer le serveur avec cette commande :

**Windows PowerShell:**
```powershell
$env:NODE_OPTIONS="--dns-result-order=ipv4first"; pnpm dev
```

**Linux/Mac:**
```bash
NODE_OPTIONS="--dns-result-order=ipv4first" pnpm dev
```

#### Solution 2 : Désactiver IPv6 temporairement

**Windows:**
1. Ouvrir le Panneau de configuration
2. Réseau et Internet → Centre Réseau et partage
3. Modifier les paramètres de la carte
4. Clic droit sur votre connexion → Propriétés
5. Décocher "Protocole Internet version 6 (TCP/IPv6)"
6. Redémarrer le serveur

#### Solution 3 : Utiliser un proxy local

Si les solutions précédentes ne fonctionnent pas, vous pouvez utiliser un proxy local qui force IPv4.

### Vérification

Après avoir appliqué une solution :

1. Redémarrer le serveur : `pnpm dev`
2. Aller sur `http://localhost:3000/app`
3. Cliquer sur "Se connecter avec Google"
4. Vérifier que la connexion réussit sans erreur

### Variables d'environnement à vérifier

Assurez-vous que ces variables sont bien définies dans `.env.local` :

```bash
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"
```

### Logs attendus en cas de succès

```
POST /api/auth/sign-in/social 200
GET /api/auth/callback/google?state=...&code=... 302
GET /app/dashboard 200
```

## Autres Erreurs Possibles

### Erreur: "invalid_client"

**Cause:** Client ID ou Client Secret Google incorrect

**Solution:**
1. Vérifier les credentials dans Google Cloud Console
2. Vérifier que les variables d'environnement sont correctes
3. Redémarrer le serveur

### Erreur: "redirect_uri_mismatch"

**Cause:** L'URI de redirection n'est pas configurée dans Google Cloud Console

**Solution:**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner votre projet
3. APIs & Services → Credentials
4. Modifier votre OAuth 2.0 Client ID
5. Ajouter : `http://localhost:3000/api/auth/callback/google`

### Erreur: "BETTER_AUTH_SECRET is required"

**Cause:** Variable d'environnement manquante

**Solution:**
```bash
# Générer un secret
openssl rand -base64 32

# Ajouter dans .env.local
BETTER_AUTH_SECRET="votre-secret-généré"
```

## Besoin d'aide ?

Si le problème persiste :
1. Vérifier les logs complets dans le terminal
2. Vérifier la console du navigateur (F12)
3. Consulter la documentation Better Auth : https://www.better-auth.com/docs
