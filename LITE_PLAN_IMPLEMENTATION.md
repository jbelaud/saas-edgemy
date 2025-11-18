# 📘 IMPLÉMENTATION PLAN LITE - PAIEMENT MANUEL

## 🎯 Résumé

Le plan **LITE** d'Edgemy est conçu pour les coachs qui préfèrent un paiement manuel (Wise, Revolut, USDT, virement bancaire) plutôt qu'un prélèvement automatique via Stripe.

**Tarifs** :
- 15€/mois
- 149€/an

**Différences avec le plan PRO** :
- ❌ Pas de prélèvement automatique Stripe
- ✅ Paiement manuel (Wise, Revolut, USDT, virement)
- ✅ Commission 0% sur les sessions (coach gère paiements)
- ⚠️ Fonctionnalités limitées (pas d'analytics avancés, support standard)

---

## 🔧 Architecture technique

### Flow d'activation LITE

```
1. Coach clique "Activer plan LITE"
   ↓
2. POST /api/coach/subscription/activate-lite
   - planKey = 'LITE'
   - subscriptionStatus = 'TRIALING' (en attente confirmation)
   ↓
3. Instructions de paiement affichées
   - Wise: contact@edgemy.fr (ref: LITE-{coachId})
   - Revolut: @edgemy (ref: LITE-{coachId})
   - USDT: [adresse crypto] (ref: LITE-{coachId})
   - Virement: IBAN FR76... (ref: LITE-{coachId})
   ↓
4. Coach effectue le paiement manuel
   ↓
5. Admin vérifie le paiement
   ↓
6. POST /api/admin/confirm-lite-payment { coachId, plan, confirmed: true }
   - subscriptionStatus = 'ACTIVE'
   - currentPeriodEnd = +1 mois ou +1 an
   ↓
7. Coach peut utiliser Edgemy en mode LITE
```

### Flow de renouvellement LITE

```
1. currentPeriodEnd approche (7 jours avant)
   ↓
2. Email automatique au coach
   "Votre abonnement LITE expire le XX/XX/XXXX"
   ↓
3. Coach effectue un nouveau paiement
   ↓
4. Admin confirme → currentPeriodEnd +1 mois/an
```

---

## 📊 Base de données

### Champs coach concernés

```sql
coach {
  planKey: 'LITE'  -- Identifie le plan LITE
  subscriptionStatus: 'TRIALING' | 'ACTIVE' | 'CANCELED'
  subscriptionPlan: 'MONTHLY' | 'YEARLY'
  subscriptionId: NULL  -- Pas d'abonnement Stripe
  stripeCustomerId: NULL  -- Pas de customer Stripe (sauf si déjà créé)
  currentPeriodEnd: DateTime  -- Date de fin de l'abonnement
  paymentPreferences: ['WISE', 'REVOLUT', 'USDT', 'BANK_TRANSFER']
}
```

---

## 🔐 Sécurité

### Permissions

- ✅ **Coach** : Peut activer le plan LITE
- ✅ **Admin** : Peut confirmer/refuser les paiements LITE
- ❌ **Player** : Ne peut pas accéder à ces routes

### Validations

1. Un coach PRO actif ne peut pas passer en LITE sans annuler son abonnement Stripe
2. Un coach LITE ne peut pas créer de sessions payantes via Stripe (commission 0%)
3. Les paiements manuels doivent être confirmés par un admin

---

## 🧪 Tests à effectuer

### Test 1 : Activation plan LITE

```bash
curl -X POST http://localhost:3000/api/coach/subscription/activate-lite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"paymentMethod": "WISE"}'
```

**Attendu** :
- `planKey: 'LITE'`
- `subscriptionStatus: 'TRIALING'`
- Instructions de paiement affichées

### Test 2 : Confirmation paiement par admin

```bash
curl -X POST http://localhost:3000/api/admin/confirm-lite-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"coachId": "xxx", "plan": "MONTHLY", "confirmed": true}'
```

**Attendu** :
- `subscriptionStatus: 'ACTIVE'`
- `currentPeriodEnd` dans 1 mois

### Test 3 : Refus paiement par admin

```bash
curl -X POST http://localhost:3000/api/admin/confirm-lite-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"coachId": "xxx", "plan": "MONTHLY", "confirmed": false}'
```

**Attendu** :
- `subscriptionStatus: 'CANCELED'`
- `planKey: 'PRO'` (retour au plan par défaut)

---

## 📝 TODO Liste

### Phase 1 : MVP
- [x] Créer route `/api/coach/subscription/activate-lite`
- [x] Créer route admin `/api/admin/confirm-lite-payment`
- [ ] Créer interface UI pour activation LITE
- [ ] Créer dashboard admin pour gérer paiements LITE
- [ ] Créer email de confirmation paiement LITE
- [ ] Créer email de rappel renouvellement (7 jours avant expiration)

### Phase 2 : Automatisation
- [ ] Cron job pour détecter les abonnements LITE expirés
- [ ] Notification admin quand nouveau paiement LITE à valider
- [ ] Logs admin pour tracker tous les paiements LITE
- [ ] Statistiques : nombre de coachs LITE actifs

### Phase 3 : Expérience utilisateur
- [ ] Tableau comparatif PRO vs LITE
- [ ] FAQ plan LITE
- [ ] Tutoriel paiement Wise/Revolut/USDT
- [ ] Support chat pour aide paiement LITE

---

## 💡 Recommandations

### Option A : Paiement manuel (implémenté)
- ✅ Simple à mettre en place
- ✅ Pas de frais Stripe
- ❌ Nécessite intervention admin
- ❌ Pas de renouvellement automatique

### Option B : Stripe Billing avec `cancel_at_period_end`
- ✅ Renouvellement automatique
- ✅ Pas d'intervention admin
- ❌ Frais Stripe (1.5% + 0.25€)
- ⚠️ Incompatible avec le brief "pas de prélèvement automatique"

**Choix recommandé** : **Option A** pour respecter le brief initial.

---

## 📞 Support

Pour toute question sur l'implémentation du plan LITE :
- Slack : #stripe-integration
- Email : dev@edgemy.fr
