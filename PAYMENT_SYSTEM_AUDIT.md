# 🔍 AUDIT COMPLET DU SYSTÈME DE PAIEMENT EDGEMY

**Date**: 29 Novembre 2025  
**Version**: MVP v1.0

---

## 📋 SOMMAIRE

1. [Diagnostic du Système Actuel](#1-diagnostic-du-système-actuel)
2. [Liste des Bugs Identifiés](#2-liste-des-bugs-identifiés)
3. [Architecture des 3 Systèmes de Paiement](#3-architecture-des-3-systèmes-de-paiement)
4. [Fichiers à Modifier](#4-fichiers-à-modifier)
5. [Plan d'Implémentation](#5-plan-dimplémentation)
6. [Diagrammes de Flux](#6-diagrammes-de-flux)
7. [Plan de Test](#7-plan-de-test)
8. [Checklist Finale](#8-checklist-finale)

---

## 1. DIAGNOSTIC DU SYSTÈME ACTUEL

### 1.1 État du Système de Paiement (Système B - Actuel)

**Flux actuel :**
```
Joueur paie → Argent gelé chez Edgemy → Session terminée → Transfer au coach
```

**Points positifs ✅ :**
- Commission Edgemy = 6.5% ✅ (configuré dans `pricing.ts`)
- Frais Stripe calculés sur le montant total ✅
- Webhook `checkout.session.completed` fonctionnel ✅
- Cron `auto-complete-sessions` opérationnel ✅
- Variables internes correctement calculées (`coachNetCents`, `edgemyFeeCents`, etc.)

**Points à corriger ❌ :**
- Packs : paiement fractionné par session (doit être intégral après 1ère session)
- Déduction des heures basée sur les sessions, pas sur les heures réelles
- Dashboard coach affiche sessions non payées

### 1.2 État des Dashboards

**Dashboard Coach :**
- ❌ Affiche sessions avec `paymentStatus: PENDING` (non payées)
- ❌ Badge "Non payé" visible pour le coach (pas pertinent)
- ✅ Revenus calculés correctement (sessions PAID uniquement)

**Dashboard Admin :**
- ⚠️ Pas de vue des sessions abandonnées/non payées
- ⚠️ Pas d'outil pour contacter les joueurs

**Dashboard Joueur :**
- ✅ Affiche correctement les sessions
- ⚠️ Heures restantes dans packs à vérifier

### 1.3 État des Flux Critiques

| Flux | État | Notes |
|------|------|-------|
| Onboarding Coach | ✅ | Création compte → Abonnement → Stripe Connect → Discord |
| Réservation Session | ✅ | Sélection créneau → Paiement → Confirmation |
| Réservation Pack | ⚠️ | Paiement OK, mais déduction par session au lieu d'heures |
| Transfer Coach | ✅ | Après session via cron ou manuel |
| Annulation | ✅ | Règles 24h implémentées |

---

## 2. LISTE DES BUGS IDENTIFIÉS

### 🔴 Critiques

| # | Bug | Fichier | Impact |
|---|-----|---------|--------|
| B1 | Sessions non payées visibles dans dashboard coach | `sessions/page.tsx` | UX coach |
| B2 | Packs : paiement fractionné au lieu d'intégral après 1ère session | `transfer.ts` | Comptabilité |
| B3 | Déduction heures packs basée sur sessions, pas heures réelles | `transfer.ts` | Logique métier |

### 🟡 Moyens

| # | Bug | Fichier | Impact |
|---|-----|---------|--------|
| B4 | Admin n'a pas de vue sessions abandonnées | `admin/revenue/page.tsx` | Suivi |
| B5 | Pas d'outil admin pour contacter joueurs | - | Support |
| B6 | TVA Edgemy calculée différemment webhook vs pricing | `webhook/route.ts` | Comptabilité |

### 🟢 Mineurs

| # | Bug | Fichier | Impact |
|---|-----|---------|--------|
| B7 | Logs de debug encore présents | Plusieurs | Performance |
| B8 | Certaines sessions CONFIRMED sans stripePaymentId | BDD | Données |

---

## 3. ARCHITECTURE DES 3 SYSTÈMES DE PAIEMENT

### 📗 SYSTÈME A - PAIEMENT INTÉGRAL IMMÉDIAT (À ACTIVER)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTÈME A - PAIEMENT INTÉGRAL                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SESSION UNIQUE:                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Joueur   │───▶│ Stripe   │───▶│ Edgemy   │───▶│ Coach    │     │
│  │ paie 100%│    │ prélève  │    │ reçoit   │    │ reçoit   │     │
│  │ 106.50€  │    │ ~1.85€   │    │ 6.50€    │    │ 100€     │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │                                               │             │
│       │              APRÈS LA SESSION                 │             │
│       └───────────────────────────────────────────────┘             │
│                                                                     │
│  PACK D'HEURES:                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Joueur   │───▶│ Stripe   │───▶│ Edgemy   │───▶│ Coach    │     │
│  │ paie 100%│    │ prélève  │    │ reçoit   │    │ reçoit   │     │
│  │ 479.25€  │    │ ~7.44€   │    │ 29.25€   │    │ 450€     │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│       │                                               │             │
│       │         APRÈS LA 1ÈRE SESSION                 │             │
│       └───────────────────────────────────────────────┘             │
│                                                                     │
│  DÉDUCTION HEURES: Basée sur durée réelle (minutes/60)              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Calculs Système A :**
```typescript
// Session unique 100€
const coachPrice = 10000; // 100€ en centimes
const edgemyFee = coachPrice * 0.065; // 650 centimes = 6.50€
const totalCustomer = coachPrice + edgemyFee; // 10650 centimes = 106.50€
const stripeFee = totalCustomer * 0.015 + 25; // ~185 centimes = 1.85€
const edgemyNet = edgemyFee - stripeFee; // ~465 centimes = 4.65€

// Pack 5h à 450€
const packPrice = 45000; // 450€ en centimes
const edgemyFee = packPrice * 0.065; // 2925 centimes = 29.25€
const totalCustomer = packPrice + edgemyFee; // 47925 centimes = 479.25€
const stripeFee = totalCustomer * 0.015 + 25; // ~744 centimes = 7.44€
```

### 📙 SYSTÈME B - PAIEMENT DIFFÉRÉ (ACTUEL - À COMMENTER)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTÈME B - PAIEMENT DIFFÉRÉ                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SESSION UNIQUE:                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Joueur   │───▶│ Stripe   │───▶│ Argent   │───▶│ Coach    │     │
│  │ paie     │    │ prélève  │    │ GELÉ     │    │ reçoit   │     │
│  │ 106.50€  │    │ frais    │    │ Edgemy   │    │ après    │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│                                       │               │             │
│                                       │   SESSION     │             │
│                                       │   TERMINÉE    │             │
│                                       └───────────────┘             │
│                                                                     │
│  PACK D'HEURES:                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Joueur   │───▶│ Stripe   │───▶│ Argent   │───▶│ Coach    │     │
│  │ paie     │    │ prélève  │    │ GELÉ     │    │ reçoit   │     │
│  │ 479.25€  │    │ frais    │    │ Edgemy   │    │ par      │     │
│  └──────────┘    └──────────┘    └──────────┘    │ session  │     │
│                                       │          └──────────┘     │
│                                       │     CHAQUE SESSION        │
│                                       └───────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 📘 SYSTÈME C - PAIEMENT SPLIT 50/50 (À IMPLÉMENTER COMMENTÉ)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTÈME C - SPLIT 50/50                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PACK D'HEURES UNIQUEMENT:                                          │
│                                                                     │
│  ÉTAPE 1 - ACHAT:                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                      │
│  │ Joueur   │───▶│ Stripe   │───▶│ Edgemy   │                      │
│  │ paie 50% │    │ prélève  │    │ reçoit   │                      │
│  │ 239.63€  │    │ ~3.84€   │    │ 14.63€   │                      │
│  └──────────┘    └──────────┘    └──────────┘                      │
│                                                                     │
│  ÉTAPE 2 - FIN DU PACK:                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Joueur   │───▶│ Stripe   │───▶│ Edgemy   │───▶│ Coach    │     │
│  │ paie 50% │    │ prélève  │    │ reçoit   │    │ reçoit   │     │
│  │ 239.62€  │    │ ~3.84€   │    │ 14.62€   │    │ 450€     │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│                                                                     │
│  Commission Edgemy = 6.5% sur CHAQUE paiement                       │
│  Coach reçoit 100% après le 2ème paiement                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. FICHIERS À MODIFIER

### 4.1 Fichiers Principaux

| Fichier | Modifications |
|---------|---------------|
| `src/lib/stripe/pricing.ts` | Ajouter mode de paiement configurable |
| `src/lib/stripe/transfer.ts` | Système A: transfer intégral pack après 1ère session |
| `src/lib/stripe/business-rules.ts` | Ajouter constantes pour les 3 systèmes |
| `src/app/api/stripe/create-session/route.ts` | Adapter metadata selon système |
| `src/app/api/stripe/webhook/route.ts` | Gérer les 3 systèmes |
| `src/app/api/cron/auto-complete-sessions/route.ts` | Adapter pour Système A |
| `src/app/api/reservations/[id]/complete/route.ts` | Adapter pour Système A |

### 4.2 Fichiers Dashboard

| Fichier | Modifications |
|---------|---------------|
| `src/app/[locale]/(app)/coach/sessions/page.tsx` | Filtrer sessions non payées |
| `src/app/[locale]/admin/revenue/page.tsx` | Ajouter vue sessions abandonnées |
| `src/app/api/coach/sessions-complete/route.ts` | Filtrer paymentStatus |

### 4.3 Nouveaux Fichiers à Créer

| Fichier | Description |
|---------|-------------|
| `src/lib/stripe/payment-systems.ts` | Configuration des 3 systèmes |
| `src/app/api/admin/abandoned-sessions/route.ts` | API sessions abandonnées |

---

## 5. PLAN D'IMPLÉMENTATION

### Phase 1: Préparation (30 min)
1. ✅ Créer fichier de configuration des systèmes de paiement
2. ✅ Ajouter constante `ACTIVE_PAYMENT_SYSTEM = 'A'`
3. ✅ Documenter le système actuel (B) avec commentaires

### Phase 2: Système A - Sessions Uniques (1h)
1. Modifier `transfer.ts` pour transfer après session
2. Vérifier calculs dans `pricing.ts`
3. Adapter webhook pour marquer `transferStatus`

### Phase 3: Système A - Packs d'Heures (1h30)
1. Modifier `transferPackInstallment` → `transferPackFull`
2. Transfer intégral après 1ère session du pack
3. Déduction heures basée sur durée réelle (minutes/60)
4. Mettre à jour `remainingHours` dans `CoachingPackage`

### Phase 4: Dashboard Coach (45 min)
1. Filtrer sessions non payées de la liste
2. Ne garder que sessions PAID dans "Mes Sessions"
3. Supprimer badge "Non payé"

### Phase 5: Dashboard Admin (1h)
1. Créer API `/api/admin/abandoned-sessions`
2. Ajouter section "Sessions abandonnées" dans admin
3. Ajouter bouton "Contacter joueur"

### Phase 6: Système C (Commenté) (1h)
1. Implémenter logique split 50/50
2. Créer `createSplitPaymentSession`
3. Gérer 2ème paiement automatique
4. Commenter tout le code

### Phase 7: Tests & Validation (1h)
1. Tester session unique
2. Tester pack d'heures
3. Vérifier calculs comptables
4. Valider dashboards

---

## 6. DIAGRAMMES DE FLUX

### 6.1 Flux Réservation Session Unique (Système A)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Joueur  │     │ Frontend│     │  API    │     │ Stripe  │     │  BDD    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Sélectionne   │               │               │               │
     │ créneau       │               │               │               │
     ├──────────────▶│               │               │               │
     │               │ POST          │               │               │
     │               │ /reservations │               │               │
     │               ├──────────────▶│               │               │
     │               │               │ Crée          │               │
     │               │               │ réservation   │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     │               │ POST          │               │               │
     │               │ /stripe/      │               │               │
     │               │ create-session│               │               │
     │               ├──────────────▶│               │               │
     │               │               │ Checkout      │               │
     │               │               │ Session       │               │
     │               │               ├──────────────▶│               │
     │               │               │               │               │
     │               │◀──────────────┤ URL Checkout  │               │
     │               │               │               │               │
     │ Redirect      │               │               │               │
     │◀──────────────┤               │               │               │
     │               │               │               │               │
     │ Paie 106.50€  │               │               │               │
     ├──────────────────────────────────────────────▶│               │
     │               │               │               │               │
     │               │               │ Webhook       │               │
     │               │               │ checkout.     │               │
     │               │               │ completed     │               │
     │               │               │◀──────────────┤               │
     │               │               │               │               │
     │               │               │ Update        │               │
     │               │               │ paymentStatus │               │
     │               │               │ = PAID        │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     │               │               │               │               │
     │ ═══════════════════ SESSION SE DÉROULE ═══════════════════    │
     │               │               │               │               │
     │               │               │ CRON ou       │               │
     │               │               │ /complete     │               │
     │               │               │               │               │
     │               │               │ Transfer      │               │
     │               │               │ 100€ au coach │               │
     │               │               ├──────────────▶│               │
     │               │               │               │               │
     │               │               │ Update        │               │
     │               │               │ transferStatus│               │
     │               │               │ = TRANSFERRED │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
```

### 6.2 Flux Pack d'Heures (Système A)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Joueur  │     │ Frontend│     │  API    │     │ Stripe  │     │  BDD    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Achète pack   │               │               │               │
     │ 5h = 450€     │               │               │               │
     ├──────────────▶│               │               │               │
     │               │               │               │               │
     │ Paie 479.25€  │               │               │               │
     ├──────────────────────────────────────────────▶│               │
     │               │               │               │               │
     │               │               │ Webhook       │               │
     │               │               │ completed     │               │
     │               │               │◀──────────────┤               │
     │               │               │               │               │
     │               │               │ Crée          │               │
     │               │               │ CoachingPack  │               │
     │               │               │ remainingHours│               │
     │               │               │ = 5.0         │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     │ ═══════════ 1ÈRE SESSION (1h30) SE DÉROULE ═══════════════    │
     │               │               │               │               │
     │               │               │ CRON ou       │               │
     │               │               │ /complete     │               │
     │               │               │               │               │
     │               │               │ Transfer      │               │
     │               │               │ 450€ INTÉGRAL │               │
     │               │               │ au coach      │               │
     │               │               ├──────────────▶│               │
     │               │               │               │               │
     │               │               │ Update        │               │
     │               │               │ remainingHours│               │
     │               │               │ = 5.0 - 1.5   │               │
     │               │               │ = 3.5h        │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     │ ═══════════ 2ÈME SESSION (1h) SE DÉROULE ═══════════════      │
     │               │               │               │               │
     │               │               │ Update        │               │
     │               │               │ remainingHours│               │
     │               │               │ = 3.5 - 1.0   │               │
     │               │               │ = 2.5h        │               │
     │               │               ├──────────────────────────────▶│
     │               │               │               │               │
     │               │ (Pas de       │               │               │
     │               │  transfer,    │               │               │
     │               │  déjà fait)   │               │               │
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
```

---

## 7. PLAN DE TEST

### 7.1 Tests Unitaires

| Test | Description | Résultat Attendu |
|------|-------------|------------------|
| T1 | Calcul commission session 100€ | edgemyFee = 6.50€ |
| T2 | Calcul commission pack 450€ | edgemyFee = 29.25€ |
| T3 | Frais Stripe sur 106.50€ | ~1.85€ |
| T4 | Déduction heures 1h30 | remainingHours -= 1.5 |

### 7.2 Tests E2E

| Test | Scénario | Validation |
|------|----------|------------|
| E1 | Réserver session unique | Paiement OK, session créée |
| E2 | Compléter session unique | Transfer au coach après session |
| E3 | Acheter pack 5h | Pack créé, remainingHours = 5 |
| E4 | Compléter 1ère session pack | Transfer intégral 450€ |
| E5 | Compléter 2ème session pack | Pas de transfer, heures déduites |
| E6 | Dashboard coach | Pas de sessions non payées |
| E7 | Dashboard admin | Sessions abandonnées visibles |

### 7.3 Tests de Régression

| Test | Vérification |
|------|--------------|
| R1 | Webhook Stripe toujours fonctionnel |
| R2 | Cron auto-complete opérationnel |
| R3 | Annulations fonctionnent |
| R4 | Remboursements fonctionnent |

---

## 8. CHECKLIST FINALE

### Avant Déploiement

- [ ] Système A implémenté et actif
- [ ] Système B commenté entièrement
- [ ] Système C implémenté et commenté
- [ ] Dashboard coach filtré (sessions payées uniquement)
- [ ] Dashboard admin avec sessions abandonnées
- [ ] Tests E2E passés
- [ ] Variables d'environnement vérifiées
- [ ] Webhook Stripe testé
- [ ] Cron jobs configurés dans vercel.json

### Variables à Vérifier

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EDGEMY_SERVICE_FEE_PERCENT=6.5
STRIPE_PERCENT_FEE=0.015
STRIPE_FIXED_FEE_CENTS=25
CRON_SECRET=...
ACTIVE_PAYMENT_SYSTEM=A
```

### Fichiers Modifiés (Résumé)

1. `src/lib/stripe/payment-systems.ts` (NOUVEAU)
2. `src/lib/stripe/pricing.ts` (MODIFIÉ)
3. `src/lib/stripe/transfer.ts` (MODIFIÉ)
4. `src/lib/stripe/business-rules.ts` (MODIFIÉ)
5. `src/app/api/stripe/webhook/route.ts` (MODIFIÉ)
6. `src/app/api/cron/auto-complete-sessions/route.ts` (MODIFIÉ)
7. `src/app/[locale]/(app)/coach/sessions/page.tsx` (MODIFIÉ)
8. `src/app/api/admin/abandoned-sessions/route.ts` (NOUVEAU)

---

## 📝 NOTES IMPORTANTES

1. **Transition** : Le passage du Système B au Système A doit être fait en une seule fois pour éviter les incohérences.

2. **Packs existants** : Les packs déjà en cours continueront avec l'ancien système (paiement par session).

3. **Comptabilité** : Vérifier avec le comptable que le nouveau système est conforme.

4. **Stripe Connect** : Tous les coachs doivent avoir un compte Connect valide pour recevoir les transfers.

---

*Document généré automatiquement - Edgemy MVP Audit*
