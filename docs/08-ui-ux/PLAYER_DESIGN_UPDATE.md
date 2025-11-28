# Mise à jour Design Dashboard Joueur

## ✅ COMPLÉTÉ

Toutes les pages du dashboard joueur utilisent maintenant le design system cohérent (GlassCard, GradientText).

## Pages mises à jour

1. ✅ `/player/sessions` - Complété
2. ✅ `/player/dashboard` - Complété
3. ✅ `/player/coaches` - Complété
4. ✅ `/player/goals` - Complété
5. ✅ `/player/bankroll` - Complété
6. ✅ `/player/settings` - Complété
7. ✅ `/player/workgroup` - Complété

## Design System à appliquer

### Imports nécessaires
```typescript
import { GlassCard, GradientText } from '@/components/ui';
```

### Titres de page
```typescript
<h1 className="text-4xl font-bold mb-2">
  <GradientText variant="emerald">Titre de la Page</GradientText>
</h1>
<p className="text-gray-400 text-lg">
  Description de la page
</p>
```

### Cartes
- Remplacer `bg-white shadow rounded-lg` par `<GlassCard>`
- Couleurs texte : `text-gray-900` → `text-white`
- Couleurs secondaires : `text-gray-600` → `text-gray-300/400`

### Couleurs thème joueur
- Primary: `emerald` (vert)
- Accents: `blue`, `purple`
- États: `green` (success), `yellow` (warning), `red` (error)

### Badges et statuts
```typescript
// Avant
className="bg-green-100 text-green-700"

// Après
className="bg-green-500/20 text-green-400 border border-green-500/30"
```

### Loading states
```typescript
<Loader2 className="h-8 w-8 animate-spin text-primary" />
```

## Changements appliqués

### Tous les titres de page
- `text-3xl font-bold text-gray-900` → `text-4xl font-bold mb-2` avec `<GradientText variant="emerald">`
- `text-gray-600` → `text-gray-400 text-lg` pour les descriptions

### Toutes les cartes
- `Card` / `bg-white shadow rounded-lg` → `<GlassCard>`
- `text-gray-900` → `text-white`
- `text-gray-600` → `text-gray-300/400`

### Spinners de chargement
- `text-emerald-600` → `text-primary`

### Badges et statuts
- `bg-green-100 text-green-700` → `bg-green-500/20 text-green-400 border border-green-500/30`
- `bg-blue-100 text-blue-700` → `bg-blue-500/20 text-blue-400 border border-blue-500/30`

### Boutons CTA
- `Button` avec classes custom → `<GradientButton variant="emerald">`

## Commits effectués

1. ✅ `fix: ajout locale dans redirections BookingModal`
2. ✅ `feat: mise a jour design page player/sessions avec GlassCard et GradientText`
3. ✅ `feat: mise a jour design complet dashboard joueur avec GlassCard et GradientText`

---

**Note**: Le dashboard coach utilise `variant="amber"` (orange), le dashboard joueur utilise `variant="emerald"` (vert) pour différenciation visuelle claire entre les deux rôles.
