# 📘 RUNBOOK STRIPE - EDGEMY SUPPORT

Guide opérationnel pour l'équipe Support Edgemy sur la gestion des paiements, remboursements, litiges et incidents Stripe.

---

## 🚨 INCIDENTS COURANTS

### 1. Paiement joueur échoué

**Symptômes** :
- Le joueur dit avoir payé mais la réservation n'est pas confirmée
- Statut `paymentStatus: 'FAILED'`

**Diagnostic** :
1. Vérifier dans Stripe Dashboard → Payments
2. Rechercher par email joueur ou montant
3. Voir le code d'erreur (carte refusée, fonds insuffisants, etc.)

**Résolution** :

| Cause | Action |
|-------|--------|
| Carte refusée | Demander au joueur d'utiliser une autre carte |
| Fonds insuffisants | Demander au joueur de recharger sa carte |
| 3D Secure échoué | Demander au joueur de refaire le paiement en validant 3DS |
| Erreur technique Stripe | Créer un ticket Stripe Support |

**Procédure** :
```
1. Contacter le joueur via email/Discord
2. Expliquer la raison de l'échec (visible dans Stripe)
3. Proposer un nouveau lien de paiement
4. Si le problème persiste après 2 tentatives → escalader à l'équipe Tech
```

---

### 2. Coach ne reçoit pas son paiement

**Symptômes** :
- Session complétée mais transfert non effectué
- Statut `transferStatus: 'PENDING'` ou `'FAILED'`

**Diagnostic** :
1. Vérifier dans Admin → Réservations
2. Trouver la réservation concernée
3. Vérifier :
   - `paymentStatus === 'PAID'` ?
   - `transferStatus` ?
   - `stripeTransferId` ?

**Résolution** :

| Statut | Action |
|--------|--------|
| `transferStatus: 'PENDING'` | Session pas encore validée → demander au coach de marquer session comme complétée |
| `transferStatus: 'FAILED'` | Vérifier compte Stripe Connect du coach → escalader à l'équipe Tech |
| `transferStatus: 'TRANSFERRED'` | Transfer effectué → délai bancaire (2-3 jours) |

**Procédure** :
```
1. Vérifier date de la session (doit être terminée)
2. Si session passée mais pas validée → demander au coach de valider
3. Si transfer failed → vérifier compte Stripe Connect :
   - Le compte est-il vérifié ?
   - Les informations bancaires sont-elles complètes ?
4. Si tout est OK côté coach → créer ticket Tech
```

---

### 3. Remboursement joueur

**Scénarios** :

#### A) Coach annule la session (>24h avant)
- ✅ Remboursement total automatique
- Le joueur choisit : reprogrammer ou remboursement

#### B) Joueur annule >24h avant
- ✅ Remboursement total automatique

#### C) Joueur annule <24h avant
- ⚠️ Remboursement partiel (50% joueur, 50% coach)

#### D) Remboursement exceptionnel
- Admin decision (cas par cas)

**Procédure remboursement manuel** :
```sql
1. Aller dans Stripe Dashboard → Payments
2. Rechercher le PaymentIntent (copier depuis Admin)
3. Cliquer "Refund"
4. Choisir montant :
   - Full refund : 100%
   - Partial refund : montant personnalisé
5. Reason : "requested_by_customer" ou "fraudulent"
6. Valider
7. Mettre à jour dans Admin :
   - refundStatus: 'FULL' ou 'PARTIAL'
   - refundAmount: montant en centimes
   - refundReason: raison
```

**⚠️ ATTENTION** :
- Si le coach a déjà reçu le transfer → impossible de rembourser via Stripe
- Dans ce cas → remboursement manuel via virement bancaire

---

### 4. Litige / Chargeback

**Symptômes** :
- Email Stripe "Dispute opened"
- Le joueur conteste le paiement auprès de sa banque

**Procédure** :
```
1. Aller dans Stripe Dashboard → Disputes
2. Lire la raison du litige
3. Rassembler les preuves :
   - Emails de confirmation
   - Messages Discord coach-joueur
   - Logs de la session (durée, participants)
   - CGV acceptées
4. Soumettre les preuves dans Stripe Dashboard
5. Délai : 7 jours pour répondre
6. Si litige perdu :
   - Stripe prélève le montant + frais (15€)
   - Coach est payé normalement (pas impacté)
   - Edgemy assume la perte
```

**Conseils** :
- Répondre TOUJOURS aux litiges (même si la preuve est faible)
- Copier l'équipe Legal sur les litiges >500€
- Documenter tous les échanges

---

### 5. Abonnement coach en retard (PAST_DUE)

**Symptômes** :
- Email Stripe "Payment failed for subscription"
- Coach ne peut plus accéder à certaines fonctionnalités

**Procédure** :
```
1. Contacter le coach via email + Discord
2. Message type :
   "Bonjour [Coach],

   Votre abonnement Edgemy Pro n'a pas pu être renouvelé (paiement échoué).

   Merci de mettre à jour votre carte bancaire ici : [lien customer portal]

   Si le problème persiste, contactez-nous."

3. Si pas de réponse sous 7 jours → suspendre le compte :
   - subscriptionStatus: 'CANCELED'
   - status: 'SUSPENDED'

4. Si paiement régularisé → réactiver automatiquement
```

---

## 🔧 OUTILS ET ACCÈS

### Stripe Dashboard
- URL : https://dashboard.stripe.com
- Rôle Support : Read-only (pas de refund direct, escalader à Admin)
- Rôle Admin : Full access

### Admin Edgemy
- URL : https://app.edgemy.fr/admin
- Sections utiles :
  - Réservations → voir tous les paiements
  - Coachs → voir statuts abonnements
  - Logs → voir les alertes Stripe

### Base de données (read-only via Admin UI)
- Ne PAS modifier directement la DB
- Toujours passer par les routes API

---

## 📊 MÉTRIQUES À SURVEILLER

### Quotidien
- Nombre de paiements échoués (< 5%)
- Nombre de transfers pending (< 10 par jour)
- Nombre d'abonnements PAST_DUE (< 2)

### Hebdomadaire
- Taux de remboursement (< 3%)
- Nombre de litiges (0 idéalement)
- Délai moyen de paiement coach (< 48h après session)

### Mensuel
- Revenu Edgemy total
- Marges moyennes (sessions vs packs)
- Taux de conversion paiement

---

## 🚀 ESCALATION

### Niveau 1 : Support
- Paiements échoués
- Questions générales
- Remboursements simples (<100€)

### Niveau 2 : Admin
- Remboursements >100€
- Litiges
- Problèmes compte Stripe Connect

### Niveau 3 : Tech
- Bugs système
- Webhooks qui échouent
- Erreurs API Stripe

### Niveau 4 : Legal + Finance
- Litiges >500€
- Fraude suspectée
- Audit comptable

---

## 📞 CONTACTS

- Support Stripe : https://support.stripe.com
- Slack interne : #stripe-support
- Email Tech : tech@edgemy.fr
- Email Finance : finance@edgemy.fr

---

## 📝 TEMPLATES EMAILS

### Paiement échoué

```
Objet : Votre paiement Edgemy n'a pas pu être traité

Bonjour [Nom],

Nous avons tenté de prélever le montant de [XX€] pour votre [session/pack] avec [Coach], mais le paiement a échoué.

Raison : [raison technique]

Merci de :
1. Vérifier que votre carte bancaire est valide
2. Vérifier que vous avez des fonds suffisants
3. Réessayer via ce lien : [lien]

Si le problème persiste, contactez-nous à support@edgemy.fr

Cordialement,
L'équipe Edgemy
```

### Transfer coach retardé

```
Objet : Votre paiement Edgemy est en cours de traitement

Bonjour [Coach],

Votre session avec [Joueur] du [date] a bien été validée.

Le paiement de [XX€] sera versé sur votre compte bancaire sous 2-3 jours ouvrés.

Vous pouvez suivre l'état du transfer dans votre espace coach : [lien]

Cordialement,
L'équipe Edgemy
```

---

## ✅ CHECKLIST INCIDENT

Avant de clôturer un ticket :
- [ ] Le problème est-il résolu côté joueur/coach ?
- [ ] Les données sont-elles cohérentes (DB + Stripe) ?
- [ ] Y a-t-il un risque de récidive ?
- [ ] Faut-il documenter ce cas pour le futur ?
- [ ] Faut-il alerter l'équipe Tech ?

---

**Dernière mise à jour** : 2025-01-20
**Version** : 1.0
**Auteur** : Équipe Tech Edgemy
