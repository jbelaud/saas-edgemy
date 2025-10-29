# Mise à jour Design Dashboard Joueur

## Problème identifié
Les pages du dashboard joueur n'utilisent pas le design system cohérent (GlassCard, GradientText) contrairement au dashboard coach.

## Pages à mettre à jour

1. ✅ `/player/sessions` - En cours (partiellement fait)
2. ⏳ `/player/dashboard` - À faire
3. ⏳ `/player/coaches` - À faire
4. ⏳ `/player/goals` - À faire
5. ⏳ `/player/bankroll` - À faire
6. ⏳ `/player/settings` - À faire
7. ⏳ `/player/workgroup` - À faire

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

## Prochaines étapes

1. Corriger complètement `/player/sessions` (fermeture balises)
2. Appliquer le design aux autres pages une par une
3. Tester responsive sur toutes les pages
4. Commit final avec design unifié

---

**Note**: Le dashboard coach utilise `variant="amber"` (orange), le dashboard joueur utilise `variant="emerald"` (vert) pour différenciation visuelle.
