# ✅ CHECKLIST DÉPLOIEMENT STRIPE - EDGEMY

## 📋 PRHASE 1 : CONFIGURATION STRIPE

### Stripe Dashboard

- [ ] Activer Stripe Tax dans Settings → Tax
- [ ] Créer les Price IDs pour les abonnements :
  - [ ] PRO Monthly (39€)
  - [ ] PRO Yearly (399€)
  - [ ] LITE Monthly (15€)
  - [ ] LITE Yearly (149€)
- [ ] Configurer Stripe Connect Express
- [ ] Créer le webhook endpoint `/api/stripe/webhook`
- [ ] Copier le `STRIPE_WEBHOOK_SECRET`

### Variables d'environnement (.env)

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Fees (vérifier tarifs réels)
STRIPE_PERCENT_FEE=0.015      # 1.5%
STRIPE_FIXED_FEE_CENTS=25     # 0.25€

# Stripe Price IDs
STRIPE_COACH_MONTHLY_PRICE_ID=price_xxx
STRIPE_COACH_YEARLY_PRICE_ID=price_xxx
STRIPE_COACH_LITE_MONTHLY_PRICE_ID=price_xxx
STRIPE_COACH_LITE_YEARLY_PRICE_ID=price_xxx

# Stripe Connect
STRIPE_CONNECT_ENABLED=true
```

---

## 📊 PHASE 2 : BASE DE DONNÉES

### Migration Prisma

- [ ] Appliquer migration TVA :
```bash
psql $DATABASE_URL -f prisma/migrations/add_vat_accounting_fields.sql
```

- [ ] Exécuter backfill des champs TVA :
```bash
npx tsx scripts/backfill-vat-fields.ts
```

- [ ] Vérifier que tous les champs sont remplis :
```sql
SELECT COUNT(*) FROM "Reservation" WHERE "edgemyRevenueHT" IS NULL;
-- Doit retourner 0
```

---

## 🧪 PHASE 3 : TESTS

### Tests unitaires

- [ ] Lancer tests pricing :
```bash
npx tsx scripts/test-pricing-calculation.ts
```

**Attendu** : Tous les tests verts ✅

### Tests end-to-end

- [ ] **Test 1** : Paiement session 100€
  - Créer réservation test
  - Payer via Stripe Checkout
  - Vérifier webhook `checkout.session.completed`
  - Vérifier en DB :
    - `paymentStatus === 'PAID'`
    - `edgemyRevenueHT > 0`
    - `edgemyRevenueTVACents === edgemyRevenueHT * 0.20`

- [ ] **Test 2** : Paiement pack 850€
  - Créer pack test
  - Payer via Stripe Checkout
  - Vérifier calcul 3€ + 2%
  - Vérifier marge positive

- [ ] **Test 3** : Transfer au coach
  - Marquer session comme complétée
  - Vérifier transfer créé dans Stripe
  - Vérifier `transferStatus === 'TRANSFERRED'`

- [ ] **Test 4** : Remboursement
  - Créer remboursement via API
  - Vérifier refund dans Stripe
  - Vérifier `refundStatus === 'FULL'`

- [ ] **Test 5** : Abonnement PRO
  - S'abonner au plan PRO Monthly
  - Vérifier `subscriptionStatus === 'ACTIVE'`
  - Vérifier TVA ajoutée sur facture

- [ ] **Test 6** : Plan LITE
  - Activer plan LITE
  - Vérifier `subscriptionStatus === 'TRIALING'`
  - Confirmer paiement via admin
  - Vérifier `subscriptionStatus === 'ACTIVE'`

---

## 🔐 PHASE 4 : SÉCURITÉ

### Webhooks

- [ ] Vérifier signature webhook activée
- [ ] Tester webhook invalide (doit échouer)
- [ ] Vérifier que seuls les événements attendus sont traités

### Permissions

- [ ] Vérifier que seuls les admins peuvent confirmer paiements LITE
- [ ] Vérifier que les coachs ne peuvent pas accéder aux données financières d'autres coachs
- [ ] Vérifier que les joueurs ne peuvent voir que leurs propres réservations

### Données sensibles

- [ ] Vérifier qu'aucun Secret Stripe n'est loggé
- [ ] Vérifier qu'aucune donnée bancaire n'est stockée en DB
- [ ] Vérifier que les logs ne contiennent pas de données personnelles

---

## 📝 PHASE 5 : DOCUMENTATION

### Interne

- [ ] Lire [RUNBOOK_STRIPE_SUPPORT.md](RUNBOOK_STRIPE_SUPPORT.md)
- [ ] Lire [LITE_PLAN_IMPLEMENTATION.md](LITE_PLAN_IMPLEMENTATION.md)
- [ ] Former l'équipe Support sur le runbook

### Externe (utilisateurs)

- [ ] Mettre à jour CGV :
  - Indiquer que le joueur paie les frais Edgemy
  - Indiquer que le coach reçoit 100% du prix de base
  - Détailler politique remboursement (24h)
- [ ] Créer FAQ paiements :
  - Comment payer ?
  - Quand le coach reçoit-il l'argent ?
  - Comment se faire rembourser ?
  - Quelle est la différence PRO / LITE ?

---

## 📊 PHASE 6 : MONITORING

### Alertes à configurer

- [ ] Email admin si marge Edgemy nulle
- [ ] Email admin si transfer échoué
- [ ] Email admin si litige ouvert
- [ ] Email admin si abonnement PAST_DUE > 3 jours

### Métriques à suivre

- [ ] Taux de paiement réussi (> 95%)
- [ ] Délai moyen paiement coach (< 48h)
- [ ] Taux de remboursement (< 3%)
- [ ] Nombre de litiges (0)
- [ ] Revenu Edgemy mensuel (croissance)

### Dashboards

- [ ] Créer dashboard Stripe (revenus, payouts, litiges)
- [ ] Créer dashboard Admin (/admin/finance)
- [ ] Configurer export CSV mensuel automatique

---

## 🚀 PHASE 7 : DÉPLOIEMENT

### Pre-production

- [ ] Déployer sur environnement de staging
- [ ] Tester avec vraies cartes Stripe Test
- [ ] Vérifier tous les webhooks
- [ ] Vérifier logs (pas d'erreurs)

### Production

- [ ] Switcher vers Stripe Live keys
- [ ] Déployer sur Vercel/production
- [ ] Configurer webhook production
- [ ] Monitorer logs pendant 24h
- [ ] Tester 1 vraie transaction (interne)

### Post-déploiement

- [ ] Annoncer nouvelle intégration aux coachs (email)
- [ ] Proposer migration plan LITE (optionnelle)
- [ ] Surveiller métriques pendant 7 jours
- [ ] Organiser rétrospective équipe

---

## 📞 CONTACTS

- **Support Stripe** : https://support.stripe.com
- **Slack interne** : #stripe-integration
- **Email Tech** : tech@edgemy.fr
- **Email Finance** : finance@edgemy.fr

---

## 🎯 CRITÈRES DE SUCCÈS

L'intégration est considérée comme réussie si :

- ✅ **100%** des paiements joueurs réussis
- ✅ **100%** des coachs payés dans les 48h
- ✅ **0** litige dans les 30 premiers jours
- ✅ **< 1%** de remboursements
- ✅ **> 90%** de satisfaction utilisateurs (sondage)
- ✅ **TVA correctement calculée** et déclarée
- ✅ **Aucune erreur comptable** détectée par l'expert-comptable

---

**Date de déploiement prévu** : _____________
**Responsable déploiement** : _____________
**Version** : 1.0
**Dernière mise à jour** : 2025-11-18
