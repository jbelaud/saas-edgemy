# Configuration Stripe pour Edgemy

## 📋 Vue d'ensemble

L'intégration Stripe a été implémentée pour gérer les paiements des sessions de coaching. Voici comment la configurer et la tester.

## 🔑 Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Stripe - Clés API
STRIPE_SECRET_KEY=sk_test_...           # Clé secrète (depuis Dashboard Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Clé publique (depuis Dashboard Stripe)

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_...         # Secret du webhook (voir section Webhooks)

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000  # En dev, sinon votre URL de production
```

## 🚀 Étapes de configuration

### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte ou connectez-vous
3. Activez le **mode test** (toggle en haut à droite)

### 2. Récupérer les clés API

1. Dans le Dashboard Stripe, allez dans **Developers > API keys**
2. Copiez la **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copiez la **Secret key** → `STRIPE_SECRET_KEY`

### 3. Configurer les webhooks (pour le développement local)

#### Option A : Utiliser Stripe CLI (recommandé pour le dev local)

1. Installez Stripe CLI :
   ```bash
   # Windows (avec Chocolatey)
   choco install stripe-cli

   # macOS (avec Homebrew)
   brew install stripe/stripe-cli/stripe

   # Linux
   # Téléchargez depuis https://github.com/stripe/stripe-cli/releases
   ```

2. Authentifiez-vous :
   ```bash
   stripe login
   ```

3. Écoutez les événements webhook en local :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copiez le **webhook signing secret** affiché → `STRIPE_WEBHOOK_SECRET`

#### Option B : Webhook public (pour la production ou le test avec un domaine public)

1. Dans le Dashboard Stripe, allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez les événements suivants (ces événements sont ceux configurés dans votre webhook) :
   - ✅ `checkout.session.completed` - Session de paiement terminée
   - ✅ `invoice.payment_succeeded` - Paiement de facture réussi (pour abonnements futurs)
   - ✅ `payment_intent.payment_failed` - Échec du paiement
   - ✅ `payment_intent.succeeded` - Paiement réussi
5. Copiez le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## 🧪 Tester l'intégration

### 1. Tester un paiement réussi

1. Démarrez votre serveur de dev :
   ```bash
   pnpm dev
   ```

2. Si vous utilisez Stripe CLI, lancez l'écoute des webhooks dans un autre terminal :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Réservez une session depuis l'interface
4. Sur la page de paiement Stripe, utilisez une **carte de test** :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel code à 3 chiffres
   - Code postal : N'importe lequel

5. Vérifiez que :
   - La redirection vers `/session/success` fonctionne
   - La réservation a le statut `PAID` dans la base de données
   - Le webhook a été reçu (vérifiez les logs)

### 2. Tester une annulation

1. Réservez une session
2. Sur la page Stripe, cliquez sur le bouton "Retour" ou fermez l'onglet
3. Vérifiez que vous êtes redirigé vers `/session/cancel`

### 3. Cartes de test Stripe

| Scénario | Numéro de carte |
|----------|----------------|
| Paiement réussi | `4242 4242 4242 4242` |
| Paiement refusé | `4000 0000 0000 0002` |
| Authentification 3D Secure requise | `4000 0027 6000 3184` |
| Carte expirée | `4000 0000 0000 0069` |
| Fonds insuffisants | `4000 0000 0000 9995` |

Plus de cartes de test : [stripe.com/docs/testing](https://stripe.com/docs/testing)

## 📁 Fichiers créés

### Backend
- `src/app/api/stripe/create-session/route.ts` - Création de session de paiement
- `src/app/api/stripe/webhook/route.ts` - Gestion des événements webhook

### Frontend
- `src/lib/stripe-client.ts` - Utilitaire de redirection vers Stripe
- `src/app/[locale]/session/success/page.tsx` - Page de confirmation
- `src/app/[locale]/session/cancel/page.tsx` - Page d'annulation

### Modifications
- `src/components/coach/public/BookingModal.tsx` - Intégration du paiement

## 🔍 Vérifications importantes

### Base de données
Le modèle `Reservation` doit avoir ces champs :
- `paymentStatus` (enum: PENDING, PAID, FAILED)
- `stripePaymentId` (String, optionnel)

### Variables d'environnement
Vérifiez que toutes les variables sont bien définies :
```bash
# Vérifier les clés Stripe
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo $STRIPE_WEBHOOK_SECRET
echo $NEXT_PUBLIC_APP_URL
```

## 🐛 Débogage

### Les webhooks ne sont pas reçus

1. Vérifiez que Stripe CLI est bien lancé :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. Vérifiez les logs dans le terminal Stripe CLI

3. Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret affiché par Stripe CLI

### Le paiement ne fonctionne pas

1. Ouvrez la console du navigateur (F12) pour voir les erreurs
2. Vérifiez les logs de votre serveur Next.js
3. Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est bien définie et commence par `pk_test_`

### Erreur "Webhook signature verification failed"

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est bien défini dans `.env`
2. Redémarrez votre serveur Next.js après avoir modifié `.env`
3. Si vous utilisez Stripe CLI, vérifiez que le secret correspond

## 📊 Monitoring en production

### Dashboard Stripe

1. **Paiements** : Consultez tous les paiements dans **Payments**
2. **Webhooks** : Vérifiez les événements reçus dans **Developers > Webhooks**
3. **Logs** : Consultez les logs API dans **Developers > Logs**

### Alertes recommandées

Configurez des alertes pour :
- Webhooks qui échouent de manière répétée
- Taux de paiements refusés élevé
- Erreurs API

## 🔐 Sécurité

### Points de vigilance

1. ✅ **NE JAMAIS** commit les clés API dans Git
2. ✅ Les clés secrètes doivent rester côté serveur uniquement
3. ✅ Toujours vérifier la signature des webhooks
4. ✅ Valider les montants côté serveur (jamais faire confiance au client)

### Passage en production

Avant de passer en production :

1. **Désactivez le mode test** dans Stripe
2. Remplacez les clés `pk_test_` et `sk_test_` par les clés live `pk_live_` et `sk_live_`
3. Créez un nouveau webhook avec l'URL de production
4. Testez avec une vraie carte (petit montant)
5. Configurez les remboursements et disputes

## 📞 Support

- **Documentation Stripe** : [stripe.com/docs](https://stripe.com/docs)
- **API Reference** : [stripe.com/docs/api](https://stripe.com/docs/api)
- **Stripe CLI** : [stripe.com/docs/cli](https://stripe.com/docs/stripe-cli)

## ✅ Checklist de mise en production

- [ ] Clés API de production configurées
- [ ] Webhook de production créé et testé
- [ ] Variables d'environnement de prod configurées
- [ ] Test avec vraie carte effectué
- [ ] Emails de confirmation configurés
- [ ] Monitoring et alertes activés
- [ ] CGV et mentions légales à jour
- [ ] Politique de remboursement définie
