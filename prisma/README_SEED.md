# 🌱 Seed Database - Jeu de Test Edgemy

## 📋 Vue d'ensemble

Ce script de seed crée un jeu de données de test complet pour la plateforme Edgemy, incluant des utilisateurs, des profils coach, des annonces et des réservations.

## 🚀 Utilisation

### Option 1 : Seed SAFE (Préserve les subscribers) ⭐ RECOMMANDÉ
```bash
pnpm db:seed:safe
```
✅ Supprime uniquement les données de test  
✅ **Préserve tous les subscribers**  
✅ Idéal pour la production

### Option 2 : Seed complet (Supprime tout)
```bash
pnpm db:seed
```
⚠️ Utilise `upsert` mais peut créer des doublons

### Option 3 : Reset complet de la DB + seed
```bash
pnpm db:reset
```
❌ **ATTENTION** : Supprime TOUTES les données (y compris les subscribers) !

## 👥 Comptes de Test Créés

### 🟢 Coach Actif - Jean Dupont

| Champ | Valeur |
|-------|--------|
| **Email** | `coach-actif@edgemy.fr` |
| **Nom** | Jean Dupont |
| **Slug** | `jean-dupont` |
| **Status** | `ACTIVE` ✅ |
| **Formats** | MTT, CASH, GTO |
| **Stakes** | NL100-NL500 |
| **ROI** | 18.5% |
| **Expérience** | 10 ans |
| **Langues** | FR, EN |
| **Annonces** | 4 (3 actives, 1 désactivée) |
| **Réseaux** | Twitch, YouTube, Twitter |

**URLs de test** :
- Dashboard : `/coach/dashboard`
- Profil public : `/coach/jean-dupont`

**Scénarios** :
- ✅ Peut se connecter au dashboard
- ✅ Profil visible publiquement
- ✅ Peut créer/modifier des annonces
- ✅ A des réservations passées et à venir

---

### 🔴 Coach Inactif - Marie Martin

| Champ | Valeur |
|-------|--------|
| **Email** | `coach-inactif@edgemy.fr` |
| **Nom** | Marie Martin |
| **Slug** | `marie-martin` |
| **Status** | `INACTIVE` ❌ |
| **Formats** | SPIN, MTT |
| **Stakes** | NL10-NL50 |
| **ROI** | 12.0% |
| **Expérience** | 5 ans |
| **Langues** | FR |
| **Annonces** | 1 (non visible) |
| **Abonnement** | Expiré |

**URLs de test** :
- Dashboard : `/coach/dashboard`
- Profil public : `/coach/marie-martin` → **404**

**Scénarios** :
- ✅ Peut se connecter au dashboard
- ⚠️ Voit une alerte "Abonnement expiré"
- ❌ Profil NON visible publiquement
- ❌ Ne peut pas recevoir de nouvelles réservations

---

### 🟡 Coach En Validation - Pierre Durand

| Champ | Valeur |
|-------|--------|
| **Email** | `coach-pending@edgemy.fr` |
| **Nom** | Pierre Durand |
| **Slug** | `pierre-durand` |
| **Status** | `PENDING_REVIEW` ⏳ |
| **Formats** | MENTAL, GTO |
| **Stakes** | NL50-NL200 |
| **Expérience** | 7 ans |
| **Langues** | FR, EN, DE |
| **Annonces** | 0 |

**URLs de test** :
- Dashboard : `/coach/dashboard`
- Profil public : `/coach/pierre-durand` → **404**

**Scénarios** :
- ✅ Peut se connecter au dashboard
- ⚠️ Voit une alerte "Profil en cours de validation"
- ❌ Profil NON visible publiquement
- ⏳ En attente de validation admin

---

### 🎮 Joueur - Sophie Bernard

| Champ | Valeur |
|-------|--------|
| **Email** | `joueur@edgemy.fr` |
| **Nom** | Sophie Bernard |
| **Format préféré** | MTT |
| **Niveau** | INTERMEDIATE |

**Scénarios** :
- ✅ Peut parcourir les profils de coachs
- ✅ Peut réserver avec Jean Dupont
- ✅ A 2 réservations (1 passée, 1 à venir)

---

## 📊 Données Créées

### Annonces (Jean Dupont)

1. **Coaching MTT - Débutant**
   - Prix : 50€
   - Durée : 60 min
   - Status : Active ✅

2. **Coaching Cash Game NL100-NL200**
   - Prix : 80€
   - Durée : 90 min
   - Status : Active ✅

3. **Pack 5 sessions - Progression MTT**
   - Prix : 200€
   - Durée : 60 min
   - Status : Active ✅

4. **Analyse de main GTO**
   - Prix : 30€
   - Durée : 30 min
   - Status : Inactive ❌

### Réservations (Sophie Bernard)

1. **Réservation confirmée** (dans 7 jours)
   - Coach : Jean Dupont
   - Annonce : Coaching MTT - Débutant
   - Prix : 50€
   - Status : CONFIRMED

2. **Réservation complétée** (il y a 3 jours)
   - Coach : Jean Dupont
   - Annonce : Coaching Cash Game
   - Prix : 80€
   - Status : COMPLETED

---

## 🧪 Scénarios de Test Recommandés

### 1. Test Profil Public Coach Actif
```
1. Aller sur /coach/jean-dupont
2. Vérifier l'affichage du header (avatar, bannière, bio)
3. Vérifier les 3 annonces actives
4. Cliquer sur "Réserver" → Modal de réservation
```

### 2. Test Dashboard Coach Actif
```
1. Se connecter avec coach-actif@edgemy.fr
2. Vérifier les stats (revenus, réservations)
3. Onglet "Profil" → Modifier les informations
4. Onglet "Annonces" → Créer/Modifier/Supprimer
5. Bouton "Voir mon profil public" → Ouvre /coach/jean-dupont
```

### 3. Test Coach Inactif
```
1. Se connecter avec coach-inactif@edgemy.fr
2. Vérifier l'alerte "Profil inactif"
3. Essayer d'accéder à /coach/marie-martin → 404
```

### 4. Test Coach En Validation
```
1. Se connecter avec coach-pending@edgemy.fr
2. Vérifier l'alerte "Profil en cours de validation"
3. Essayer d'accéder à /coach/pierre-durand → 404
```

### 5. Test Réservation Joueur
```
1. Se connecter avec joueur@edgemy.fr
2. Aller sur /coach/jean-dupont
3. Cliquer sur "Réserver" sur une annonce
4. Remplir le formulaire de réservation
5. Vérifier la création de la réservation
```

---

## 🔍 Points de Vérification

### Visibilité des Profils
- ✅ Jean Dupont (ACTIVE) → Visible
- ❌ Marie Martin (INACTIVE) → 404
- ❌ Pierre Durand (PENDING_REVIEW) → 404

### Alertes Dashboard
- Jean Dupont → Aucune alerte
- Marie Martin → "Profil inactif - Renouveler abonnement"
- Pierre Durand → "Profil en cours de validation"

### Annonces Visibles
- Jean Dupont → 3 annonces (la 4ème est désactivée)
- Marie Martin → 0 (profil inactif)
- Pierre Durand → 0 (profil en validation)

---

## 🛠️ Maintenance

### Ajouter de nouveaux comptes
Modifier `prisma/seed.ts` et relancer :
```bash
pnpm db:seed
```

### Reset complet
```bash
pnpm db:reset
```

### Vérifier les données
```bash
pnpm prisma studio
```

---

## 📝 Notes

- Les mots de passe ne sont PAS créés par le seed (Better Auth gère l'authentification)
- Pour se connecter, utiliser le système d'authentification de Better Auth
- Les images utilisent Dicebear (avatars) et Unsplash (bannières)
- Les IDs Stripe sont mockés (`acct_test_*`, `sub_test_*`)

---

## 🎯 Prochaines Étapes

Une fois le seed exécuté, vous pouvez :
1. Tester les différents profils de coach
2. Créer de nouvelles annonces
3. Tester le système de réservation
4. Vérifier les permissions selon le statut du coach
