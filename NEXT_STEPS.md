# 🚀 PROCHAINES ÉTAPES - GUIDE RAPIDE

**Status actuel:** ✅ Tests automatiques réussis
**Prochaine étape:** Tests d'intégration manuels

---

## ⚡ QUICK START (15 minutes)

### 1. Démarrer l'environnement de test

```bash
# Terminal 1: Démarrer l'app
pnpm dev

# Terminal 2: Écouter les webhooks Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test minimal (Session 100€)

1. **Se connecter en tant que joueur**
   - Réserver une session 1h à 100€

2. **Payer avec carte test**
   - Carte: `4242 4242 4242 4242`
   - CVV: `123`, Expiration: `12/30`

3. **Vérifier le paiement**
   - [ ] Redirection vers page de succès
   - [ ] Stripe Dashboard: paiement de 105€
   - [ ] Terminal webhooks: `checkout.session.completed` ✅

4. **Vérifier en base de données**
   ```sql
   SELECT
     "priceCents",              -- Attendu: 10000 (100€)
     "serviceFeeCents",         -- Attendu: 500 (5€)
     "edgemyRevenueHT",         -- Attendu: 317 (3.17€)
     "edgemyRevenueTVACents",   -- Attendu: 63 (0.63€)
     "paymentStatus",           -- Attendu: 'PAID'
     "transferStatus"           -- Attendu: 'PENDING'
   FROM "Reservation"
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

5. **Marquer session comme complétée**
   - Se connecter en tant que coach
   - "Mes sessions" → Cliquer "Marquer comme complétée"

6. **Vérifier le transfer**
   - [ ] Stripe Dashboard → Transfers: 100€ vers coach
   - [ ] En DB: `transferStatus = 'TRANSFERRED'`

### ✅ Critères de succès
- Joueur paie 105€ (100€ + 5€)
- Coach reçoit 100€
- Edgemy garde 3.17€ HT + 0.63€ TVA = 3.80€ TTC
- Stripe prend ~1.83€

---

## 📋 TESTS COMPLETS (2-3 heures)

Suivre le guide détaillé: **[TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md)**

### Scénarios à tester

| # | Scénario | Durée | Priorité |
|---|----------|-------|----------|
| 1 | Session individuelle 100€ | 10 min | ⭐⭐⭐ |
| 2 | Pack 10h à 850€ | 15 min | ⭐⭐⭐ |
| 3 | Remboursement | 10 min | ⭐⭐ |
| 4 | Abonnement PRO | 10 min | ⭐⭐⭐ |
| 5 | Plan LITE (manuel) | 10 min | ⭐ |
| 6 | Webhooks | 5 min | ⭐⭐ |
| 7 | Alertes sécurité | 5 min | ⭐ |

**Total estimé:** ~65 minutes

---

## 🛠️ OUTILS DE DIAGNOSTIC

### Vérifier la configuration
```bash
# Re-vérifier tout
npx tsx scripts/run-all-tests.ts

# Vérifier un transfer spécifique
npx tsx scripts/check-transfer.ts [RESERVATION_ID]

# Générer rapport comptable
npx tsx scripts/export-monthly-report.ts 2025-01
```

### Stripe CLI - Commandes utiles
```bash
# Voir les événements en temps réel
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Simuler un événement
stripe trigger checkout.session.completed

# Voir les logs Stripe
stripe logs tail

# Voir les transfers
stripe transfers list --limit 10
```

### Stripe Dashboard
- **Payments:** https://dashboard.stripe.com/test/payments
- **Transfers:** https://dashboard.stripe.com/test/connect/transfers
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Customers:** https://dashboard.stripe.com/test/customers
- **Subscriptions:** https://dashboard.stripe.com/test/subscriptions

---

## 🐛 PROBLÈMES COURANTS

### "Missing stripe-signature header"
**Solution:** Démarrer Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### "Coach Stripe Connect account not configured"
**Solution:** Le coach doit configurer son compte Stripe Express (pas de compte mock)

### "La session n'est pas encore terminée"
**Solution:** Modifier `endDate` en BDD pour qu'elle soit dans le passé
```sql
UPDATE "Reservation"
SET "endDate" = NOW() - INTERVAL '1 minute'
WHERE id = 'votre_reservation_id';
```

### Webhook ne fonctionne pas en local
**Solution:** Vérifier que le webhook secret est bien celui de Stripe CLI
```bash
# Le secret affiché par Stripe CLI doit être dans .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 📊 APRÈS LES TESTS

### Si tous les tests manuels sont ✅

1. **Lire le deployment checklist**
   - [STRIPE_DEPLOYMENT_CHECKLIST.md](STRIPE_DEPLOYMENT_CHECKLIST.md)

2. **Configurer Stripe Dashboard production**
   - Activer Stripe Tax
   - Créer Price IDs en LIVE
   - Configurer webhook production

3. **Mettre à jour .env pour production**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (production)
   STRIPE_COACH_MONTHLY_PRICE_ID=price_... (LIVE)
   STRIPE_COACH_YEARLY_PRICE_ID=price_... (LIVE)
   STRIPE_COACH_LITE_MONTHLY_PRICE_ID=price_... (LIVE)
   STRIPE_COACH_LITE_YEARLY_PRICE_ID=price_... (LIVE)
   ```

4. **Déployer**
   ```bash
   git add .
   git commit -m "feat: finalisation intégration Stripe (TVA + Billing + Connect)"
   git push origin main
   ```

5. **Surveiller pendant 24h**
   - Logs Vercel
   - Stripe Dashboard LIVE
   - Premier paiement réel
   - Premier transfer réel

---

## 📞 SUPPORT

### Problème technique
1. Consulter [RUNBOOK_STRIPE_SUPPORT.md](RUNBOOK_STRIPE_SUPPORT.md)
2. Vérifier les logs: `npx tsx scripts/run-all-tests.ts`
3. Contacter: tech@edgemy.fr

### Problème comptable/fiscal
1. Consulter [STRIPE_FINALIZATION_SUMMARY.md](STRIPE_FINALIZATION_SUMMARY.md)
2. Générer rapport: `npx tsx scripts/export-monthly-report.ts YYYY-MM`
3. Contacter: finance@edgemy.fr

### Problème Stripe
1. Stripe Dashboard → Support
2. Documentation: https://stripe.com/docs
3. Slack: #stripe-integration

---

## ✅ CHECKLIST RAPIDE

Avant de passer en production, cocher:

### Tests
- [ ] Session 100€: paiement + transfer ✅
- [ ] Pack 850€: paiement + transfers progressifs ✅
- [ ] Remboursement fonctionne ✅
- [ ] Abonnement PRO avec TVA ✅
- [ ] Webhooks fonctionnent ✅

### Configuration
- [ ] Stripe Tax activé en production
- [ ] Price IDs LIVE créés
- [ ] Webhook production configuré
- [ ] Variables .env production mises à jour

### Documentation
- [ ] Équipe Support a lu le runbook
- [ ] Procédures de remboursement comprises
- [ ] Escalation path claire

---

**C'est parti ! 🚀**

Commencez par le test minimal ci-dessus, puis suivez [TESTING_GUIDE_COMPLETE.md](TESTING_GUIDE_COMPLETE.md) pour les tests complets.
