# Routes de la Homepage Edgemy

## ✅ Routes corrigées et fonctionnelles

Toutes les routes utilisent maintenant le préfixe `[locale]` pour supporter l'internationalisation (FR, EN, DE, IT, ES).

### 🔗 Routes principales

| Lien dans la homepage | Route réelle | Description |
|----------------------|--------------|-------------|
| **Se connecter** | `/${locale}/dashboard` | Connexion et redirection vers dashboard |
| **Créer un compte** | `/${locale}/signup` | Page d'inscription générique |
| **Créer un compte joueur** | `/${locale}/signup?context=player` | Inscription avec contexte joueur |
| **Devenir coach** | `/${locale}/signup?context=coach` | Inscription avec contexte coach |
| **Découvrir les coachs** | `/${locale}/coachs` | Liste des coachs disponibles |

### 📍 Ancres de navigation (smooth scroll)

| Lien | Ancre | Section |
|------|-------|---------|
| Fonctionnalités | `#features` | WhyEdgemySection |
| Pour les joueurs | `#for-players` | DualSection (card joueur) |
| Pour les coachs | `#for-coaches` | DualSection (card coach) |
| À propos | `#about` | MissionSection |

### 📄 Pages publiques existantes

| Lien footer | Route | Statut |
|-------------|-------|--------|
| Contact | `/${locale}/contact` | ✅ Existe |
| Blog | `/${locale}/blog` | ✅ Existe |
| Mentions légales | `/${locale}/mentions-legales` | ✅ Existe |
| Politique de confidentialité | `/${locale}/politique-de-confidentialite` | ✅ Existe |
| À propos | `/${locale}/a-propos` | ✅ Existe |

### 🔗 Liens temporaires (ancres)

Ces liens utilisent des ancres en attendant les pages dédiées :

- **FAQ** : `#faq` (à créer : `/${locale}/faq`)
- **Centre d'aide** : `#contact` (redirige vers contact)
- **Cookies** : `#cookies` (à créer : `/${locale}/cookies`)

### 🌐 Réseaux sociaux (à configurer)

- Discord : `https://discord.gg/edgemy`
- Twitter : `https://twitter.com/edgemy`
- LinkedIn : `https://linkedin.com/company/edgemy`

## 🎯 Flux utilisateur

### Joueur
1. Homepage → **"Créer un compte joueur"** → `/fr/signup?context=player`
2. Inscription → Redirection `/fr/player/dashboard`
3. Ou : **"Trouver un coach"** → `/fr/coachs` → Sélection coach → Réservation

### Coach
1. Homepage → **"Devenir coach"** → `/fr/signup?context=coach`
2. Inscription → Redirection `/fr/coach/dashboard`
3. Dashboard → Activation abonnement → Profil public visible

### Visiteur
1. Homepage → **"Découvrir les coachs"** → `/fr/coachs`
2. Navigation → Ancres smooth scroll vers sections
3. Footer → Pages légales et ressources

## 🔧 Composants mis à jour

Tous ces composants utilisent maintenant `useLocale()` de `next-intl` :

- ✅ `LandingHeader.tsx`
- ✅ `HeroSection.tsx`
- ✅ `DualSection.tsx`
- ✅ `FinalCTASection.tsx`
- ✅ `LandingFooter.tsx`

## 📝 Notes techniques

- **Locale par défaut** : `fr` (français)
- **Locales supportées** : `fr`, `en`, `de`, `it`, `es`
- **Pattern de route** : `/${locale}/[route]`
- **Exemple** : `/fr/coachs`, `/en/coaches`, `/de/coaches`, etc.

## 🚀 Prochaines étapes

1. Créer page `/faq` avec questions fréquentes
2. Créer page `/cookies` pour gestion cookies
3. Configurer vraies URLs réseaux sociaux
4. Ajouter redirections automatiques selon langue navigateur
5. Implémenter sélecteur de langue dans header

---

**Dernière mise à jour** : 25 octobre 2025  
**Toutes les routes sont fonctionnelles** ✅
