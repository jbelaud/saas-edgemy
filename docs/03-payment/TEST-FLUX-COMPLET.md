# 🧪 TEST DU FLUX COMPLET - CHECKLIST

## 🎯 OBJECTIF
Vérifier que tout le flux de paiement fonctionne automatiquement de bout en bout, sans intervention manuelle.

---

## ✅ ÉTAPE 1 : PRÉPARATION (5 min)

### 1.1 Vérifier la configuration

- [x] `STRIPE_CONNECT_ENABLED=true` dans `.env` ✅
- [x] Application redémarrée ✅
- [x] Coach a un vrai compte Stripe (`acct_1SSkTd2dZ7wpKq4w`) ✅
- [ ] Webhook Stripe configuré et fonctionnel
- [ ] Brevo configuré pour les emails

### 1.2 Vérifier l'état actuel

```bash
node debug-coach-stripe.js
```

**Attendu** :
- ✅ Stripe Account ID: `acct_1SSkTd2dZ7wpKq4w` (pas `acct_mock_`)
- ✅ Status: `ACTIVE`
- ✅ Is Onboarded: `true`

---

## 🧪 ÉTAPE 2 : TEST NOUVELLE RÉSERVATION (15 min)

### 2.1 Créer une réservation test

**En tant que joueur** :

1. Se connecter (ou créer un compte joueur test)
2. Aller sur le profil du coach Olivier Belaud
3. Choisir une session disponible (ex: "Review session Cash")
4. Cliquer sur "Réserver"
5. Remplir les informations
6. Aller au paiement

### 2.2 Effectuer le paiement test

**Carte de test Stripe** :
```
Numéro: 4242 4242 4242 4242
Expiration: 12/34 (n'importe quelle date future)
CVC: 123 (n'importe quels 3 chiffres)
Nom: Test Player
```

**Cliquer sur "Payer"**

### 2.3 Vérifications immédiates

**Page de succès** :
- [ ] Redirection vers `/session/success?session_id=XXX`
- [ ] Message "Paiement réussi !"
- [ ] Affichage de la date/heure de la session
- [ ] Affichage du montant payé
- [ ] **PAS** d'affichage des frais détaillés (coach, Stripe, Edgemy)
- [ ] Bouton "Voir mes sessions"

**Emails** :
- [ ] Email de confirmation reçu par le joueur (Brevo)
- [ ] Email de notification reçu par le coach (Brevo)

---

## 🔍 ÉTAPE 3 : VÉRIFICATION BASE DE DONNÉES (5 min)

### 3.1 Vérifier la réservation créée

```bash
node debug-coach-stripe.js
```

**Chercher la nouvelle réservation (la première dans la liste)** :

- [ ] `Payment Status: PAID`
- [ ] `Status: CONFIRMED`
- [ ] `Stripe Payment ID: pi_XXX` (présent)
- [ ] `Transfer Status: TRANSFERRED` ⚠️ **CRITIQUE**

### 3.2 Si `Transfer Status: PENDING`

**C'est un problème !** Le transfert automatique n'a pas fonctionné.

**Vérifier les logs de l'application** :
```bash
# Dans les logs du serveur Next.js
# Chercher:
✅ Réservation XXX marquée comme PAID et CONFIRMED
💸 Création du transfert de XX.XX€
✅ Transfert créé avec succès: tr_XXX
```

**Si pas de logs de transfert** → Le webhook n'a pas créé le transfert automatiquement.

---

## 📊 ÉTAPE 4 : VÉRIFICATION STRIPE (5 min)

### 4.1 Vérifier dans le Dashboard Admin Stripe

1. Aller sur https://dashboard.stripe.com/test
2. Menu **Paiements** → Chercher le dernier paiement
3. Vérifier :
   - [ ] Montant correct (prix coach + 6.5%)
   - [ ] Status: Réussi
   - [ ] Metadata : `reservationId`, `coachId`, etc.

### 4.2 Vérifier le transfert

1. Menu **Connect** → **Comptes**
2. Cliquer sur `acct_1SSkTd2dZ7wpKq4w`
3. Onglet **Paiements** ou **Transfers**
4. Vérifier :
   - [ ] Nouveau transfert visible
   - [ ] Montant = prix coach (90€ par exemple)
   - [ ] Status: Réussi

### 4.3 Vérifier la balance du coach

```bash
node verify-transfer.js
```

**Attendu** :
- [ ] Balance augmentée du montant du transfert
- [ ] Fonds disponibles ou en attente selon le calendrier de payout

---

## 👤 ÉTAPE 5 : VÉRIFICATION CÔTÉ COACH (5 min)

### 5.1 Interface Coach

**Se connecter en tant que coach** :

1. Aller dans **Mes sessions**
2. Vérifier :
   - [ ] Nouvelle session visible
   - [ ] Status: Confirmé
   - [ ] Date/heure correctes
   - [ ] Nom du joueur affiché

### 5.2 Dashboard Stripe Express

1. Aller dans **Paramètres**
2. Section **Stripe Connect**
3. Cliquer sur **"Accéder au tableau de bord Stripe"**
4. Vérifier :
   - [ ] Dashboard s'ouvre (pas de déconnexion)
   - [ ] Nouveau transfert visible
   - [ ] Balance mise à jour
   - [ ] Historique des transactions à jour

---

## 🎮 ÉTAPE 6 : VÉRIFICATION CÔTÉ JOUEUR (5 min)

### 6.1 Interface Joueur

**Se connecter en tant que joueur** :

1. Aller dans **Mes sessions**
2. Vérifier :
   - [ ] Nouvelle session visible
   - [ ] Status: Confirmé
   - [ ] Date/heure correctes
   - [ ] Nom du coach affiché
   - [ ] Bouton pour rejoindre Discord (si canal créé)

### 6.2 Email de confirmation

Vérifier dans la boîte mail du joueur :
- [ ] Email reçu avec le bon template
- [ ] Informations de session correctes
- [ ] Lien "Voir mes sessions" fonctionne
- [ ] Pas de détails de frais visibles

---

## 🔥 ÉTAPE 7 : VÉRIFICATION WEBHOOK (CRITIQUE) (10 min)

### 7.1 Vérifier que le webhook a bien traité le paiement

**Logs de l'application** :

Chercher dans les logs Next.js (terminal où tourne `npm run dev`) :

```
✅ Checkout session complétée pour la réservation XXX
💰 Ventilation paiement: { coachNetCents: XXX, ... }
✅ Réservation XXX marquée comme PAID et CONFIRMED
✅ Email de confirmation envoyé au joueur
✅ Email de notification envoyé au coach
[Discord] Canal prêt pour la réservation XXX
```

### 7.2 SI LE WEBHOOK N'A PAS CRÉÉ LE TRANSFERT

**C'est le problème principal !** Le webhook doit créer le transfert automatiquement.

**Vérifier** :
1. Le webhook Stripe est-il configuré ?
2. L'URL du webhook est-elle correcte ?
3. Le webhook reçoit-il l'événement `checkout.session.completed` ?

**Pour tester le webhook** :

```bash
# Vérifier les webhooks reçus dans Stripe Dashboard
https://dashboard.stripe.com/test/webhooks
```

---

## ✅ ÉTAPE 8 : CHECKLIST FINALE

### 🎯 Flux automatique complet

- [ ] Réservation créée automatiquement
- [ ] Paiement Stripe capturé
- [ ] Webhook reçu et traité
- [ ] Réservation mise à jour (PAID + CONFIRMED)
- [ ] **Transfer automatique créé** ⚠️ **POINT CRITIQUE**
- [ ] Emails envoyés (joueur + coach)
- [ ] Canal Discord créé (si activé)
- [ ] Coach voit la session dans son interface
- [ ] Joueur voit la session dans son interface
- [ ] Coach voit le transfert dans Stripe Dashboard
- [ ] Balance du coach mise à jour

### 🚨 Points de blocage possibles

Si l'un de ces points échoue :

1. **Transfer Status reste PENDING**
   - ❌ Le webhook ne crée pas le transfert automatiquement
   - 🔧 Solution : Vérifier le code du webhook

2. **Emails non reçus**
   - ❌ Brevo mal configuré ou clé API incorrecte
   - 🔧 Solution : Vérifier `BREVO_API_KEY` dans `.env`

3. **Canal Discord non créé**
   - ❌ Discord mal configuré ou bot inactif
   - 🔧 Solution : Vérifier configuration Discord

4. **Page de succès affiche les frais**
   - ❌ Frontend pas mis à jour
   - 🔧 Solution : Redémarrer Next.js

---

## 🎯 RÉSULTAT ATTENDU

### ✅ SUCCÈS COMPLET

Si toutes les cases sont cochées :
- 🎉 Le flux est 100% automatique
- 🎉 Aucune intervention manuelle nécessaire
- 🎉 Production ready !

### ⚠️ SUCCÈS PARTIEL

Si le transfert est PENDING :
- ✅ Le paiement fonctionne
- ✅ Les emails fonctionnent
- ❌ Le transfert automatique ne fonctionne pas
- 🔧 **Action requise** : Corriger le webhook

### ❌ ÉCHEC

Si plusieurs points échouent :
- 🔧 Consulter le rapport d'audit
- 🔧 Vérifier les logs de l'application
- 🔧 Vérifier la configuration Stripe

---

## 📝 RAPPORT DE TEST

### Informations à noter

**Date du test** : __________
**Heure** : __________
**Réservation ID** : __________
**Payment Intent ID** : __________
**Transfer ID** : __________

### Résultats

**Paiement** : ✅ / ❌
**Webhook** : ✅ / ❌
**Transfer automatique** : ✅ / ❌
**Emails** : ✅ / ❌
**Discord** : ✅ / ❌
**Dashboard coach** : ✅ / ❌

### Problèmes rencontrés

1. __________________________________________
2. __________________________________________
3. __________________________________________

### Actions correctives nécessaires

1. __________________________________________
2. __________________________________________
3. __________________________________________

---

## 🔧 SCRIPT DE TEST AUTOMATIQUE

Pour automatiser ce test, vous pouvez créer un script :

```javascript
// test-complete-flow.js
// TODO: Créer un script qui :
// 1. Crée une réservation via API
// 2. Simule un paiement test
// 3. Attend le webhook
// 4. Vérifie que tout est créé correctement
```

---

**Prochaine étape** : Exécuter ce test complet et reporter les résultats ! 🚀
