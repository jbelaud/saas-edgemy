# 🚀 GUIDE DU TRANSFERT AUTOMATIQUE

## ✅ FÉLICITATIONS !

Votre système de transfert automatique est maintenant **100% opérationnel** ! 🎉

Les fonds seront automatiquement transférés aux coachs **1 heure après la fin de chaque session**, sans aucune intervention manuelle.

---

## 📋 CE QUI A ÉTÉ IMPLÉMENTÉ

### 1. Endpoint Cron Job ✅
**Fichier**: `src/app/api/cron/auto-complete-sessions/route.ts`

Cet endpoint s'exécute automatiquement toutes les heures et :
- 🔍 Trouve toutes les sessions terminées (`endDate` passée)
- 💰 Avec paiement validé (`paymentStatus = PAID`)
- ⏳ En attente de transfert (`transferStatus = PENDING`)
- ✅ Coach avec compte Stripe valide (pas `acct_mock_`)
- 💸 Crée automatiquement le transfert Stripe
- 📝 Met à jour la base de données (`transferStatus = TRANSFERRED`)

### 2. Configuration Vercel Cron ✅
**Fichier**: `vercel.json`

```json
{
  "path": "/api/cron/auto-complete-sessions",
  "schedule": "0 * * * *"
}
```

**Schedule**: Toutes les heures à heure pile (00:00, 01:00, 02:00, etc.)

### 3. Variable d'environnement de sécurité ✅
**Fichier**: `.env.example` (mise à jour)

```bash
CRON_SECRET="your_cron_secret_here"
```

Cette clé protège l'endpoint cron contre les accès non autorisés.

### 4. Script de test ✅
**Fichier**: `test-auto-complete-cron.js`

Pour tester localement le cron avant déploiement.

---

## 🔧 CONFIGURATION REQUISE

### 1. Générer un CRON_SECRET

```bash
# Sous Linux/Mac:
openssl rand -base64 32

# Sous Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Ajouter à votre `.env` et `.env.local`

```bash
# Ajoutez cette ligne à vos fichiers .env
CRON_SECRET="la-clé-générée-ci-dessus"
```

### 3. Configurer sur Vercel (Production)

Quand vous déployez sur Vercel :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez `CRON_SECRET` avec la même valeur
3. Scope: **Production**, **Preview**, **Development**
4. Sauvegardez

---

## 🧪 TESTER LE SYSTÈME

### Option 1 : Test Local (Développement)

**Étape 1**: Démarrer votre serveur Next.js
```bash
npm run dev
```

**Étape 2**: Exécuter le script de test
```bash
node test-auto-complete-cron.js
```

**Résultat attendu**:
```
🧪 TEST DU CRON AUTO-COMPLETE-SESSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RÉSULTAT DU CRON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Message: Aucune session à compléter
📊 Sessions traitées: 0
```

### Option 2 : Test avec Session Réelle

**Créer une session de test courte** :

1. Créez une nouvelle réservation via l'interface
2. Payez avec carte test Stripe: `4242 4242 4242 4242`
3. **IMPORTANT**: Modifiez manuellement la date de fin dans la BDD

```sql
-- Mettre la session terminée il y a 1 heure
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 hour'
WHERE id = 'votre-reservation-id';
```

4. Relancez le test :
```bash
node test-auto-complete-cron.js
```

**Résultat attendu**:
```
✅ SESSIONS COMPLÉTÉES AVEC SUCCÈS:
   1. cmihvetbw0001uygsjz8rctu5

🎉 TRANSFERT(S) AUTOMATIQUE(S) RÉUSSI(S) !
```

5. Vérifiez :
   - ✅ Base de données → `transferStatus = TRANSFERRED`
   - ✅ Stripe Dashboard → Nouveau transfer visible
   - ✅ Coach Dashboard → Balance mise à jour

### Option 3 : Test en Production (Vercel)

Sur Vercel, le cron s'exécute automatiquement toutes les heures.

**Vérifier l'exécution** :
1. Allez dans **Vercel Dashboard** → Votre projet
2. **Deployments** → Sélectionnez le dernier deployment
3. **Functions** → Cherchez `/api/cron/auto-complete-sessions`
4. Cliquez pour voir les logs d'exécution

**Forcer une exécution manuelle** (sans attendre l'heure) :
```bash
curl -X GET https://votre-app.vercel.app/api/cron/auto-complete-sessions \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

## 📊 FLUX AUTOMATIQUE COMPLET

### Avant (Manuel) ❌

```
Joueur paie → Webhook → Réservation PAID → transferStatus PENDING
                                                    ⏸️
                                              (Bloqué ici)
                                                    ⏸️
                                        Intervention manuelle requise
                                                    ⏸️
                                        POST /api/reservations/[id]/complete
                                                    ↓
                                        Transfer créé → Coach payé
```

### Maintenant (Automatique) ✅

```
Joueur paie
    ↓
Webhook Stripe
    ↓
✅ Paiement capturé
✅ Réservation CONFIRMED + PAID
✅ transferStatus = PENDING
✅ Emails envoyés
✅ Discord créé
    ↓
Session réalisée (joueur + coach)
    ↓
endDate passée
    ↓
⏰ Cron job (toutes les heures)
    ↓
🔍 Détecte session terminée
    ↓
💸 Crée transfer automatiquement
    ↓
✅ transferStatus = TRANSFERRED
✅ Coach reçoit son argent
✅ Tout est automatique !
```

---

## 🎯 RÈGLES DE TRANSFERT

### Conditions de transfert automatique

Le cron transfère uniquement si **TOUTES** ces conditions sont réunies :

1. ✅ `paymentStatus = PAID`
2. ✅ `transferStatus = PENDING`
3. ✅ `endDate < maintenant` (session terminée)
4. ✅ Coach a un compte Stripe réel (pas `acct_mock_`)
5. ✅ `coach.stripeAccountId` existe

### Délai de transfert

- **Session se termine à** : 14h00
- **Cron s'exécute à** : 15h00 (heure suivante)
- **Transfert créé à** : 15h00
- **Fonds disponibles** : Selon calendrier Stripe (généralement 2-7 jours)

**Exemple** :
- Session : Lundi 14h00 - 15h00
- Transfert créé : Lundi 15h00 (automatique)
- Fonds sur compte coach : Jeudi (J+3 par défaut Stripe)

---

## 🔒 SÉCURITÉ

### Protection contre les doubles transferts

Le cron vérifie `transferStatus = PENDING` avant de transférer.
Si déjà `TRANSFERRED`, il ignore la session.

### Protection contre les sessions non payées

Le cron vérifie `paymentStatus = PAID` avant de transférer.
Si `PENDING` ou `FAILED`, il ignore la session.

### Protection contre les comptes mock

Le cron ignore les coachs avec `stripeAccountId` commençant par `acct_mock_`.

### Authentification cron

L'endpoint vérifie le header `Authorization: Bearer CRON_SECRET`.
Sans ce secret, l'accès est refusé (401 Unauthorized).

---

## 📝 LOGS ET MONITORING

### Logs de développement

Quand le cron s'exécute, vous verrez dans la console :

```
🤖 [CRON] Début de l'auto-complétion des sessions...
📋 [CRON] 2 session(s) trouvée(s) à compléter

🔄 [CRON] Traitement réservation cmihvetbw0001uygsjz8rctu5
   Coach: Olivier Belaud
   Joueur: Test Player
   Session: Review session Cash
   Type: SINGLE
   Montant: 90.00€
   💰 Transfert session unique
   ✅ Transfert réussi: tr_xxxxxxxxxxxxx
   💸 Montant transféré: 90.00€

✅ [CRON] Auto-complétion terminée
   Succès: 2/2
   Échecs: 0/2
```

### Logs de production (Vercel)

1. **Vercel Dashboard** → Votre projet
2. **Functions** → `/api/cron/auto-complete-sessions`
3. Cliquez sur une exécution pour voir les logs complets

---

## 🐛 DÉPANNAGE

### Problème : "Aucune session à compléter"

**Causes possibles** :
1. Aucune session terminée avec `transferStatus = PENDING`
2. Toutes les sessions déjà transférées (`TRANSFERRED`)
3. Sessions pas encore terminées (`endDate` dans le futur)

**Solution** :
Créez une session test et modifiez `endDate` dans le passé.

### Problème : "Unauthorized (401)"

**Cause** : `CRON_SECRET` incorrect ou manquant

**Solution** :
```bash
# Vérifier dans .env
echo $CRON_SECRET

# Ajouter si manquant
CRON_SECRET="votre-secret-ici"
```

### Problème : Transfert échoue

**Causes possibles** :
1. Coach n'a pas de `stripeAccountId`
2. Coach a un compte mock (`acct_mock_`)
3. Compte Stripe du coach incomplet
4. Erreur Stripe (API down, etc.)

**Solution** :
Vérifiez les logs pour voir l'erreur exacte :
```
❌ Échec transfert: Le coach n'a pas configuré son compte Stripe Connect
```

### Problème : Cron ne s'exécute pas sur Vercel

**Causes possibles** :
1. Cron désactivé sur Vercel (plan gratuit limité)
2. `vercel.json` pas déployé
3. Build échoué

**Solution** :
1. Vérifiez le plan Vercel (Hobby+ requis pour crons fiables)
2. Vérifiez le fichier `vercel.json` dans le repo
3. Redéployez après avoir ajouté `vercel.json`

---

## 🎉 FÉLICITATIONS !

Votre système de paiement est maintenant **100% automatique** ! 🚀

### Ce qui est automatique ✅

- ✅ Capture du paiement
- ✅ Confirmation de réservation
- ✅ Emails de confirmation
- ✅ Canal Discord
- ✅ **NOUVEAU** : Transfert automatique au coach après session

### Prochaines étapes (optionnel)

1. **Notifications de transfert** :
   - Email au coach quand transfert effectué
   - "Votre paiement de 90€ est en route !"

2. **Dashboard admin** :
   - Vue d'ensemble des transferts automatiques
   - Statistiques (nombre de transferts/jour, etc.)

3. **Système de confirmation de session** :
   - Coach/joueur confirme que session réalisée
   - Transfert seulement si confirmé (protection supplémentaire)

4. **Gestion des litiges** :
   - Si aucune confirmation après 7 jours
   - Notification admin pour arbitrage manuel

---

## 📞 SUPPORT

Si vous rencontrez un problème :

1. **Vérifiez les logs** du cron job
2. **Testez localement** avec `test-auto-complete-cron.js`
3. **Vérifiez la configuration** :
   - `CRON_SECRET` défini
   - `STRIPE_CONNECT_ENABLED="true"`
   - Coach a un vrai compte Stripe

---

**Créé le** : 2025-11-28
**Version** : 1.0.0
**Status** : ✅ Production Ready
