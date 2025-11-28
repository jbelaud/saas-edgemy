# 🚀 DÉPLOIEMENT DU SYSTÈME DE TRANSFERT AUTOMATIQUE

## ✅ CHECKLIST DE DÉPLOIEMENT

### 1️⃣ Configuration Locale (Développement)

- [x] Endpoint cron créé (`src/app/api/cron/auto-complete-sessions/route.ts`)
- [x] `vercel.json` mis à jour avec le nouveau cron
- [x] `.env.example` mis à jour avec `CRON_SECRET`
- [ ] Générer un `CRON_SECRET` pour votre environnement

**Action requise** :

```bash
# Générer un secret
openssl rand -base64 32

# Ou sous Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Ajoutez à `.env` et `.env.local` :
```bash
CRON_SECRET="votre-secret-généré"
```

### 2️⃣ Test Local

- [x] Serveur Next.js démarré (`npm run dev`)
- [x] Test cron exécuté (`node test-auto-complete-cron.js`)
- [x] Résultat : ✅ Endpoint fonctionnel

**Test effectué** :
```
📊 Réponse HTTP: 200 OK
📋 Message: Aucune session à compléter
```

### 3️⃣ Configuration Vercel (Production)

**Avant de déployer** :

1. **Ajouter CRON_SECRET sur Vercel** :
   - Allez sur https://vercel.com
   - Sélectionnez votre projet
   - **Settings** → **Environment Variables**
   - Cliquez **Add New**
   - Key: `CRON_SECRET`
   - Value: `le-secret-généré-précédemment`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Sauvegardez

2. **Vérifier les autres variables d'environnement** :
   - ✅ `STRIPE_CONNECT_ENABLED="true"`
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `DATABASE_URL`
   - ✅ `BREVO_API_KEY`

### 4️⃣ Déploiement

**Option A : Via Git (Recommandé)**

```bash
# 1. Commit les changements
git add .
git commit -m "feat: ajout du système de transfert automatique

- Cron job pour auto-complétion des sessions
- Transfert automatique aux coachs après session
- Sécurisation avec CRON_SECRET
- Tests et documentation complète"

# 2. Push sur la branche principale
git push origin main
```

Vercel détectera automatiquement le push et déploiera.

**Option B : Via Vercel CLI**

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Déployer
vercel --prod
```

### 5️⃣ Vérification Post-Déploiement

**Vérifier que le cron est actif** :

1. Allez dans **Vercel Dashboard** → Votre projet
2. **Settings** → **Cron Jobs**
3. Vérifiez que vous voyez :
   ```
   /api/cron/auto-complete-sessions
   Schedule: 0 * * * *
   Status: Active
   ```

**Forcer une exécution manuelle (test)** :

```bash
curl -X GET https://votre-app.vercel.app/api/cron/auto-complete-sessions \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Vérifier les logs** :

1. **Vercel Dashboard** → Votre projet
2. **Functions** → Cherchez `/api/cron/auto-complete-sessions`
3. Cliquez sur une exécution récente
4. Vérifiez les logs :
   ```
   🤖 [CRON] Début de l'auto-complétion des sessions...
   ✅ [CRON] Aucune session à compléter automatiquement
   ```

---

## 🧪 TEST EN PRODUCTION

### Scénario de test complet

**Objectif** : Vérifier que le flux automatique fonctionne end-to-end en production.

**Étapes** :

1. **Créer une réservation test**
   - Se connecter en tant que joueur
   - Réserver une session avec un coach
   - Payer avec carte test Stripe : `4242 4242 4242 4242`

2. **Vérifier la capture du paiement**
   - ✅ Status réservation : `CONFIRMED`
   - ✅ Payment status : `PAID`
   - ✅ Transfer status : `PENDING` ⏳
   - ✅ Email reçu (joueur et coach)

3. **Modifier la date de fin (SIMULATION)**

   **IMPORTANT** : Pour tester sans attendre la vraie fin de session

   ```sql
   -- Connectez-vous à votre BDD de production
   -- Trouvez l'ID de la réservation test
   UPDATE "Reservation"
   SET "endDate" = NOW() - INTERVAL '1 hour'
   WHERE id = 'id-de-votre-reservation-test';
   ```

4. **Attendre la prochaine exécution du cron**
   - Cron s'exécute toutes les heures (00:00, 01:00, etc.)
   - Ou forcez l'exécution avec curl (voir ci-dessus)

5. **Vérifier le transfert automatique**

   **Dans la BDD** :
   ```sql
   SELECT id, "transferStatus", "stripeTransferId", "transferredAt"
   FROM "Reservation"
   WHERE id = 'id-de-votre-reservation-test';
   ```

   **Résultat attendu** :
   ```
   transferStatus: TRANSFERRED
   stripeTransferId: tr_xxxxxxxxxxxxx
   transferredAt: 2025-11-28T15:00:00.000Z
   ```

   **Dans Stripe Dashboard** :
   - Allez sur https://dashboard.stripe.com
   - Menu **Connect** → **Transfers**
   - Vérifiez le nouveau transfert visible
   - Montant = Prix coach (ex: 90€)
   - Destination = Compte Stripe du coach

   **Dans Coach Stripe Express Dashboard** :
   - Le coach peut voir son paiement dans son dashboard
   - Balance mise à jour

6. **Vérifier les logs Vercel**
   - **Functions** → `/api/cron/auto-complete-sessions`
   - Cherchez l'exécution qui a traité votre session
   - Vérifiez les logs :
     ```
     🔄 [CRON] Traitement réservation cmihvetbw0001uygsjz8rctu5
        Coach: Olivier Belaud
        Joueur: Test Player
        💰 Transfert session unique
        ✅ Transfert réussi: tr_xxxxxxxxxxxxx
        💸 Montant transféré: 90.00€
     ```

---

## 📊 MONITORING EN PRODUCTION

### Logs à surveiller

**Succès** :
```
✅ [CRON] Auto-complétion terminée
   Succès: 5/5
   Échecs: 0/5
```

**Échecs** :
```
❌ [CRON] Auto-complétion terminée
   Succès: 3/5
   Échecs: 2/5

   SESSIONS EN ÉCHEC:
   1. cmihvetbw0001uygsjz8rctu5
      Erreur: Coach sans compte Stripe Connect valide
```

### Alertes à configurer (optionnel)

**Vercel Notifications** :
1. **Settings** → **Notifications**
2. Activer **Function Errors**
3. Recevoir un email si le cron échoue

**Sentry / Datadog** :
Intégrer un service de monitoring pour tracker :
- Taux de succès des transferts
- Montants transférés par jour
- Erreurs Stripe

---

## 🔄 ROLLBACK (en cas de problème)

Si vous devez désactiver temporairement le cron :

### Option 1 : Via Vercel Dashboard

1. **Settings** → **Cron Jobs**
2. Désactivez `/api/cron/auto-complete-sessions`

### Option 2 : Via Code

```json
// vercel.json - Commentez le cron
{
  "crons": [
    {
      "path": "/api/cron/cleanup-pending-reservations",
      "schedule": "*/10 * * * *"
    }
    // {
    //   "path": "/api/cron/auto-complete-sessions",
    //   "schedule": "0 * * * *"
    // }
  ]
}
```

Puis redéployez.

### Option 3 : Garder en mode manuel

Le cron peut rester actif, mais vous pouvez continuer à utiliser l'endpoint manuel :

```bash
# Transférer manuellement une session spécifique
curl -X POST https://votre-app.vercel.app/api/reservations/[id]/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

---

## 💡 OPTIMISATIONS FUTURES

### 1. Notifications de transfert

Envoyer un email au coach quand son paiement est transféré :

```typescript
// Dans le cron, après transfert réussi
await sendEmail({
  to: [{ email: coach.email, name: coach.firstName }],
  subject: 'Paiement reçu !',
  htmlContent: `
    <p>Bonjour ${coach.firstName},</p>
    <p>Votre paiement de ${amount}€ pour la session "${sessionTitle}" a été transféré vers votre compte Stripe.</p>
    <p>Les fonds seront disponibles selon votre calendrier de payout Stripe.</p>
  `,
});
```

### 2. Dashboard admin pour le monitoring

Créer une page admin qui affiche :
- Nombre de sessions auto-complétées aujourd'hui
- Montant total transféré
- Sessions en attente de transfert
- Historique des erreurs

### 3. Système de confirmation de session

Avant de transférer automatiquement :
- Demander au coach ET au joueur de confirmer la session
- Si pas de confirmation après 48h → transfert automatique
- Si litige → bloquer et notifier admin

### 4. Gestion des remboursements automatiques

Si annulation après paiement :
- >24h avant : remboursement total automatique
- <24h avant : split 50/50 automatique

---

## 📋 RÉSUMÉ FINAL

### ✅ Ce qui a été fait

| Item | Status | Fichier |
|------|--------|---------|
| Endpoint cron | ✅ | `src/app/api/cron/auto-complete-sessions/route.ts` |
| Configuration Vercel | ✅ | `vercel.json` |
| Variable d'environnement | ✅ | `.env.example` |
| Script de test | ✅ | `test-auto-complete-cron.js` |
| Documentation complète | ✅ | `GUIDE-TRANSFERT-AUTOMATIQUE.md` |
| Test local | ✅ | Exécuté avec succès |

### ⏳ Actions requises avant déploiement

1. [ ] Générer `CRON_SECRET`
2. [ ] Ajouter `CRON_SECRET` à `.env` et `.env.local`
3. [ ] Ajouter `CRON_SECRET` sur Vercel (Environment Variables)
4. [ ] Commit + Push vers production
5. [ ] Vérifier le cron actif sur Vercel
6. [ ] Tester avec une session réelle

### 🎯 Résultat attendu

Après déploiement, **100% du flux est automatique** :

```
Joueur réserve + paie
    ↓
Webhook capture paiement
    ↓
Emails envoyés
    ↓
Discord créé
    ↓
Session réalisée
    ↓
Cron détecte fin de session
    ↓
Transfert automatique au coach
    ↓
Coach voit l'argent dans son compte
```

**ZÉRO INTERVENTION MANUELLE** ! 🚀

---

**Date** : 2025-11-28
**Version** : 1.0.0
**Status** : ✅ Prêt pour déploiement
