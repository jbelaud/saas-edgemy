# 🚀 Guide de déploiement - Plan LITE

Ce document décrit les étapes pour déployer le nouveau plan LITE sur Edgemy.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Migration de la base de données](#migration-de-la-base-de-données)
4. [Configuration Stripe](#configuration-stripe)
5. [Variables d'environnement](#variables-denvironnement)
6. [Tests end-to-end](#tests-end-to-end)
7. [Déploiement progressif](#déploiement-progressif)
8. [Rollback](#rollback)

---

## 🎯 Vue d'ensemble

### Nouveautés

Le plan LITE permet aux coachs de:
- **15€/mois** ou **149€/an** (vs PRO: 39€/mois ou 399€/an)
- Réserver des sessions **sans paiement Stripe automatique**
- Utiliser des **paiements externes** (USDT, Wise, Revolut, etc.)
- **Salon Discord privé** créé automatiquement
- Le coach **confirme manuellement** les paiements reçus

### Architecture

- **Table `Plan`** : PRO + LITE (extensible pour futurs plans)
- **Enum `PaymentStatus`** : Ajout `EXTERNAL_PENDING` + `EXTERNAL_PAID`
- **Coach.planKey** : Référence au plan actif
- **Coach.paymentPreferences** : Moyens de paiement préférés du coach
- **API centralisée** : `/api/reservations/create` route selon le plan

---

## 🔧 Prérequis

### Outils nécessaires

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Accès Stripe Dashboard (mode test + production)
- Accès serveur Discord (bot + guild)

### Vérifications

```bash
# Vérifier Node.js
node --version

# Vérifier pnpm
pnpm --version

# Vérifier connexion DB
npx prisma db pull
```

---

## 🗄️ Migration de la base de données

### 1. Créer la migration Prisma

Les modifications Prisma ont déjà été appliquées au fichier `schema.prisma`:
- Ajout table `Plan`
- Ajout `Coach.planKey` et `Coach.paymentPreferences`
- Ajout statuts `EXTERNAL_PENDING` et `EXTERNAL_PAID`

```bash
# Générer la migration
npx prisma migrate dev --name add_plan_lite_support

# Appliquer sur la DB de développement
npx prisma migrate deploy
```

### 2. Seed des plans (PRO + LITE)

```bash
# Exécuter le seed des plans
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

### 3. Migrer les coachs existants

Par défaut, tous les coachs existants sont sur le plan **PRO**.

Si nécessaire, migrer manuellement un coach:

```sql
-- Passer un coach en LITE
UPDATE coach
SET "planKey" = 'LITE'
WHERE id = 'coach_id_here';
```

---

## 💳 Configuration Stripe

### 1. Créer les produits LITE dans Stripe Dashboard

#### Mode Test

1. Aller sur [Stripe Dashboard Test](https://dashboard.stripe.com/test/products)
2. Créer un nouveau produit:
   - **Nom**: `Edgemy Coach - Plan Lite (Mensuel)`
   - **Prix**: `15.00 EUR` (récurrent, mensuel)
   - **Copier le Price ID**: `price_xxxxxxxxxxxxx`

3. Créer un second produit:
   - **Nom**: `Edgemy Coach - Plan Lite (Annuel)`
   - **Prix**: `149.00 EUR` (récurrent, annuel)
   - **Copier le Price ID**: `price_xxxxxxxxxxxxx`

#### Mode Production

Répéter les mêmes étapes sur [Stripe Dashboard Production](https://dashboard.stripe.com/products)

### 2. Mettre à jour les variables d'environnement

Voir section suivante.

---

## 🔐 Variables d'environnement

### Fichier `.env` (développement)

```bash
# Feature Flag - Plan LITE
ENABLE_LITE_PLAN="true"  # Activer en dev pour tester

# Stripe - Plan LITE Price IDs (mode test)
STRIPE_COACH_LITE_MONTHLY_PRICE_ID="price_test_xxxxx"   # 15€/mois
STRIPE_COACH_LITE_YEARLY_PRICE_ID="price_test_xxxxx"    # 149€/an
```

### Vercel (production)

Ajouter ces variables dans **Vercel Dashboard > Settings > Environment Variables**:

```
ENABLE_LITE_PLAN = false  # Désactivé par défaut
STRIPE_COACH_LITE_MONTHLY_PRICE_ID = price_live_xxxxx
STRIPE_COACH_LITE_YEARLY_PRICE_ID = price_live_xxxxx
```

---

## 🧪 Tests end-to-end

### Scénario 1: Réservation PRO (flux existant - doit fonctionner)

1. Créer un coach PRO de test
2. Publier une annonce
3. Se connecter en tant que joueur
4. Réserver une session
5. **Vérifier**: Redirection vers Stripe Checkout
6. **Vérifier**: Paiement → webhook → réservation confirmée
7. **Vérifier**: Discord créé après paiement

### Scénario 2: Réservation LITE (nouveau flux)

#### Préparation

```bash
# 1. Créer un coach LITE de test via Prisma Studio ou SQL
UPDATE coach SET "planKey" = 'LITE' WHERE userId = 'user_test_id';

# 2. Activer le feature flag
# Dans .env
ENABLE_LITE_PLAN="true"
```

#### Test du flux complet

1. **Coach configure ses préférences de paiement**
   - Aller sur `/coach/settings`
   - Ajouter `USDT (TRC20)`, `Wise`, etc.
   - Sauvegarder

2. **Joueur réserve une session**
   - Se connecter en tant que joueur
   - Aller sur le profil du coach LITE
   - Réserver une session
   - **Vérifier**: Pas de redirect Stripe
   - **Vérifier**: Redirect vers `/reservation-lite/[id]`

3. **Vérifier la page de confirmation**
   - **Affiche**: Détails session
   - **Affiche**: Statut "En attente de paiement"
   - **Affiche**: Moyens de paiement préférés du coach
   - **Affiche**: Lien Discord
   - **Affiche**: Disclaimer légal Edgemy

4. **Vérifier Discord**
   - Ouvrir Discord
   - Vérifier que le salon privé existe
   - Vérifier le message automatique avec infos paiement

5. **Coach confirme le paiement**
   - Se connecter en tant que coach LITE
   - Aller sur dashboard coach
   - Voir la section "Paiements en attente"
   - Cliquer sur "Confirmer le paiement"
   - **Vérifier**: Réservation passe en `EXTERNAL_PAID`
   - **Vérifier**: Joueur voit "Paiement confirmé" sur sa page

### Scénario 3: Changement de plan

#### Test PRO → LITE (downgrade)

```bash
# Créer un coach PRO avec abonnement actif
# Tenter de passer en LITE

# API: POST /api/coach/change-plan
{
  "targetPlanKey": "LITE"
}

# Vérifier: Erreur "Attendre fin de période"
```

#### Test LITE → PRO (upgrade)

```bash
# Créer un coach LITE avec abonnement actif
# Passer en PRO

# API: POST /api/coach/change-plan
{
  "targetPlanKey": "PRO"
}

# Vérifier: Upgrade immédiat avec calcul prorata
```

#### Test avec réservations futures

```bash
# Créer une réservation future
# Tenter de changer de plan

# Vérifier: Erreur "Impossible avec réservations futures"
```

---

## 📦 Déploiement progressif

### Phase 1: Staging (Test complet)

```bash
# 1. Déployer sur staging
git checkout main
git pull origin main
vercel --prod --scope=staging

# 2. Appliquer migration DB
npx prisma migrate deploy

# 3. Seed plans
npx tsx prisma/seed-plans.ts

# 4. Activer feature flag sur Vercel (staging uniquement)
ENABLE_LITE_PLAN=true
```

**Tests à effectuer sur staging**:
- ✅ Réservation PRO (existant)
- ✅ Réservation LITE (nouveau)
- ✅ Confirmation paiement externe
- ✅ Changement de plan PRO ↔ LITE
- ✅ Discord créé correctement

### Phase 2: Production (Feature flag OFF)

```bash
# 1. Déployer en production avec flag désactivé
git push origin main
# Vercel auto-deploy

# 2. Appliquer migration DB production
npx prisma migrate deploy --preview-feature

# 3. Seed plans production
npx tsx prisma/seed-plans.ts

# 4. Vérifier que ENABLE_LITE_PLAN=false dans Vercel
```

**À ce stade**: Le code est déployé mais LITE est invisible pour les utilisateurs.

### Phase 3: Activation progressive

**Jour 1: Test avec 1 coach pilote**

```bash
# 1. Passer 1 coach en LITE manuellement en DB
UPDATE coach SET "planKey" = 'LITE' WHERE id = 'coach_pilote_id';

# 2. Monitorer pendant 24h
# - Logs Vercel
# - Erreurs Sentry
# - Retour du coach pilote
```

**Jour 2-7: Extension à 10 coachs**

```bash
# Passer 10 coachs en LITE
# Monitorer quotidiennement
```

**Jour 8+: Activation publique**

```bash
# Activer le feature flag pour tous
# Dans Vercel Dashboard
ENABLE_LITE_PLAN=true

# Redéployer pour appliquer
vercel --prod
```

---

## 🔄 Rollback

### En cas de problème critique

#### 1. Désactiver le feature flag

```bash
# Dans Vercel Dashboard
ENABLE_LITE_PLAN=false

# Redéployer
vercel --prod
```

**Effet**: Les coachs LITE existants ne peuvent plus recevoir de nouvelles réservations LITE.

#### 2. Migrer les coachs LITE vers PRO

```sql
-- Passer tous les coachs LITE en PRO
UPDATE coach
SET "planKey" = 'PRO'
WHERE "planKey" = 'LITE';
```

#### 3. Annuler la migration DB (si nécessaire)

```bash
# Revenir à la migration précédente
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 📊 Monitoring post-déploiement

### Métriques à surveiller

1. **Nombre de coachs par plan**
   ```sql
   SELECT "planKey", COUNT(*)
   FROM coach
   GROUP BY "planKey";
   ```

2. **Réservations LITE en attente de paiement**
   ```sql
   SELECT COUNT(*)
   FROM reservation
   WHERE "paymentStatus" = 'EXTERNAL_PENDING';
   ```

3. **Taux de confirmation des paiements externes**
   ```sql
   SELECT
     COUNT(CASE WHEN "paymentStatus" = 'EXTERNAL_PAID' THEN 1 END) * 100.0 /
     COUNT(*) as taux_confirmation
   FROM reservation
   WHERE "paymentStatus" IN ('EXTERNAL_PENDING', 'EXTERNAL_PAID');
   ```

### Logs à surveiller

- ✅ `[LITE] Création réservation sans Stripe`
- ✅ `[LITE] Paiement externe confirmé`
- ✅ `[Discord LITE] Créer salon`
- ❌ Erreurs Discord
- ❌ Erreurs API `/api/reservations/create`

---

## ✅ Checklist finale

### Avant déploiement

- [ ] Migration Prisma testée en local
- [ ] Seed plans exécuté en local
- [ ] Tests E2E réussis (PRO + LITE)
- [ ] Produits Stripe LITE créés (test + prod)
- [ ] Variables d'environnement configurées
- [ ] Code review terminé
- [ ] Documentation à jour

### Après déploiement

- [ ] Migration DB appliquée en production
- [ ] Seed plans exécuté en production
- [ ] Feature flag OFF vérifié
- [ ] Monitoring activé (Vercel + Sentry)
- [ ] Tests smoke PRO OK
- [ ] Plan de rollback prêt

### Phase pilote

- [ ] 1 coach pilote migré vers LITE
- [ ] Monitoring 24h OK
- [ ] Extension à 10 coachs
- [ ] Monitoring 7 jours OK
- [ ] Activation publique

---

## 🆘 Support

En cas de problème:

1. **Vérifier les logs Vercel**: https://vercel.com/edgemy/logs
2. **Vérifier Sentry**: https://sentry.io/edgemy
3. **Rollback immédiat** si critique (voir section Rollback)
4. **Contact**: tech@edgemy.fr

---

## 📚 Ressources

- [Documentation Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Stripe Products & Prices](https://stripe.com/docs/billing/prices-guide)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Discord Bot API](https://discord.com/developers/docs/intro)

---

**Dernière mise à jour**: 2025-01-17
**Version**: 1.0.0
**Auteur**: Claude Code (AI Assistant)
