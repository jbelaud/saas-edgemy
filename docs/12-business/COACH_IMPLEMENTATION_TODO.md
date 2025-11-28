# 🎯 Interface Coach - TODO & Configuration

## ✅ Phase 1 : Base de données (TERMINÉ)
- [x] Schéma Prisma complet
  - [x] Modèle `coach` avec tous les champs
  - [x] Modèle `CoachDraft` pour sauvegarde brouillon
  - [x] Modèle `Announcement` pour les annonces
  - [x] Modèle `Availability` pour les disponibilités
  - [x] Modèle `Reservation` pour les réservations
  - [x] Enums `CoachStatus` et `ReservationStatus`
- [x] Client Prisma généré

## ⏳ Phase 2 : APIs Backend (EN COURS)
- [ ] `/api/coach/onboard` - Créer/mettre à jour profil coach
- [ ] `/api/coach/draft` - Sauvegarder brouillon onboarding
- [ ] `/api/coach/[slug]` - Récupérer profil public
- [ ] `/api/coach/dashboard` - Récupérer stats dashboard
- [ ] `/api/coach/announcement` - CRUD annonces
- [ ] `/api/upload` - Upload média (MOCK pour MVP)
- [ ] `/api/webhooks/stripe` - Webhooks Stripe

## 🔧 Phase 3 : Onboarding Multi-step
- [ ] Page `/coach/onboarding`
- [ ] Étape 1 : Informations personnelles
- [ ] Étape 2 : Liens sociaux
- [ ] Étape 3 : Upload médias
- [ ] Étape 4 : Stripe Connect
- [ ] Étape 5 : Abonnement
- [ ] Progress bar
- [ ] Sauvegarde automatique brouillon
- [ ] Validation formulaires (Zod)

## 📊 Phase 4 : Dashboard Coach
- [ ] Page `/coach/dashboard`
- [ ] Protection route (middleware)
- [ ] Vue d'ensemble (stats, graphiques)
- [ ] Onglet Profil public
- [ ] Onglet Annonces (CRUD)
- [ ] Onglet Calendrier (react-big-calendar)
- [ ] Onglet Réservations
- [ ] Onglet Paiements
- [ ] Onglet Notifications
- [ ] Gestion coach inactif (blocage + CTA)

## 🌐 Phase 5 : Page Publique Coach
- [ ] Page `/coach/[slug]`
- [ ] Affichage profil complet
- [ ] Calendrier lecture seule
- [ ] CTA "Réserver une session"
- [ ] Gestion coach inactif

## 💳 Phase 6 : Intégration Stripe
- [ ] Stripe Connect Standard
  - [ ] Account link creation
  - [ ] Redirect vers `/coach/dashboard?stripe=success`
  - [ ] Stockage `stripeAccountId`
- [ ] Stripe Billing (abonnement)
  - [ ] Checkout Session (29,90€/mois ou 299€/an)
  - [ ] Stockage `subscriptionId`
- [ ] Webhooks
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.deleted`
  - [ ] `account.updated`

## 🏠 Phase 7 : Bloc "Devenir Coach"
- [ ] Modifier `/src/app/[locale]/(app)/page.tsx`
- [ ] Section marketing
- [ ] Avantages coachs
- [ ] Témoignages
- [ ] FAQ
- [ ] CTA "Commencer maintenant"

## 🔍 Phase 8 : Liste Publique Coachs
- [ ] Page `/coachs` avec filtres
- [ ] Filtres : format, prix, langue, niveau
- [ ] Cards coachs actifs uniquement
- [ ] SEO optimisé

---

## 🔐 Configuration Requise (À FAIRE PLUS TARD)

### 1. Supabase Storage (Upload d'images)
```bash
# Variables d'environnement à ajouter
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Étapes :**
1. Créer un projet Supabase
2. Créer un bucket `coach-media` (public)
3. Configurer les policies :
   - Upload : authenticated users only
   - Read : public
4. Implémenter `/api/upload` avec Supabase SDK

### 2. Stripe Connect
```bash
# Variables d'environnement à ajouter
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
EDGEMY_COMMISSION_RATE=0.05
```

**Étapes :**
1. Activer Stripe Connect dans le dashboard
2. Configurer les webhooks :
   - URL : `https://app.edgemy.fr/api/webhooks/stripe`
   - Events : `checkout.session.completed`, `invoice.payment_failed`, etc.
3. Créer les produits d'abonnement :
   - Coach Premium Mensuel : 29,90€
   - Coach Premium Annuel : 299€

### 3. Stripe Billing
**Étapes :**
1. Créer les prix dans Stripe Dashboard
2. Noter les `priceId` pour mensuel et annuel
3. Les ajouter dans `.env` :
```bash
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
```

### 4. Migration Base de Données
⚠️ **IMPORTANT** : La base de données a un drift (différence entre schéma et migrations).

**Options :**
- **Option A (Recommandée)** : Reset complet (⚠️ perte de données)
  ```bash
  pnpm prisma migrate reset
  pnpm prisma migrate dev --name init_coach_interface
  ```
- **Option B** : Migration manuelle
  ```bash
  pnpm prisma db push
  ```

---

## 📦 Dépendances à installer

```bash
# Calendrier
pnpm add react-big-calendar date-fns

# Stripe
pnpm add stripe @stripe/stripe-js

# Upload (Supabase)
pnpm add @supabase/supabase-js

# Graphiques (optionnel)
pnpm add recharts
```

---

## 🎨 Design System

**Couleurs :**
- Bleu foncé : `#0B2545`
- Violet : `#6C5CE7`
- Blanc cassé : `#F7F6F3`

**Composants shadcn/ui à utiliser :**
- Card, Button, Input, Select
- Tabs, Progress, Badge
- Calendar, Dialog, Dropdown

---

## 📝 Notes

- **MVP** : On utilise react-big-calendar (gratuit)
- **Upload** : Endpoint mock pour l'instant, Supabase plus tard
- **Notifications** : Structure préparée, branchement plus tard
- **Commission** : Variable d'environnement `EDGEMY_COMMISSION_RATE`
- **Stripe Connect** : Standard account (le coach gère son dashboard)

---

## 🚀 Prochaines Étapes

1. ✅ Schéma Prisma
2. 🔄 APIs Backend
3. ⏳ Onboarding
4. ⏳ Dashboard
5. ⏳ Page publique
6. ⏳ Stripe
7. ⏳ Bloc marketing
8. ⏳ Liste coachs

**Dernière mise à jour :** 18 octobre 2025
