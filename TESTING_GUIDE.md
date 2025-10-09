# 🧪 Guide de Test - Améliorations Authentification

## Objectif
Tester toutes les améliorations apportées au système d'authentification et à la sécurité de l'application.

---

## 🚀 Démarrage Rapide

### 1. Lancer le serveur de développement
```bash
pnpm dev
```

### 2. Ouvrir l'application
- **Landing** : http://localhost:3000
- **App** : http://localhost:3001/app

---

## ✅ Tests à Effectuer

### Test 1 : Protection des Routes

**Objectif** : Vérifier que les routes protégées redirigent vers login

#### Étapes
1. **Ouvrir en navigation privée** (pour ne pas avoir de session)
2. Accéder directement à : `http://localhost:3001/app/dashboard`
3. **Résultat attendu** :
   - ✅ Redirection automatique vers `/app/auth/login`
   - ✅ URL contient `?callbackUrl=/app/dashboard`

4. Essayer aussi :
   - `http://localhost:3001/app/profile`
   - `http://localhost:3001/app/settings`

**✅ Test réussi si** : Toutes les routes protégées redirigent vers login avec callbackUrl

---

### Test 2 : Inscription avec Email/Password

**Objectif** : Tester le flux d'inscription complet

#### Étapes
1. Aller sur : `http://localhost:3001/app/auth/register`
2. Remplir le formulaire :
   - **Nom** : Test User
   - **Email** : test@example.com
   - **Mot de passe** : TestPassword123
   - **Confirmer** : TestPassword123
3. Cliquer sur "S'inscrire"

**Résultats attendus** :
- ✅ Spinner visible sur le bouton ("Inscription en cours...")
- ✅ Message de succès "Inscription réussie !"
- ✅ Redirection automatique vers `/app/dashboard` après 1.5s
- ✅ Dashboard affiche le nom "Test User"

#### Test des Erreurs

**A. Email déjà existant**
1. Réessayer avec le même email
2. **Résultat attendu** : Message "Cet email est déjà utilisé. Voulez-vous vous connecter ?"

**B. Mot de passe faible**
1. Essayer avec mot de passe "123"
2. **Résultat attendu** : Message de validation Zod "Le mot de passe doit contenir au moins 8 caractères"

**C. Mots de passe non identiques**
1. Saisir des mots de passe différents
2. **Résultat attendu** : Message "Les mots de passe ne correspondent pas"

**✅ Test réussi si** : Tous les cas d'erreur affichent des messages clairs

---

### Test 3 : Connexion avec Email/Password

**Objectif** : Tester le flux de connexion

#### Étapes
1. Se déconnecter (menu utilisateur → Déconnexion)
2. Aller sur : `http://localhost:3001/app/auth/login`
3. Remplir le formulaire :
   - **Email** : test@example.com
   - **Mot de passe** : TestPassword123
4. Cliquer sur "Se connecter"

**Résultats attendus** :
- ✅ Spinner visible ("Connexion en cours...")
- ✅ Redirection vers `/app/dashboard`
- ✅ Dashboard affiche les bonnes données utilisateur

#### Test des Erreurs

**A. Mot de passe incorrect**
1. Saisir un mauvais mot de passe
2. **Résultat attendu** : Message "Email ou mot de passe incorrect. Veuillez réessayer."

**B. Email inexistant**
1. Saisir un email qui n'existe pas
2. **Résultat attendu** : Message "Aucun compte trouvé avec cet email. Voulez-vous vous inscrire ?"

**✅ Test réussi si** : Messages d'erreur sont clairs et contextuels

---

### Test 4 : Redirection avec CallbackUrl

**Objectif** : Vérifier la redirection intelligente après connexion

#### Étapes
1. **Se déconnecter**
2. Essayer d'accéder à : `http://localhost:3001/app/profile`
3. **Résultat attendu** : Redirection vers login avec `?callbackUrl=/app/profile`
4. Se connecter avec des identifiants valides
5. **Résultat attendu** : Redirection vers `/app/profile` (pas dashboard)

**✅ Test réussi si** : Utilisateur est redirigé vers la page demandée initialement

---

### Test 5 : Dashboard Dynamique

**Objectif** : Vérifier l'affichage des données utilisateur réelles

#### Étapes
1. Se connecter
2. Aller sur : `http://localhost:3001/app/dashboard`

**Résultats attendus** :
- ✅ Spinner visible pendant le chargement (si lent)
- ✅ Nom de l'utilisateur affiché : "Test User"
- ✅ Email affiché : "test@example.com"
- ✅ Pas de données hardcodées

**✅ Test réussi si** : Dashboard affiche les vraies données de l'utilisateur connecté

---

### Test 6 : Mot de Passe Oublié

**Objectif** : Tester le flux de réinitialisation

#### Étapes
1. Aller sur : `http://localhost:3001/app/auth/login`
2. Cliquer sur "Mot de passe oublié ?"
3. **Résultat attendu** : Redirection vers `/app/auth/forgot-password`
4. Saisir un email : test@example.com
5. Cliquer sur "Envoyer le lien"

**Résultats attendus** :
- ✅ Spinner visible ("Envoi en cours...")
- ✅ Message de succès avec icône verte
- ✅ Texte : "Si un compte existe avec cet email, vous recevrez un lien..."
- ✅ Bouton "Retour à la connexion" visible

6. Cliquer sur "Retour à la connexion"
7. **Résultat attendu** : Retour sur `/app/auth/login`

**✅ Test réussi si** : Flow complet fonctionne sans erreur

---

### Test 7 : Connexion Google OAuth (Si configuré)

**Objectif** : Tester l'authentification Google

#### Prérequis
- Variables d'environnement Google configurées
- Voir `GOOGLE_OAUTH_SETUP.md`

#### Étapes
1. Aller sur : `http://localhost:3001/app/auth/login`
2. Cliquer sur le bouton "Google"
3. **Résultat attendu** : Redirection vers Google
4. Sélectionner un compte Google
5. **Résultat attendu** : Retour sur `/app/dashboard`
6. Vérifier que le nom et email Google sont affichés

**✅ Test réussi si** : Connexion Google fonctionne et crée un compte

---

### Test 8 : Déconnexion

**Objectif** : Vérifier le flux de déconnexion

#### Étapes
1. Être connecté
2. Cliquer sur l'avatar en haut à droite
3. Cliquer sur "Déconnexion"

**Résultats attendus** :
- ✅ Redirection vers la landing page `/`
- ✅ Impossible d'accéder à `/app/dashboard` (redirection login)
- ✅ Header affiche "Connexion" au lieu de l'avatar

**✅ Test réussi si** : Déconnexion complète et session supprimée

---

### Test 9 : Page d'Accueil App

**Objectif** : Vérifier la redirection automatique

#### Étapes
1. **Non connecté** : Aller sur `http://localhost:3001/app`
2. **Résultat attendu** : Page d'accueil avec boutons "Connexion" et "Devenir coach"

3. **Connecté** : Se connecter puis aller sur `http://localhost:3001/app`
4. **Résultat attendu** : Redirection automatique vers `/app/dashboard`

**✅ Test réussi si** : Comportement différent selon l'état de connexion

---

### Test 10 : Navigation et Menu Utilisateur

**Objectif** : Tester la navigation dans l'app

#### Étapes
1. Se connecter
2. Cliquer sur l'avatar en haut à droite
3. **Résultat attendu** : Menu dropdown avec :
   - Nom et email de l'utilisateur
   - "Profil"
   - "Paramètres"
   - "Déconnexion" (en rouge)

4. Tester les liens de navigation dans le header :
   - Dashboard
   - Trouver un coach
   - Mes sessions

**✅ Test réussi si** : Tous les éléments de navigation sont présents

---

## 🐛 Tests d'Erreurs et Edge Cases

### Edge Case 1 : Session Expirée
1. Se connecter
2. Supprimer manuellement le cookie `better-auth.session_token` (DevTools)
3. Rafraîchir la page
4. **Résultat attendu** : Redirection vers login

### Edge Case 2 : Connexion Simultanée
1. Se connecter dans un onglet
2. Ouvrir un nouvel onglet en navigation privée
3. Essayer de se connecter avec le même compte
4. **Résultat attendu** : Connexion réussie (Better Auth gère les sessions multiples)

### Edge Case 3 : Validation Côté Client
1. Essayer de soumettre un formulaire vide
2. **Résultat attendu** : Messages de validation Zod affichés

---

## 📊 Checklist Complète

### Authentification
- [ ] Inscription email/password fonctionne
- [ ] Connexion email/password fonctionne
- [ ] Connexion Google OAuth fonctionne (si configuré)
- [ ] Déconnexion fonctionne
- [ ] Messages d'erreur sont clairs

### Sécurité
- [ ] Routes protégées redirigent vers login
- [ ] CallbackUrl fonctionne correctement
- [ ] Session expirée redirige vers login
- [ ] Middleware bloque l'accès non autorisé

### UX
- [ ] Spinners visibles pendant les actions
- [ ] Messages de succès affichés
- [ ] Messages d'erreur contextuels
- [ ] Redirections fluides

### Dashboard
- [ ] Données utilisateur réelles affichées
- [ ] Loading state visible
- [ ] Pas de données hardcodées

### Mot de Passe Oublié
- [ ] Page accessible
- [ ] Formulaire fonctionne
- [ ] Message de succès affiché
- [ ] Retour à la connexion fonctionne

---

## 🚀 Tests en Production

### Avant le Déploiement
1. Tous les tests ci-dessus passent en local
2. Build Vercel réussi : `pnpm build`
3. Pas d'erreurs TypeScript
4. Pas d'erreurs de lint

### Après le Déploiement
1. Tester tous les flux sur `https://app.edgemy.fr`
2. Vérifier les logs Vercel
3. Tester sur mobile et desktop
4. Vérifier les performances (Lighthouse)

---

## 📝 Rapport de Bugs

Si vous trouvez un bug, documentez :
- **URL** : Où le bug se produit
- **Étapes** : Comment reproduire
- **Résultat attendu** : Ce qui devrait se passer
- **Résultat réel** : Ce qui se passe
- **Console** : Erreurs JavaScript (F12)
- **Network** : Erreurs API (F12 → Network)

---

## ✅ Validation Finale

Tous les tests sont passés si :
- ✅ Aucune route protégée n'est accessible sans auth
- ✅ Tous les formulaires ont des messages d'erreur clairs
- ✅ Dashboard affiche les vraies données utilisateur
- ✅ Redirections fonctionnent correctement
- ✅ Aucune erreur dans la console
- ✅ Build Vercel réussi

---

**Dernière mise à jour** : 2025-10-09  
**Version** : 1.0
