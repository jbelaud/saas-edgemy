# 🎯 Edgemy - Plan LITE

## Vue d'ensemble

Le **Plan LITE** est une nouvelle formule d'abonnement coach à **15€/mois** (ou **149€/an**) permettant aux coachs de:
- Recevoir des réservations **sans paiement Stripe automatique**
- Utiliser leurs **propres moyens de paiement** (USDT, Wise, Revolut, etc.)
- Bénéficier d'un **salon Discord privé** automatique
- **Confirmer manuellement** les paiements reçus

---

## 📊 Comparatif PRO vs LITE

| Feature | PRO (39€/mois) | LITE (15€/mois) |
|---------|----------------|-----------------|
| **Paiement Stripe auto** | ✅ Oui | ❌ Non |
| **Paiement externe** | ❌ Non | ✅ Oui (USDT, Wise, etc.) |
| **Salon Discord privé** | ✅ Oui | ✅ Oui |
| **Sessions illimitées** | ✅ Oui | ✅ Oui |
| **Analytics avancées** | ✅ Oui | ❌ Non |
| **Support prioritaire** | ✅ Oui | ❌ Non |
| **Branding personnalisé** | ✅ Oui | ❌ Non |
| **Hébergement replays** | ✅ Oui | ❌ Non |
| **Facturation intégrée** | ✅ Oui | ❌ Non |

---

## 📁 Documentation

| Document | Description |
|----------|-------------|
| [**LITE_PLAN_QUICK_START.md**](./LITE_PLAN_QUICK_START.md) | ⚡ Démarrage rapide (5 min) |
| [**LITE_PLAN_DEPLOYMENT.md**](./LITE_PLAN_DEPLOYMENT.md) | 📦 Guide complet de déploiement |
| [**LITE_PLAN_FILES_SUMMARY.md**](./LITE_PLAN_FILES_SUMMARY.md) | 📂 Liste de tous les fichiers |

---

## 🚀 Installation rapide

### 1. Migration base de données

```bash
npx prisma migrate dev --name add_plan_lite_support
npx tsx prisma/seed-plans.ts
```

### 2. Activer le feature flag

```bash
# Dans .env
ENABLE_LITE_PLAN="true"
```

### 3. Démarrer l'application

```bash
pnpm dev
```

### 4. Créer un coach LITE de test

```sql
UPDATE coach SET "planKey" = 'LITE' WHERE userId = 'USER_ID';
```

---

## 🔑 Fichiers clés

### Backend (API)

```
src/app/api/
├── reservations/create/               ⭐ API centralisée (PRO/LITE)
├── reservations/[id]/confirm-external-payment/  ⭐ Confirmation paiement LITE
├── coach/reservations/                ⭐ Liste réservations coach
├── coach/payment-preferences/         ⭐ Config moyens paiement
└── coach/change-plan/                 ⭐ Changement PRO ↔ LITE
```

### Frontend (Pages & Components)

```
src/
├── app/[locale]/(app)/
│   └── reservation-lite/[id]/         ⭐ Page confirmation LITE
└── components/coach/
    ├── dashboard/PendingExternalPayments.tsx  ⭐ Paiements en attente
    └── settings/PaymentPreferencesForm.tsx    ⭐ Config préférences
```

### Base de données

```
prisma/
├── schema.prisma                      ⭐ Table Plan + modifications Coach
├── seed-plans.ts                      ⭐ Seed PRO + LITE
└── migrations/add_plan_lite_support.sql  ⭐ Migration SQL
```

---

## 🎯 Flux utilisateur

### Flux PRO (existant - inchangé)

```
Joueur réserve
  → API /reservations/create
  → Coach PRO détecté
  → Création réservation + Retour session Stripe
  → Redirection Stripe Checkout
  → Paiement
  → Webhook Stripe
  → Confirmation + Discord créé
```

### Flux LITE (nouveau)

```
Joueur réserve
  → API /reservations/create
  → Coach LITE détecté
  → Création réservation + Discord créé immédiatement
  → Statut: EXTERNAL_PENDING
  → Redirect /reservation-lite/[id]
  → Page de confirmation + Infos paiement
  → Joueur paie directement au coach
  → Coach confirme paiement manuel
  → Statut: EXTERNAL_PAID
```

---

## 🔧 Configuration

### Variables d'environnement requises

```bash
# Feature flag
ENABLE_LITE_PLAN="true"

# Stripe - Prix LITE (à créer dans Stripe Dashboard)
STRIPE_COACH_LITE_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_COACH_LITE_YEARLY_PRICE_ID="price_xxxxx"
```

---

## ✅ Tests

### Scénario 1: Flux PRO (non-régression)

- [x] Réservation coach PRO → Stripe
- [x] Paiement → Confirmation
- [x] Discord créé

### Scénario 2: Flux LITE (nouveau)

- [ ] Config préférences paiement coach
- [ ] Réservation coach LITE → Page confirmation
- [ ] Discord créé automatiquement
- [ ] Coach voit paiement en attente
- [ ] Coach confirme paiement
- [ ] Statut passe à EXTERNAL_PAID

### Scénario 3: Changement de plan

- [ ] PRO → LITE : Attente fin période
- [ ] LITE → PRO : Upgrade immédiat + prorata
- [ ] Avec réservations futures : Impossible

---

## 🐛 Debugging

### Logs à surveiller

```bash
# Réservation LITE
🎯 [LITE] Création réservation sans Stripe pour coach xxx
✅ [LITE] Réservation créée: res_xxx

# Réservation PRO
💳 [PRO] Création réservation avec Stripe pour coach yyy

# Confirmation paiement externe
✅ [LITE] Paiement externe confirmé pour réservation res_xxx
```

### Vérifier la DB

```sql
-- Vérifier les plans
SELECT * FROM "Plan";

-- Vérifier les coachs par plan
SELECT "planKey", COUNT(*) FROM "coach" GROUP BY "planKey";

-- Vérifier les réservations LITE
SELECT * FROM "reservation" WHERE "paymentStatus" IN ('EXTERNAL_PENDING', 'EXTERNAL_PAID');
```

---

## 📚 Ressources

- **Quick Start**: [LITE_PLAN_QUICK_START.md](./LITE_PLAN_QUICK_START.md)
- **Déploiement**: [LITE_PLAN_DEPLOYMENT.md](./LITE_PLAN_DEPLOYMENT.md)
- **Fichiers**: [LITE_PLAN_FILES_SUMMARY.md](./LITE_PLAN_FILES_SUMMARY.md)

---

## 🆘 Support

### Problèmes courants

| Problème | Solution |
|----------|----------|
| "Plan not found" | Exécuter `npx tsx prisma/seed-plans.ts` |
| Feature flag non activé | Vérifier `.env` : `ENABLE_LITE_PLAN="true"` |
| Discord non créé | Fonction placeholder - à implémenter |

### Contact

- **Email**: tech@edgemy.fr
- **Docs**: Voir fichiers `LITE_PLAN_*.md`

---

## 📈 Statut du projet

| Composant | Statut |
|-----------|--------|
| Migration Prisma | ✅ Prêt |
| Seed plans | ✅ Prêt |
| API Backend | ✅ Prêt |
| Pages Frontend | ✅ Prêt |
| Composants React | ✅ Prêt |
| Discord (placeholder) | ⚠️ À compléter |
| Documentation | ✅ Complète |
| Tests E2E | ⏳ À faire |

---

## 🚀 Prochaines étapes

1. **Tester en local** (Quick Start - 5 min)
2. **Compléter Discord** (`createDiscordThreadForLite`)
3. **Tests E2E** (PRO + LITE)
4. **Déploiement staging** (Guide déploiement)
5. **Phase pilote** (1 coach → 10 coachs)
6. **Activation publique** (Feature flag ON)

---

**Version**: 1.0.0
**Date**: 2025-01-17
**Auteur**: Claude Code (AI Assistant)
**Prêt pour**: Tests locaux + Déploiement staging

---

## 💡 Notes importantes

### ⚠️ Ce qui est FAIT

- ✅ Architecture complète PRO + LITE
- ✅ API centralisée avec routing automatique
- ✅ Page de confirmation LITE
- ✅ Dashboard coach (paiements en attente)
- ✅ Config préférences paiement
- ✅ API changement de plan (règles métier)
- ✅ Feature flag pour déploiement progressif
- ✅ Documentation exhaustive

### ⏳ Ce qui reste à faire

- ⚠️ **Discord**: Compléter `createDiscordThreadForLite()` (actuellement placeholder)
- 📝 **Intégration UI**: Ajouter `<PendingExternalPayments />` et `<PaymentPreferencesForm />` dans les pages existantes
- 🧪 **Tests E2E**: Créer tests automatisés (Playwright/Cypress)
- 🚀 **Déploiement**: Suivre le guide de déploiement

### ✨ Points forts de l'implémentation

- **Zero-downtime**: Flux PRO totalement inchangé
- **Feature flag**: Déploiement progressif sécurisé
- **Extensible**: Architecture prête pour futurs plans (VIP, BUSINESS, etc.)
- **Type-safe**: Tout est typé avec TypeScript
- **Documenté**: 4 fichiers de documentation complets
- **Rollback facile**: En cas de problème, désactiver le flag suffit

---

🎉 **Le code est prêt ! Vous pouvez maintenant tester en local.**
