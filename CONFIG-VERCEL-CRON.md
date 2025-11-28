# 🔐 CONFIGURATION VERCEL - CRON_SECRET

## ✅ ÉTAPES COMPLÉTÉES EN LOCAL

- ✅ `CRON_SECRET` généré : `9dchjYm+uKl0GumNwrpOch63qy6BBN3l5q3JLwDu8Ko=`
- ✅ Ajouté à `.env`
- ✅ Ajouté à `.env.local`
- ✅ Testé localement : **Fonctionne parfaitement** ✅

---

## 🚀 PROCHAINE ÉTAPE : CONFIGURER SUR VERCEL

### 1. Aller sur Vercel Dashboard

1. Ouvrez votre navigateur
2. Allez sur https://vercel.com
3. Connectez-vous à votre compte
4. Sélectionnez votre projet **Edgemy**

### 2. Ajouter la variable d'environnement

1. Dans votre projet, cliquez sur **Settings** (onglet en haut)
2. Dans le menu de gauche, cliquez sur **Environment Variables**
3. Cliquez sur le bouton **Add New**
4. Remplissez le formulaire :

```
┌─────────────────────────────────────────────────────────┐
│ Key                                                     │
│ CRON_SECRET                                             │
│─────────────────────────────────────────────────────────│
│ Value                                                   │
│ 9dchjYm+uKl0GumNwrpOch63qy6BBN3l5q3JLwDu8Ko=           │
│─────────────────────────────────────────────────────────│
│ Environments                                            │
│ ✅ Production                                           │
│ ✅ Preview                                              │
│ ✅ Development                                          │
└─────────────────────────────────────────────────────────┘
```

5. Cliquez sur **Save**

### 3. Vérification

Une fois sauvegardé, vous devriez voir :

```
Environment Variables (XX)

CRON_SECRET
└─ Production, Preview, Development
   └─ 9dchj*** (Hidden)
```

---

## 📦 DÉPLOIEMENT

Maintenant que tout est configuré, vous pouvez déployer :

### Option 1 : Via Git (Recommandé)

```bash
# 1. Vérifier les fichiers modifiés
git status

# 2. Ajouter tous les fichiers
git add .

# 3. Créer un commit
git commit -m "feat: système de transfert automatique 100% opérationnel

- Cron job pour auto-complétion des sessions
- Transfert automatique aux coachs après session
- Sécurisation avec CRON_SECRET
- Tests et documentation complète
- CRON_SECRET configuré localement et sur Vercel"

# 4. Push vers production
git push origin main
```

Vercel détectera automatiquement le push et déploiera.

### Option 2 : Via Vercel CLI

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod
```

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

### 1. Vérifier que le cron est actif

1. **Vercel Dashboard** → Votre projet
2. **Settings** → **Cron Jobs**
3. Vérifiez que vous voyez :

```
Cron Jobs

/api/cron/cleanup-pending-reservations
└─ Schedule: */10 * * * *
   Status: ✅ Active

/api/cron/auto-complete-sessions
└─ Schedule: 0 * * * *
   Status: ✅ Active
```

### 2. Forcer une exécution manuelle (test)

```bash
# Remplacez par votre URL de production
curl -X GET https://app.edgemy.fr/api/cron/auto-complete-sessions \
  -H "Authorization: Bearer 9dchjYm+uKl0GumNwrpOch63qy6BBN3l5q3JLwDu8Ko="
```

**Résultat attendu** :
```json
{
  "success": true,
  "message": "Aucune session à compléter",
  "processed": 0
}
```

### 3. Vérifier les logs

1. **Vercel Dashboard** → Votre projet
2. **Deployments** → Cliquez sur le dernier deployment
3. **Functions** → Cherchez `/api/cron/auto-complete-sessions`
4. Cliquez sur une exécution
5. Vérifiez les logs :

```
🤖 [CRON] Début de l'auto-complétion des sessions...
✅ [CRON] Aucune session à compléter automatiquement
```

---

## 🧪 TEST EN PRODUCTION

Pour tester le flux complet en production :

### 1. Créer une réservation test

1. Allez sur votre site en production
2. Connectez-vous en tant que joueur
3. Réservez une session avec un coach
4. Payez avec carte test Stripe : `4242 4242 4242 4242`

### 2. Vérifier la capture du paiement

- ✅ Email de confirmation reçu
- ✅ Session visible dans le dashboard
- ✅ En BDD : `paymentStatus = PAID`, `transferStatus = PENDING`

### 3. Simuler la fin de session

**Option A : Attendre la vraie fin** (recommandé pour production)
- Créez une session courte (ex: dans 1h)
- Attendez la fin naturelle
- Le cron s'exécutera dans l'heure qui suit

**Option B : Forcer pour test rapide**

Connectez-vous à votre base de données et exécutez :

```sql
-- Trouver votre réservation test
SELECT id, "endDate", "transferStatus"
FROM "Reservation"
WHERE "paymentStatus" = 'PAID'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Modifier la date de fin pour qu'elle soit dans le passé
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 hour'
WHERE id = 'votre-reservation-id';
```

### 4. Attendre le cron

Le cron s'exécute **toutes les heures à heure pile** :
- Si vous faites le test à 14h30 → Prochain cron à 15h00
- Si vous faites le test à 15h55 → Prochain cron à 16h00

**Pour ne pas attendre**, forcez l'exécution avec curl (voir étape 2 ci-dessus).

### 5. Vérifier le transfert automatique

**Dans la BDD** :
```sql
SELECT
  id,
  "transferStatus",
  "stripeTransferId",
  "transferredAt"
FROM "Reservation"
WHERE id = 'votre-reservation-test';
```

**Résultat attendu** :
```
transferStatus    | TRANSFERRED
stripeTransferId  | tr_xxxxxxxxxxxxx
transferredAt     | 2025-11-28 15:00:00
```

**Dans Stripe Dashboard** :
- Menu **Connect** → **Transfers**
- Nouveau transfert visible
- Montant = Prix coach
- Destination = Compte du coach

**Dans les logs Vercel** :
```
🔄 [CRON] Traitement réservation cmihvetbw0001uygsjz8rctu5
   Coach: Olivier Belaud
   ✅ Transfert réussi: tr_xxxxxxxxxxxxx
   💸 Montant transféré: 90.00€
```

---

## 🎉 SUCCÈS !

Si toutes les vérifications passent :

✅ CRON_SECRET configuré
✅ Cron job actif sur Vercel
✅ Endpoint accessible et sécurisé
✅ Transferts automatiques fonctionnels
✅ Logs visibles pour monitoring

**Votre système est 100% automatique et production-ready !** 🚀

---

## 🔧 DÉPANNAGE

### Problème : "Unauthorized (401)"

**Cause** : CRON_SECRET incorrect sur Vercel

**Solution** :
1. Vérifiez que la variable est bien ajoutée sur Vercel
2. Vérifiez qu'elle a exactement la même valeur
3. Redéployez après modification

### Problème : Cron ne s'exécute pas

**Causes possibles** :
1. Plan Vercel gratuit (crons limités)
2. `vercel.json` pas déployé
3. Build échoué

**Solution** :
1. Vérifiez votre plan Vercel (Hobby+ requis pour crons fiables)
2. Vérifiez que `vercel.json` est bien dans le repo
3. Vérifiez le dernier deployment (onglet Deployments)

### Problème : Logs vides

**Solution** :
Attendez quelques minutes après le déploiement, puis :
1. Forcez une exécution avec curl
2. Rafraîchissez la page des logs

---

## 📞 AIDE

**Documentation créée** :
- `FLUX-PAIEMENT-AUTOMATIQUE.md` - Explication technique
- `GUIDE-TRANSFERT-AUTOMATIQUE.md` - Guide utilisateur
- `DEPLOIEMENT-TRANSFERT-AUTO.md` - Checklist complète
- `RESUME-AUTOMATISATION-COMPLETE.md` - Vue d'ensemble
- `CONFIG-VERCEL-CRON.md` - Ce fichier

**Scripts disponibles** :
```bash
# Tester le cron localement
node test-auto-complete-cron.js

# Vérifier l'état des réservations
node debug-coach-stripe.js
```

---

**CRON_SECRET** : `9dchjYm+uKl0GumNwrpOch63qy6BBN3l5q3JLwDu8Ko=`

⚠️ **IMPORTANT** : Gardez cette valeur secrète ! Ne la partagez jamais publiquement.

---

**Prêt pour le déploiement** : ✅
**Date** : 2025-11-28
**Version** : 1.0.0
