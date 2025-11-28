# 🚀 GUIDE DE CORRECTION STRIPE CONNECT - ÉTAPE PAR ÉTAPE

## ⏱️ Temps estimé : 30-45 minutes

---

## 📋 PRÉREQUIS

- [ ] Accès au serveur / environnement de production
- [ ] Accès aux fichiers `.env` et `.env.local`
- [ ] Node.js installé
- [ ] Accès au dashboard Stripe (compte admin)
- [ ] Accès à la base de données Prisma

---

## 🔴 PHASE 1 : CONFIGURATION (5 minutes)

### Étape 1.1 : Ajouter la variable d'environnement

**Fichier** : `.env`

```bash
# Ouvrir .env
# Ajouter cette ligne à la fin:
STRIPE_CONNECT_ENABLED=true
```

**Fichier** : `.env.local` (si vous avez ce fichier)

```bash
# Ouvrir .env.local
# Ajouter la même ligne:
STRIPE_CONNECT_ENABLED=true
```

### Étape 1.2 : Vérifier les autres variables Stripe

Assurez-vous que ces variables sont présentes et correctes :

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

---

## 🔧 PHASE 2 : CORRECTION DU COMPTE COACH (10 minutes)

### Étape 2.1 : Corriger le compte en base de données

```bash
# Dans le terminal, à la racine du projet
node fix-coach-stripe-account.js
```

**Résultat attendu** :
```
🔧 Correction du compte Stripe du coach...

📋 État actuel:
  Nom: Olivier Belaud
  Stripe Account ID: acct_mock_1764275654301
  Is Onboarded: false
  Status: INACTIVE

🔄 Mise à jour vers:
  Stripe Account ID: acct_1SSkTd2dZ7wpKq4w
  Is Onboarded: true
  Status: ACTIVE

✅ Coach mis à jour avec succès !
```

### Étape 2.2 : Vérifier le compte Stripe

```bash
node verify-stripe-account.js
```

**Résultat attendu** :
```
🔍 Vérification du compte Stripe acct_1SSkTd2dZ7wpKq4w...

✅ Compte trouvé:

📋 Informations générales:
  ID: acct_1SSkTd2dZ7wpKq4w
  Type: express
  Email: olive.belaud@gmail.com
  Country: FR

🔧 État de configuration:
  Details submitted: ✅ Oui
  Charges enabled: ✅ Oui
  Payouts enabled: ✅ Oui
```

**⚠️ Si des éléments sont ❌** :
- Le coach devra compléter son onboarding Stripe
- Vous pouvez continuer mais le transfert peut être bloqué

### Étape 2.3 : Redémarrer l'application

```bash
# Arrêter l'application Next.js (Ctrl+C)
# Redémarrer
npm run dev
# OU en production
npm run build && npm start
```

### Étape 2.4 : Vérifier dans l'interface

1. Se connecter en tant que coach (olive.belaud@gmail.com)
2. Aller dans **Paramètres**
3. Section **Stripe Connect** doit afficher :
   - ✅ Informations complétées : Oui
   - ✅ Paiements activés : Oui
   - ✅ Versements activés : Oui
4. Le bouton doit afficher : **"Accéder au tableau de bord Stripe"**
5. Cliquer sur le bouton → Dashboard Stripe doit s'ouvrir SANS déconnexion

---

## 💰 PHASE 3 : TRANSFERT DES FONDS (15 minutes)

### Étape 3.1 : Vérifier l'état de la réservation

```bash
node debug-coach-stripe.js
```

Vérifier que :
- La réservation `cmihvetbw0001uygsjz8rctu5` existe
- Payment Status : PAID
- Transfer Status : PENDING
- Stripe Payment ID : pi_3SYBaE2eIgLC7h2i1K7WNiTZ

### Étape 3.2 : Effectuer le transfert

```bash
node transfer-to-coach.js
```

**Résultat attendu** :
```
💰 Transfert des fonds au coach...

📋 Détails de la réservation:
  ID: cmihvetbw0001uygsjz8rctu5
  Status: CONFIRMED
  Payment Status: PAID
  Session: Session Discovery 1h
  Coach: Olivier Belaud
  Joueur: [Nom du joueur]

💵 Montants:
  Prix: 90.00 €
  Coach Net: 90.00 €
  Edgemy Fee: 4.16 €
  Stripe Fee: 1.69 €

🔍 Vérification du PaymentIntent...
  Status: succeeded
  Amount: 95.85 €

🔍 Vérification du compte Stripe du coach...
  Charges enabled: ✅
  Payouts enabled: ✅

💸 Création du transfert de 90.00€...

✅ Transfert créé avec succès !
  Transfer ID: tr_XXXXXXXXXXXXX
  Amount: 90.00 €
  Destination: acct_1SSkTd2dZ7wpKq4w

✅ Réservation mise à jour !

🎉 TRANSFERT TERMINÉ AVEC SUCCÈS !
```

### Étape 3.3 : Vérifier dans Stripe Dashboard

1. Aller sur https://dashboard.stripe.com
2. Onglet **Connect** → **Comptes**
3. Chercher `acct_1SSkTd2dZ7wpKq4w`
4. Cliquer sur le compte
5. Vérifier que le transfert de 90€ apparaît

### Étape 3.4 : Vérifier côté coach

1. Se connecter en tant que coach
2. Cliquer sur **"Accéder au tableau de bord Stripe"**
3. Dans le dashboard Stripe Express :
   - Balance disponible : 90,00€
   - Historique des transactions : voir le paiement

---

## ✅ PHASE 4 : VALIDATION (10 minutes)

### Étape 4.1 : Test de bout en bout

Créer une nouvelle réservation de test :

1. Se connecter en tant que joueur
2. Réserver une session avec le coach
3. Effectuer le paiement test (utiliser carte test Stripe)
4. Vérifier que :
   - ✅ Email de confirmation reçu (joueur + coach)
   - ✅ Réservation créée avec status CONFIRMED
   - ✅ Transfer automatique effectué (vérifier dans les logs)
   - ✅ Coach peut voir le montant dans son dashboard Stripe

**Carte de test Stripe** :
```
Numéro: 4242 4242 4242 4242
Expiration: n'importe quelle date future
CVC: n'importe quels 3 chiffres
```

### Étape 4.2 : Vérifier les logs de l'application

Chercher dans les logs :
```
✅ Compte Stripe Connect créé: acct_XXXXX
✅ Réservation XXXXX marquée comme PAID et CONFIRMED
✅ Email de confirmation envoyé au joueur
✅ Email de notification envoyé au coach
💸 Création du transfert de XX.XX€
✅ Transfert créé avec succès: tr_XXXXX
```

**NE DEVRAIT PLUS VOIR** :
```
❌ ℹ️ Stripe Connect désactivé - Mode développement
❌ Compte mock détecté
❌ acct_mock_XXXXX
```

---

## 📊 CHECKLIST FINALE

Cocher toutes les cases :

### Configuration
- [ ] STRIPE_CONNECT_ENABLED=true dans .env
- [ ] STRIPE_CONNECT_ENABLED=true dans .env.local
- [ ] Application redémarrée

### Coach Database
- [ ] stripeAccountId = acct_1SSkTd2dZ7wpKq4w (pas acct_mock_)
- [ ] isOnboarded = true
- [ ] status = ACTIVE

### Compte Stripe
- [ ] Compte vérifié avec verify-stripe-account.js
- [ ] details_submitted = true
- [ ] charges_enabled = true
- [ ] payouts_enabled = true

### Transfert
- [ ] Réservation cmihvetbw0001uygsjz8rctu5 transférée
- [ ] transferStatus = COMPLETED
- [ ] stripeTransferId renseigné
- [ ] 90€ visible dans le dashboard Stripe du coach

### Interface Coach
- [ ] Bouton affiche "Accéder au tableau de bord Stripe"
- [ ] Clic ouvre le dashboard SANS déconnexion
- [ ] Dashboard Stripe Express fonctionne
- [ ] Balance visible

### Test Nouveau Paiement
- [ ] Nouvelle réservation test créée
- [ ] Paiement test réussi
- [ ] Transfer automatique effectué
- [ ] Emails Brevo envoyés
- [ ] Tout fonctionne de bout en bout

---

## 🚨 EN CAS DE PROBLÈME

### Problème 1 : verify-stripe-account.js échoue

**Erreur** : `Account not found`

**Solution** :
1. Vérifier que `acct_1SSkTd2dZ7wpKq4w` est le bon ID
2. Vérifier dans le dashboard Stripe Connect
3. Si le compte n'existe pas, il faudra :
   - Soit le recréer
   - Soit utiliser un autre compte existant

### Problème 2 : transfer-to-coach.js échoue

**Erreur** : `Cannot transfer to this account`

**Solutions** :
1. Vérifier que `payouts_enabled = true`
2. Le coach doit compléter son onboarding Stripe
3. Cliquer sur "Accéder au tableau de bord Stripe" et compléter les infos

**Erreur** : `Source transaction cannot be used`

**Solutions** :
1. Le PaymentIntent est peut-être déjà transféré
2. Vérifier dans Stripe Dashboard → Paiements
3. Chercher `pi_3SYBaE2eIgLC7h2i1K7WNiTZ`

### Problème 3 : Le bouton déconnecte toujours

**Cause** : Le frontend cache l'ancien état

**Solutions** :
1. Vider le cache du navigateur
2. Déconnexion / Reconnexion
3. Essayer en mode navigation privée
4. Hard refresh (Ctrl+F5)

### Problème 4 : Nouveau paiement crée encore un mock

**Cause** : La variable STRIPE_CONNECT_ENABLED n'est pas prise en compte

**Solutions** :
1. Vérifier que l'application a bien été redémarrée
2. Vérifier avec `console.log(process.env.STRIPE_CONNECT_ENABLED)` dans le code
3. Vérifier qu'il n'y a pas de faute de frappe
4. Vérifier que le fichier .env est à la racine du projet

---

## 📞 SUPPORT

En cas de blocage :
1. Consulter le fichier **RAPPORT-AUDIT-STRIPE-CONNECT.md**
2. Vérifier les logs de l'application
3. Vérifier le dashboard Stripe Connect
4. Contacter le support Stripe si problème avec le compte

---

## 🎉 SUCCÈS !

Si toutes les étapes sont ✅ :

**FÉLICITATIONS !** 🎊

Votre système Stripe Connect est maintenant :
- ✅ Correctement configuré
- ✅ Fonctionnel de bout en bout
- ✅ Prêt pour la production

Le coach peut :
- ✅ Recevoir des paiements
- ✅ Accéder à son dashboard Stripe
- ✅ Voir ses versements
- ✅ Gérer ses revenus

Les nouveaux paiements :
- ✅ Créent de vrais comptes Stripe Connect
- ✅ Effectuent les transferts automatiquement
- ✅ Envoient les emails de confirmation

---

**Date de création** : 27 janvier 2025
**Dernière mise à jour** : 27 janvier 2025
