# Configuration de Stripe Connect

## Pourquoi Stripe Connect ?

Stripe Connect permet aux coachs de recevoir des paiements directement sur leur compte bancaire. C'est essentiel pour la marketplace car cela permet de :
- Gérer automatiquement les versements aux coachs
- Prendre une commission sur chaque paiement
- Assurer la conformité fiscale
- Fournir un dashboard de revenus aux coachs

## Mode Développement (Mock)

Par défaut, le projet est configuré en mode développement avec Stripe Connect désactivé. Cela permet de tester l'onboarding sans avoir besoin de configurer Stripe Connect.

**Configuration actuelle dans `.env` et `.env.local` :**
```bash
STRIPE_CONNECT_ENABLED="false"
```

Avec cette configuration, lorsqu'un coach essaie de connecter Stripe dans l'onboarding :
- Un compte mock est créé (`acct_mock_XXXXX`)
- Aucun appel n'est fait à l'API Stripe Connect
- Le coach passe directement à l'étape suivante

## Activation de Stripe Connect (Production)

### Étape 1 : Activer Connect sur votre compte Stripe

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com/)
2. Cliquez sur **"Connect"** dans le menu de gauche
3. Suivez les étapes pour activer Stripe Connect
4. Choisissez le type : **Standard** ou **Express** (recommandé : Express pour les marketplaces)

Documentation officielle : https://stripe.com/docs/connect/enable-payment-acceptance-guide

### Étape 2 : Configurer votre plateforme

Une fois Connect activé, vous devez configurer les paramètres de votre plateforme :

1. **Settings → Connect settings**
2. Configurer les **Branding** (logo, couleurs)
3. Ajouter les URLs de redirection autorisées :
   - Production : `https://app.edgemy.fr/coach/settings`
   - Test : `http://localhost:3000/coach/settings`

### Étape 3 : Mettre à jour les variables d'environnement

**Pour la production (Vercel) :**
```bash
STRIPE_CONNECT_ENABLED="true"
NEXT_PUBLIC_APP_URL="https://app.edgemy.fr"
```

**Pour le développement (si vous voulez tester avec le vrai Stripe Connect) :**
```bash
STRIPE_CONNECT_ENABLED="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Étape 4 : Configurer les commissions (optionnel)

Pour prendre une commission sur chaque paiement, vous devez configurer les **Application Fees** dans votre code.

Actuellement, la commission est définie dans l'interface mais pas encore implémentée côté paiement.

## Flux d'onboarding avec Stripe Connect activé

1. Le coach clique sur "Connecter Stripe" dans l'étape 4 de l'onboarding
2. Un compte Stripe Express est créé via l'API
3. Le coach est redirigé vers Stripe pour compléter son profil (informations bancaires, identité, etc.)
4. Stripe redirige vers `/coach/settings?stripe_success=true` une fois terminé
5. Le coach peut maintenant recevoir des paiements

## Dépannage

### Erreur : "You can only create new accounts if you've signed up for Connect"

Cette erreur signifie que Stripe Connect n'est pas activé sur votre compte. Solutions :
1. Activer Stripe Connect (voir Étape 1)
2. OU garder `STRIPE_CONNECT_ENABLED="false"` pour utiliser le mode mock

### Les paiements ne fonctionnent pas en production

Vérifiez que :
- `STRIPE_CONNECT_ENABLED="true"` est défini sur Vercel
- `NEXT_PUBLIC_APP_URL` pointe vers votre domaine de production
- Les URLs de redirection sont configurées dans le Dashboard Stripe
- Vous utilisez la clé API de production (commence par `sk_live_`)

### Comment tester en local avec Stripe Connect réel ?

1. Activer Connect sur votre Dashboard Stripe (mode test)
2. Mettre `STRIPE_CONNECT_ENABLED="true"` dans `.env.local`
3. Redémarrer le serveur de développement
4. Suivre le flux d'onboarding - vous serez redirigé vers Stripe

## Webhooks Stripe Connect (À implémenter)

Pour être notifié des événements Stripe Connect (transferts, mises à jour de compte, etc.), vous devrez configurer des webhooks :

1. Dashboard Stripe → Developers → Webhooks
2. Ajouter un endpoint : `https://app.edgemy.fr/api/stripe/webhook`
3. Sélectionner les événements à écouter :
   - `account.updated`
   - `account.external_account.created`
   - `transfer.created`
   - etc.

## Ressources

- [Documentation Stripe Connect](https://stripe.com/docs/connect)
- [Guide d'intégration Express](https://stripe.com/docs/connect/express-accounts)
- [API Account Links](https://stripe.com/docs/api/account_links)
- [Commissions et Application Fees](https://stripe.com/docs/connect/charges#application-fees)
