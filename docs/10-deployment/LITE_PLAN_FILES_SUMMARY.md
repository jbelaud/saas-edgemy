# 📁 Résumé des fichiers - Plan LITE

Ce document liste tous les fichiers créés ou modifiés pour l'implémentation du plan LITE.

---

## 🆕 Fichiers créés

### 1. Base de données et seed

| Fichier | Description |
|---------|-------------|
| `prisma/seed-plans.ts` | Script de seed pour initialiser les plans PRO et LITE en base |

### 2. API Backend

| Fichier | Description |
|---------|-------------|
| `src/app/api/reservations/create/route.ts` | **API centralisée** pour créer réservations (routing PRO/LITE) |
| `src/app/api/reservations/[id]/confirm-external-payment/route.ts` | API pour confirmer paiement externe (coach LITE) |
| `src/app/api/coach/reservations/route.ts` | API pour récupérer réservations coach (avec filtres) |
| `src/app/api/coach/payment-preferences/route.ts` | API GET/POST pour gérer préférences paiement coach LITE |
| `src/app/api/coach/change-plan/route.ts` | API pour changer de plan (PRO ↔ LITE) avec règles métier |

### 3. Services et utilitaires

| Fichier | Description |
|---------|-------------|
| `src/lib/discord/create-thread-lite.ts` | Fonction pour créer salon Discord pour réservations LITE |

### 4. Pages Next.js

| Fichier | Description |
|---------|-------------|
| `src/app/[locale]/(app)/reservation-lite/[id]/page.tsx` | Page de confirmation réservation LITE (après réservation) |

### 5. Composants React

| Fichier | Description |
|---------|-------------|
| `src/components/coach/dashboard/PendingExternalPayments.tsx` | Dashboard coach - Liste paiements externes en attente |
| `src/components/coach/settings/PaymentPreferencesForm.tsx` | Formulaire config préférences paiement (coach LITE) |

### 6. Documentation

| Fichier | Description |
|---------|-------------|
| `LITE_PLAN_DEPLOYMENT.md` | **Guide complet de déploiement** (migration, tests, rollback) |
| `LITE_PLAN_FILES_SUMMARY.md` | Ce fichier - Résumé de tous les fichiers modifiés |

---

## ✏️ Fichiers modifiés

### 1. Base de données

| Fichier | Modifications |
|---------|---------------|
| `prisma/schema.prisma` | • Ajout table `Plan` (PRO, LITE, extensible)<br>• Ajout `coach.planKey` (référence Plan)<br>• Ajout `coach.paymentPreferences` (moyens paiement LITE)<br>• Ajout enums `PaymentStatus`: `EXTERNAL_PENDING`, `EXTERNAL_PAID` |

### 2. Configuration

| Fichier | Modifications |
|---------|---------------|
| `.env.example` | • Ajout `ENABLE_LITE_PLAN` (feature flag)<br>• Ajout `STRIPE_COACH_LITE_MONTHLY_PRICE_ID`<br>• Ajout `STRIPE_COACH_LITE_YEARLY_PRICE_ID` |

### 3. Frontend

| Fichier | Modifications |
|---------|---------------|
| `src/components/coach/public/BookingModal.tsx` | • Modif appel API: `/api/reservations` → `/api/reservations/create`<br>• Ajout routing conditionnel PRO (Stripe) vs LITE (page confirmation)<br>• Gestion réponse `mode: "PRO"` ou `mode: "LITE"` |

---

## 📊 Architecture résumée

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUX RÉSERVATION                        │
└─────────────────────────────────────────────────────────────┘

JOUEUR réserve
      ↓
BookingModal.tsx
      ↓
POST /api/reservations/create
      ↓
      ├─── Coach PRO? ──→ Créer réservation + Return Stripe session
      │                   ↓
      │                   Front: redirectToCheckout() → Stripe
      │                   ↓
      │                   Webhook → Confirmation → Discord
      │
      └─── Coach LITE? ──→ Créer réservation + Créer Discord + Return reservationId
                          ↓
                          Front: router.push(/reservation-lite/[id])
                          ↓
                          Page confirmation LITE
                          ↓
                          Coach confirme paiement manuel
                          ↓
                          POST /api/reservations/[id]/confirm-external-payment
                          ↓
                          Status: EXTERNAL_PAID
```

---

## 🗂️ Organisation du code

### API Routes

```
src/app/api/
├── reservations/
│   ├── create/
│   │   └── route.ts              ⭐ API centralisée (PRO/LITE)
│   └── [id]/
│       └── confirm-external-payment/
│           └── route.ts           ⭐ Confirmation paiement LITE
│
└── coach/
    ├── reservations/
    │   └── route.ts               ⭐ Liste réservations coach
    ├── payment-preferences/
    │   └── route.ts               ⭐ Config paiement LITE
    └── change-plan/
        └── route.ts               ⭐ Changement plan PRO↔LITE
```

### Composants

```
src/components/coach/
├── dashboard/
│   └── PendingExternalPayments.tsx  ⭐ Paiements en attente (LITE)
└── settings/
    └── PaymentPreferencesForm.tsx   ⭐ Config moyens paiement (LITE)
```

### Pages

```
src/app/[locale]/(app)/
└── reservation-lite/
    └── [id]/
        └── page.tsx                  ⭐ Page confirmation LITE
```

---

## 🎯 Points d'intégration

### Dans le dashboard coach

Pour afficher les paiements en attente:

```tsx
import { PendingExternalPayments } from '@/components/coach/dashboard/PendingExternalPayments';

// Dans une page dashboard coach
<PendingExternalPayments />
```

### Dans les settings coach

Pour configurer les préférences de paiement:

```tsx
import { PaymentPreferencesForm } from '@/components/coach/settings/PaymentPreferencesForm';

// Dans /coach/settings/page.tsx
<PaymentPreferencesForm />
```

---

## 🔧 Configuration requise

### Variables d'environnement

```bash
# .env
ENABLE_LITE_PLAN="true"                           # Feature flag
STRIPE_COACH_LITE_MONTHLY_PRICE_ID="price_xxxxx"  # Prix LITE mensuel
STRIPE_COACH_LITE_YEARLY_PRICE_ID="price_xxxxx"   # Prix LITE annuel
```

### Migration Prisma

```bash
# Générer migration
npx prisma migrate dev --name add_plan_lite_support

# Appliquer en prod
npx prisma migrate deploy

# Seed plans
npx tsx prisma/seed-plans.ts
```

---

## ✅ Checklist d'intégration

### Backend

- [x] Migration Prisma créée et testée
- [x] Seed plans créé et testé
- [x] API `/api/reservations/create` implémentée
- [x] API confirmation paiement externe implémentée
- [x] API gestion préférences paiement implémentée
- [x] API changement de plan implémentée
- [x] Fonction Discord LITE (placeholder, à compléter)

### Frontend

- [x] Page `/reservation-lite/[id]` créée
- [x] BookingModal modifié pour router PRO/LITE
- [x] Composant PendingExternalPayments créé
- [x] Composant PaymentPreferencesForm créé
- [ ] Intégrer PendingExternalPayments dans dashboard coach
- [ ] Intégrer PaymentPreferencesForm dans settings coach

### Documentation

- [x] Guide de déploiement complet
- [x] Résumé des fichiers
- [x] Commentaires dans le code

### Tests

- [ ] Tests E2E flux PRO (non régression)
- [ ] Tests E2E flux LITE (nouveau)
- [ ] Tests changement de plan
- [ ] Tests confirmation paiement externe

---

## 🚀 Prochaines étapes

1. **Compléter la fonction Discord**
   - Implémenter `createDiscordThreadForLite()` avec API Discord
   - Actuellement placeholder

2. **Intégrer les composants dans les pages existantes**
   - Ajouter `<PendingExternalPayments />` dans dashboard coach
   - Ajouter `<PaymentPreferencesForm />` dans settings coach

3. **Tests complets**
   - Scénario PRO end-to-end
   - Scénario LITE end-to-end
   - Changements de plan

4. **Déploiement progressif**
   - Suivre `LITE_PLAN_DEPLOYMENT.md`
   - Phase pilote → Extension → Activation publique

---

## 📞 Support

Pour toute question sur l'implémentation:
- Consulter `LITE_PLAN_DEPLOYMENT.md` pour le déploiement
- Vérifier les commentaires dans le code
- Tester localement avec `ENABLE_LITE_PLAN=true`

---

**Dernière mise à jour**: 2025-01-17
**Version**: 1.0.0
**Statut**: ✅ Code complet, prêt pour tests et déploiement
