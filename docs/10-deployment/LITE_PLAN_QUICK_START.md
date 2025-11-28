# ⚡ Quick Start - Plan LITE

Guide de démarrage rapide pour tester le plan LITE en local.

---

## 🚀 Installation rapide (5 minutes)

### 1. Migration de la base de données

```bash
# Générer et appliquer la migration Prisma
npx prisma migrate dev --name add_plan_lite_support

# Seed des plans PRO et LITE
npx tsx prisma/seed-plans.ts
```

**Résultat attendu**:
```
✅ Plan PRO créé/mis à jour
   - Mensuel : 39€
   - Annuel  : 399€
   - Stripe  : Oui

✅ Plan LITE créé/mis à jour
   - Mensuel : 15€
   - Annuel  : 149€
   - Stripe  : Non
```

### 2. Activer le feature flag

Dans votre fichier `.env` :

```bash
# Activer le plan LITE en développement
ENABLE_LITE_PLAN="true"
```

### 3. Créer un coach LITE de test

#### Option A: Via Prisma Studio

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Dans l'interface:
# 1. Aller sur la table "coach"
# 2. Sélectionner un coach
# 3. Modifier le champ "planKey" → "LITE"
# 4. Sauvegarder
```

#### Option B: Via SQL

```sql
-- Passer un coach existant en LITE
UPDATE coach
SET "planKey" = 'LITE'
WHERE userId = 'USER_ID_ICI';
```

### 4. Démarrer l'application

```bash
# Installer les dépendances (si pas déjà fait)
pnpm install

# Démarrer en mode dev
pnpm dev
```

L'application sera disponible sur `http://localhost:3000`

---

## 🧪 Tester le flux complet

### Étape 1: Configurer les préférences de paiement du coach

1. Se connecter en tant que **coach LITE**
2. Aller sur `/coach/settings`
3. Section "Préférences de paiement - Plan Lite"
4. Ajouter des méthodes: `USDT (TRC20)`, `Wise`, `Revolut`
5. Cliquer sur "Sauvegarder les préférences"

### Étape 2: Réserver une session en tant que joueur

1. Se connecter en tant que **joueur**
2. Aller sur le profil public du coach LITE
3. Cliquer sur "Réserver" sur une annonce
4. Sélectionner un créneau horaire
5. Cliquer sur "Réserver"

**Attendu**:
- ❌ Pas de redirection Stripe
- ✅ Redirection vers `/reservation-lite/[id]`
- ✅ Page de confirmation avec:
  - Détails de la session
  - Statut "En attente de paiement"
  - Moyens de paiement préférés du coach
  - Lien Discord (si configuré)
  - Disclaimer légal

### Étape 3: Vérifier le dashboard coach

1. Se connecter en tant que **coach LITE**
2. Aller sur le dashboard coach
3. Ajouter le composant `<PendingExternalPayments />` (voir ci-dessous)
4. Voir la réservation en attente de paiement

### Étape 4: Confirmer le paiement

1. Dans le dashboard coach
2. Section "Paiements en attente - Plan Lite"
3. Cliquer sur "Confirmer le paiement"
4. Confirmer dans le popup

**Attendu**:
- ✅ Réservation passe en statut `EXTERNAL_PAID`
- ✅ Disparaît de la liste des paiements en attente

### Étape 5: Vérifier côté joueur

1. Retourner sur `/reservation-lite/[id]` en tant que joueur
2. Voir le message "Paiement confirmé"
3. Badge vert "Paiement confirmé"

---

## 🔧 Intégration des composants

### Dashboard Coach - Paiements en attente

Ajouter dans `src/app/[locale]/(app)/coach/dashboard/page.tsx` :

```tsx
import { PendingExternalPayments } from '@/components/coach/dashboard/PendingExternalPayments';

export default function CoachDashboardPage() {
  return (
    <div>
      {/* ... Autres sections du dashboard */}

      {/* Section Paiements LITE */}
      <PendingExternalPayments />
    </div>
  );
}
```

### Settings Coach - Préférences de paiement

Ajouter dans `src/app/[locale]/(app)/coach/settings/page.tsx` :

```tsx
import { PaymentPreferencesForm } from '@/components/coach/settings/PaymentPreferencesForm';

export default function CoachSettingsPage() {
  return (
    <div>
      {/* ... Autres sections des settings */}

      {/* Section Préférences paiement LITE */}
      <PaymentPreferencesForm />
    </div>
  );
}
```

---

## 🐛 Debugging

### Vérifier les logs

Ouvrir la console du serveur Next.js pour voir:

```
🎯 [LITE] Création réservation sans Stripe pour coach xxx
✅ [LITE] Réservation créée: res_xxx, Discord: https://...
💳 [PRO] Création réservation avec Stripe pour coach yyy
```

### Vérifier la base de données

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Vérifier:
# - Table "Plan" : 2 entrées (PRO + LITE)
# - Table "coach" : planKey = "LITE"
# - Table "reservation" : paymentStatus = "EXTERNAL_PENDING" ou "EXTERNAL_PAID"
```

### Tester l'API directement

#### Créer une réservation LITE

```bash
curl -X POST http://localhost:3000/api/reservations/create \
  -H "Content-Type: application/json" \
  -d '{
    "announcementId": "ANNONCE_ID",
    "coachId": "COACH_ID",
    "startDate": "2025-01-20T10:00:00Z",
    "endDate": "2025-01-20T11:00:00Z"
  }'
```

**Réponse attendue (coach LITE)**:
```json
{
  "mode": "LITE",
  "reservationId": "res_xxx",
  "discordUrl": "https://discord.com/...",
  "message": "Réservation créée. Le coach vous contactera pour le paiement."
}
```

#### Confirmer un paiement externe

```bash
curl -X POST http://localhost:3000/api/reservations/RES_ID/confirm-external-payment
```

---

## ✅ Checklist de test

### Flux PRO (non-régression)

- [ ] Réservation coach PRO → Redirection Stripe
- [ ] Paiement Stripe → Webhook → Confirmation
- [ ] Discord créé après paiement
- [ ] Aucun impact sur le flux existant

### Flux LITE (nouveau)

- [ ] Configuration préférences paiement coach
- [ ] Réservation coach LITE → Page `/reservation-lite/[id]`
- [ ] Page affiche toutes les infos correctement
- [ ] Dashboard coach affiche paiement en attente
- [ ] Confirmation paiement fonctionne
- [ ] Statut passe à EXTERNAL_PAID

### Changement de plan

- [ ] PRO annuel → LITE : Erreur "attendre fin période"
- [ ] PRO mensuel → LITE : Erreur "attendre fin période"
- [ ] LITE annuel → PRO : Upgrade immédiat avec prorata
- [ ] LITE mensuel → PRO : Upgrade immédiat avec prorata
- [ ] Avec réservations futures : Erreur "impossible"

---

## 🆘 Problèmes courants

### "Plan not found"

**Cause**: Les plans n'ont pas été seed.

**Solution**:
```bash
npx tsx prisma/seed-plans.ts
```

### "ENABLE_LITE_PLAN is not true"

**Cause**: Le feature flag n'est pas activé.

**Solution**: Vérifier `.env`
```bash
ENABLE_LITE_PLAN="true"
```

### "Coach not found"

**Cause**: Le coach n'existe pas ou n'est pas passé en LITE.

**Solution**:
```sql
UPDATE coach SET "planKey" = 'LITE' WHERE userId = 'USER_ID';
```

### Discord ne se crée pas

**Cause**: La fonction `createDiscordThreadForLite()` est un placeholder.

**Solution**: Implémenter la logique Discord ou vérifier les logs pour voir le placeholder.

---

## 📝 Notes importantes

### Discord (TODO)

La fonction `createDiscordThreadForLite()` dans `src/lib/discord/create-thread-lite.ts` est actuellement un **placeholder**.

Pour l'implémenter complètement, vous pouvez:
1. Réutiliser la logique de `/api/discord/create-channel`
2. Adapter pour le flux LITE
3. Poster le message avec instructions de paiement

### Stripe (Coach Subscription)

Les prix Stripe pour l'abonnement coach LITE doivent être créés dans le Stripe Dashboard:
- **15€/mois** : Créer product → price → copier ID dans `STRIPE_COACH_LITE_MONTHLY_PRICE_ID`
- **149€/an** : Créer product → price → copier ID dans `STRIPE_COACH_LITE_YEARLY_PRICE_ID`

### Paiements joueurs

Avec le plan LITE:
- ❌ **Pas de Stripe** pour les paiements des joueurs
- ✅ Paiements **externes** (USDT, Wise, Revolut, etc.)
- ✅ Coach confirme **manuellement** la réception

---

## 🚀 Prochaines étapes après validation locale

1. **Compléter Discord**: Implémenter `createDiscordThreadForLite()`
2. **Tests E2E**: Créer des tests automatisés (Playwright/Cypress)
3. **Déploiement staging**: Suivre `LITE_PLAN_DEPLOYMENT.md`
4. **Phase pilote**: 1 coach → 10 coachs → Activation publique

---

## 📚 Documentation complète

- **Déploiement**: Voir `LITE_PLAN_DEPLOYMENT.md`
- **Fichiers modifiés**: Voir `LITE_PLAN_FILES_SUMMARY.md`
- **Support**: tech@edgemy.fr

---

**Temps estimé de test complet**: 15-20 minutes

**Dernière mise à jour**: 2025-01-17
