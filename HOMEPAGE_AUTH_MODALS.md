# Système d'authentification Homepage - Modales

## ✅ Implémentation complète

Le `LandingHeader` utilise maintenant le même système de modales que l'ancien `AppHeader` pour une expérience utilisateur cohérente.

## 🎯 Logique des CTAs

### Header Desktop & Mobile

**2 CTAs principaux** :
1. **"Se connecter"** (Button ghost) → Ouvre `LoginModal` avec contexte `player`
2. **"Devenir Coach"** (Button amber gradient) → Ouvre `CoachSignUpModal`

## 🔄 Flux d'authentification

### Flux Joueur (Player)

1. Clic **"Se connecter"** → `LoginModal` s'ouvre (contexte: `player`)
2. Options dans la modale :
   - Connexion email/password
   - Connexion Google
   - Lien "S'inscrire" → Redirige vers `/signup?context=player`
3. Après connexion → Redirection automatique vers dashboard approprié

### Flux Coach

1. Clic **"Devenir Coach"** → `CoachSignUpModal` s'ouvre
2. Options dans la modale :
   - Inscription email/password
   - Inscription Google
   - Lien "Se connecter" → Ferme modal coach, ouvre `LoginModal` (contexte: `coach`)
3. Après inscription :
   - Rôle `COACH` + Status `INACTIVE` créés
   - Redirection → `/coach/dashboard`
   - Dashboard affiche CTA "Activer mon abonnement"

### Flux croisés (Switch entre modales)

**De LoginModal vers inscription** :
- Si contexte `coach` → Ouvre `CoachSignUpModal`
- Si contexte `player` → Redirige vers `/signup?context=player`

**De CoachSignUpModal vers connexion** :
- Ferme modal inscription
- Ouvre `LoginModal` avec contexte `coach`

## 🧩 Composants utilisés

### LandingHeader
```tsx
const [showLoginModal, setShowLoginModal] = useState(false);
const [showCoachSignUpModal, setShowCoachSignUpModal] = useState(false);
const [signupContext, setSignupContext] = useState<'coach' | 'player'>('player');
```

### LoginModal
```tsx
<LoginModal 
  open={showLoginModal} 
  onOpenChange={setShowLoginModal}
  context={signupContext}
  onSwitchToSignup={() => {
    // Logique de switch vers inscription
  }}
/>
```

### CoachSignUpModal
```tsx
<CoachSignUpModal 
  open={showCoachSignUpModal} 
  onOpenChange={setShowCoachSignUpModal}
  onSwitchToLogin={() => {
    // Logique de switch vers connexion
  }}
/>
```

## 🎨 Design des CTAs

### Desktop
- **Se connecter** : Button ghost, texte gray-300, hover white
- **Devenir Coach** : Gradient amber, texte slate-950, shadow glow, hover scale

### Mobile
- Même logique dans le menu hamburger
- Boutons full-width pour meilleure UX mobile
- Fermeture automatique du menu après clic

## 📱 Responsive

- **Desktop (lg+)** : CTAs dans header, navigation complète
- **Mobile (< lg)** : Menu hamburger avec navigation + CTAs en bas

## 🔐 Sécurité & UX

- ✅ Contexte intelligent (player/coach) maintenu entre modales
- ✅ Pas de redirection brutale, tout en modales
- ✅ Switch fluide entre connexion et inscription
- ✅ Fermeture automatique après action réussie
- ✅ Gestion d'erreurs dans chaque modale

## 🆚 Différence avec l'ancien système

### Avant (liens directs)
```tsx
<Link href="/signin">Se connecter</Link>
<Link href="/signup">Créer un compte</Link>
```

### Maintenant (modales)
```tsx
<Button onClick={() => setShowLoginModal(true)}>Se connecter</Button>
<Button onClick={() => setShowCoachSignUpModal(true)}>Devenir Coach</Button>
```

## ✨ Avantages

1. **UX améliorée** : Pas de changement de page, tout en overlay
2. **Contexte préservé** : L'utilisateur reste sur la homepage
3. **Conversion optimisée** : Moins de friction dans le parcours
4. **Cohérence** : Même système que `AppHeader`
5. **Mobile-friendly** : Modales adaptées aux petits écrans

## 🎯 Statuts Coach

Après inscription via `CoachSignUpModal` :

- **Status INACTIVE** : Profil créé, pas d'abonnement
  - Dashboard affiche card orange "Activer mon abonnement"
  - Profil public désactivé (grisé)
  - Redirection vers `/coach/onboarding` pour paiement

- **Status ACTIVE** : Après paiement abonnement
  - Accès complet aux fonctionnalités
  - Profil public visible sur `/coachs`
  - Peut recevoir des réservations

## 📝 Notes techniques

- Les modales utilisent `Dialog` de shadcn/ui
- Gestion d'état locale avec `useState`
- Locale injectée via `useLocale()` de next-intl
- Callbacks `onSwitchToSignup` et `onSwitchToLogin` pour navigation inter-modales

## 🚀 Prochaines étapes

1. ✅ Modales implémentées dans LandingHeader
2. ⏳ Tester flux complet joueur/coach
3. ⏳ Vérifier redirections après auth
4. ⏳ Ajouter analytics sur ouverture modales
5. ⏳ A/B testing sur wording CTAs

---

**Dernière mise à jour** : 25 octobre 2025  
**Système d'authentification par modales opérationnel** ✅
