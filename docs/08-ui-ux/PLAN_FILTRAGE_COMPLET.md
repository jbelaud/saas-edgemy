# 🎯 PLAN COMPLET DE RESTRUCTURATION DU SYSTÈME DE FILTRAGE

## 📋 Résumé Exécutif

Le système de filtrage actuel est **incomplet et inadapté**. Il ne reflète que 30% des données disponibles dans les formulaires de création d'annonces. Ce plan décrit la restructuration complète pour créer un **système de filtrage dynamique** aligné à 100% avec les formulaires.

---

## ❌ PROBLÈMES IDENTIFIÉS

### 1. **Filtres Actuels Trop Simplistes**

**Filtres existants :**
- ✅ Langues (OK)
- ⚠️ Formats (trop générique, ne différencie pas strategy/review)
- ⚠️ Types d'annonces (présent mais non exploité)

**Filtres manquants :**
- ❌ **STRATEGY** : variant, ABI, tags
- ❌ **REVIEW** : type de review, support
- ❌ **TOOL** : nom d'outil, objectif
- ❌ **MENTAL** : domaine de focus
- ❌ **Prix** : plages de prix

### 2. **Architecture Inadaptée**

- Filtres statiques au lieu de dynamiques
- Pas de changement de filtres selon le type d'annonce sélectionné
- Constantes dispersées et incomplètes
- Aucune source unique de vérité

### 3. **Incohérence avec les Formulaires**

Les formulaires de création d'annonces utilisent des valeurs spécifiques que le système de filtrage **ignore complètement**.

---

## ✅ SOLUTION : SYSTÈME DE FILTRAGE DYNAMIQUE

### Architecture Proposée

```
┌─────────────────────────────────────────────────┐
│  1. L'utilisateur sélectionne un TYPE           │
│     ☑ Stratégie                                 │
│     ☐ Review                                    │
│     ☐ Outil                                     │
│     ☐ Mental                                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Les filtres changent DYNAMIQUEMENT          │
│                                                  │
│  SI "Stratégie" :                               │
│    • Variante (NLHE, PLO, etc.)                 │
│    • Format (MTT, Cash, etc.)                   │
│    • ABI / Buy-in moyen                         │
│    • Tags (ICM, GTO, etc.)                      │
│                                                  │
│  SI "Review" :                                  │
│    • Type de review (Session MTT, Main, etc.)   │
│    • Format (NLHE, PLO, etc.)                   │
│    • Support (Replay vidéo, etc.)               │
│                                                  │
│  SI "Outil" :                                   │
│    • Nom de l'outil (GTO Wizard, HM3, etc.)     │
│    • Objectif (Prise en main, etc.)             │
│                                                  │
│  SI "Mental" :                                  │
│    • Focus (Gestion du tilt, etc.)              │
│                                                  │
│  COMMUNS À TOUS :                               │
│    • Langues                                    │
│    • Plage de prix                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Résultats filtrés                           │
│     Affiche uniquement les coachs ayant des     │
│     annonces qui correspondent aux filtres      │
└─────────────────────────────────────────────────┘
```

---

## 📦 FICHIERS CRÉÉS

### 1. **[src/constants/announcements.ts](src/constants/announcements.ts)** ✅ CRÉÉ

**Rôle** : Source unique de vérité pour TOUTES les valeurs filtrables.

**Contenu** :
- `ANNOUNCEMENT_TYPES` : Les 4 types d'annonces
- `STRATEGY_VARIANTS` : Variantes pour stratégie (NLHE, PLO, PLO5, MIXED)
- `STRATEGY_FORMATS` : Formats pour stratégie (MTT, Cash, SNG, Spin)
- `STRATEGY_COMMON_TAGS` : Tags prédéfinis
- `REVIEW_TYPES` : Types de review (Session MTT, Main spécifique, etc.)
- `REVIEW_FORMATS` : Variantes pour review
- `REVIEW_SUPPORTS` : Supports (Replay vidéo, Partage d'écran, etc.)
- `TOOL_NAMES` : Noms d'outils (GTO Wizard, HM3, etc.)
- `TOOL_OBJECTIVES` : Objectifs (Prise en main, Optimisation avancée, etc.)
- `MENTAL_FOCUS_AREAS` : Domaines de focus mental
- `SUPPORTED_LANGUAGES` : Langues

**Helpers** :
- `getAnnouncementTypeLabel()`, `getStrategyVariantLabel()`, etc.
- Types TypeScript pour la sécurité de type

### 2. **[src/lib/announcementFilters.ts](src/lib/announcementFilters.ts)** ✅ CRÉÉ

**Rôle** : Logique de filtrage dynamique.

**Fonctions principales** :

```typescript
// Extraire les filtres disponibles depuis les données
extractDynamicFilters(coaches: CoachWithAnnouncements[]): DynamicFilters

// Normaliser les données
normalizeCoachAnnouncements(coach: CoachWithAnnouncements): CoachWithAnnouncements

// Filtrer les coachs
filterCoaches(coaches: CoachWithAnnouncements[], filters: ActiveFilters): CoachWithAnnouncements[]
```

**Fonctionnalités** :
- ✅ Extraction automatique des valeurs de filtres depuis les annonces réelles
- ✅ Validation contre les constantes canoniques
- ✅ Filtrage intelligent par type d'annonce
- ✅ Génération automatique de plages de prix

---

## 🔧 FICHIERS À MODIFIER

### 3. **src/app/api/coach/explore/route.ts** ⏳ À FAIRE

**Modifications nécessaires** :

```typescript
// AVANT
select: {
  id: true,
  firstName: true,
  // ...
  announcements: {
    where: { isActive: true },
    select: {
      id: true,
      type: true,
      // MANQUE TOUS LES CHAMPS SPÉCIFIQUES
    }
  }
}

// APRÈS
select: {
  id: true,
  firstName: true,
  // ...
  announcements: {
    where: { isActive: true },
    select: {
      id: true,
      type: true,
      priceCents: true,
      durationMin: true,
      // STRATEGY
      variant: true,
      format: true,
      abiRange: true,
      tags: true,
      // REVIEW
      reviewType: true,
      reviewSupport: true,
      // TOOL
      toolName: true,
      toolObjective: true,
      // MENTAL
      mentalFocus: true,
    }
  }
}
```

**Normalisation** :
```typescript
import { normalizeCoachAnnouncements } from '@/lib/announcementFilters';

const normalizedCoaches = coaches.map(normalizeCoachAnnouncements);
return NextResponse.json({ coaches: normalizedCoaches });
```

### 4. **src/app/[locale]/(app)/coachs/pageClient.tsx** ⏳ À FAIRE

**Refactorisation complète** :

**État à ajouter** :
```typescript
const [selectedAnnouncementType, setSelectedAnnouncementType] = useState<string>('');
const [selectedStrategyVariants, setSelectedStrategyVariants] = useState<string[]>([]);
const [selectedStrategyFormats, setSelectedStrategyFormats] = useState<string[]>([]);
const [selectedAbiRanges, setSelectedAbiRanges] = useState<string[]>([]);
const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
const [selectedReviewFormats, setSelectedReviewFormats] = useState<string[]>([]);
const [selectedReviewSupports, setSelectedReviewSupports] = useState<string[]>([]);
const [selectedToolNames, setSelectedToolNames] = useState<string[]>([]);
const [selectedToolObjectives, setSelectedToolObjectives] = useState<string[]>([]);
const [selectedMentalFocusAreas, setSelectedMentalFocusAreas] = useState<string[]>([]);
const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
```

**Extraction des filtres** :
```typescript
const dynamicFilters = useMemo(() => {
  return extractDynamicFilters(coaches);
}, [coaches]);
```

**Filtrage** :
```typescript
const filteredCoaches = useMemo(() => {
  return filterCoaches(coaches, {
    search,
    selectedAnnouncementType,
    selectedStrategyVariants,
    selectedStrategyFormats,
    selectedAbiRanges,
    selectedReviewTypes,
    selectedReviewFormats,
    selectedReviewSupports,
    selectedToolNames,
    selectedToolObjectives,
    selectedMentalFocusAreas,
    selectedLanguages,
    selectedPriceRange,
  });
}, [coaches, search, selectedAnnouncementType, /* ... tous les autres filtres */]);
```

**UI des filtres** :

```tsx
{/* 1. FILTRE PAR TYPE (toujours visible) */}
<div className="mb-8">
  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
    Type d'annonce
  </p>
  <div className="flex flex-wrap gap-3">
    {dynamicFilters.announcementTypes.map((type) => (
      <Button
        key={type.value}
        onClick={() => setSelectedAnnouncementType(
          selectedAnnouncementType === type.value ? '' : type.value
        )}
        className={/* active/inactive styles */}
      >
        {type.label}
      </Button>
    ))}
  </div>
</div>

{/* 2. FILTRES STRATEGY (visible si selectedAnnouncementType === 'STRATEGY') */}
{selectedAnnouncementType === 'STRATEGY' && (
  <>
    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Variante
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.strategyVariants.map((variant) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>

    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Format
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.strategyFormats.map((format) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>

    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        ABI / Buy-in moyen
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.abiRanges.map((abi) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>
  </>
)}

{/* 3. FILTRES REVIEW (visible si selectedAnnouncementType === 'REVIEW') */}
{selectedAnnouncementType === 'REVIEW' && (
  <>
    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Type de review
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.reviewTypes.map((type) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>

    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Format
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.reviewFormats.map((format) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>

    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Support
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.reviewSupports.map((support) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>
  </>
)}

{/* 4. FILTRES TOOL (visible si selectedAnnouncementType === 'TOOL') */}
{selectedAnnouncementType === 'TOOL' && (
  <>
    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Nom de l'outil
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.toolNames.map((tool) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>

    <div className="mt-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Objectif
      </p>
      <div className="flex flex-wrap gap-3">
        {dynamicFilters.toolObjectives.map((objective) => (
          <Button /* ... */ />
        ))}
      </div>
    </div>
  </>
)}

{/* 5. FILTRES MENTAL (visible si selectedAnnouncementType === 'MENTAL') */}
{selectedAnnouncementType === 'MENTAL' && (
  <div className="mt-8">
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
      Domaine de focus
    </p>
    <div className="flex flex-wrap gap-3">
      {dynamicFilters.mentalFocusAreas.map((focus) => (
        <Button /* ... */ />
      ))}
    </div>
  </div>
)}

{/* 6. FILTRES COMMUNS (toujours visibles) */}
<div className="mt-8">
  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
    Langues
  </p>
  <div className="flex flex-wrap gap-3">
    {dynamicFilters.languages.map((lang) => (
      <Button /* ... */ />
    ))}
  </div>
</div>

<div className="mt-8">
  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
    Plage de prix
  </p>
  <div className="flex flex-wrap gap-3">
    {dynamicFilters.priceRanges.map((range) => (
      <Button /* ... */ />
    ))}
  </div>
</div>
```

---

## 🎨 EXEMPLE D'UTILISATION

### Scénario 1 : Utilisateur cherche un coach de stratégie MTT

```
1. Sélectionne "Stratégie"
   → Les filtres STRATEGY apparaissent

2. Sélectionne "MTT" dans Format
   → Affiche uniquement les coachs avec des annonces Strategy + MTT

3. Sélectionne "NLHE" dans Variante
   → Affine encore : Strategy + MTT + NLHE

4. Sélectionne "50€ - 100€" dans Prix
   → Résultat final : coachs avec annonces Strategy/MTT/NLHE entre 50-100€
```

### Scénario 2 : Utilisateur cherche un coach de review

```
1. Sélectionne "Review"
   → Les filtres REVIEW apparaissent (les filtres STRATEGY disparaissent)

2. Sélectionne "Session MTT" dans Type de review
   → Affiche les coachs avec des reviews de session MTT

3. Sélectionne "Replay vidéo" dans Support
   → Affine : Review + Session MTT + Replay vidéo
```

---

## 📊 MAPPING COMPLET DES FILTRES

### TYPE : STRATEGY

| Champ BDD     | Formulaire          | Options                                        |
|---------------|---------------------|------------------------------------------------|
| `variant`     | Variante *          | NLHE, PLO, PLO5, MIXED                         |
| `format`      | Format *            | MTT, CASH_GAME, SNG, SPIN                      |
| `abiRange`    | ABI / Buy-in moyen  | Texte libre (ex: "20-25€")                     |
| `tags`        | Tags                | ICM, 3-bet pot, Postflop, Preflop, GTO, etc.   |
| `priceCents`  | Prix (€) *          | Nombre entier 0-9999                           |
| `durationMin` | Durée *             | 30, 60, 90, 120 (minutes)                      |

### TYPE : REVIEW

| Champ BDD       | Formulaire         | Options                                           |
|-----------------|--------------------|---------------------------------------------------|
| `reviewType`    | Type de review *   | SESSION_MTT, SESSION_CASH, HAND_SPECIFIC, DATABASE |
| `format`        | Format *           | NLHE, PLO, PLO5, MIXED                            |
| `reviewSupport` | Support *          | VIDEO_REPLAY, SCREEN_SHARE, HAND_IMPORT, SOFTWARE |
| `priceCents`    | Prix (€) *         | Nombre entier 0-9999                              |
| `durationMin`   | Durée *            | 60, 90, 120 (minutes)                             |

### TYPE : TOOL

| Champ BDD        | Formulaire        | Options                                           |
|------------------|-------------------|---------------------------------------------------|
| `toolName`       | Nom de l'outil *  | GTO_WIZARD, HM3, PT4, PIOSOLVER, etc.             |
| `toolObjective`  | Objectif *        | ONBOARDING, ADVANCED, SPOT_ANALYSIS               |
| `priceCents`     | Prix (€) *        | Nombre entier 0-9999                              |
| `durationMin`    | Durée *           | 60, 90, 120 (minutes)                             |

### TYPE : MENTAL

| Champ BDD      | Formulaire       | Options                                                |
|----------------|------------------|--------------------------------------------------------|
| `mentalFocus`  | Focus principal *| TILT_MANAGEMENT, CONFIDENCE, CONCENTRATION, etc.       |
| `priceCents`   | Prix (€) *       | Nombre entier 0-9999                                   |
| `durationMin`  | Durée *          | 30, 60, 90, 120 (minutes)                              |

---

## ✅ AVANTAGES DU NOUVEAU SYSTÈME

1. **🎯 100% Aligné avec les Formulaires**
   - Chaque option de filtre correspond exactement aux choix disponibles dans les formulaires
   - Aucune valeur fantôme ou obsolète

2. **📱 Filtres Dynamiques**
   - L'interface s'adapte selon le type d'annonce sélectionné
   - Pas de filtres inutiles affichés

3. **🔒 Source Unique de Vérité**
   - Toutes les valeurs viennent de `src/constants/announcements.ts`
   - Modification centralisée et propagation automatique

4. **🛡️ Validation Stricte**
   - Seules les valeurs canoniques sont acceptées
   - Données invalides automatiquement filtrées

5. **🚀 Extensible**
   - Ajouter un nouveau type d'annonce = ajouter les constantes + le cas dans le switch
   - Pas besoin de modifier la logique de filtrage

6. **💎 Type-Safe**
   - Types TypeScript générés automatiquement
   - Autocomplétion et détection d'erreurs au moment du développement

---

## 🚀 ÉTAPES DE MISE EN ŒUVRE

### Phase 1 : Préparation ✅ TERMINÉE
- ✅ Analyse des formulaires
- ✅ Création de `src/constants/announcements.ts`
- ✅ Création de `src/lib/announcementFilters.ts`

### Phase 2 : Backend ⏳ EN COURS
- ⏳ Modifier `src/app/api/coach/explore/route.ts`
  - Ajouter tous les champs d'annonce dans le `select`
  - Appliquer la normalisation avec `normalizeCoachAnnouncements()`

### Phase 3 : Frontend ⏳ EN ATTENTE
- ⏳ Refactorer `src/app/[locale]/(app)/coachs/pageClient.tsx`
  - Ajouter tous les états de filtres
  - Implémenter les filtres dynamiques
  - Utiliser `extractDynamicFilters()` et `filterCoaches()`

### Phase 4 : Nettoyage ⏳ EN ATTENTE
- ⏳ Supprimer `src/components/player/coaches/PlayerExploreCoaches.tsx` (non utilisé)
- ⏳ Mettre à jour `src/lib/coachFilters.ts` (ancien système, à remplacer)
- ⏳ Mettre à jour `src/constants/poker.ts` (garder uniquement les langues)

### Phase 5 : Documentation & Tests ⏳ EN ATTENTE
- ⏳ Mettre à jour `FILTERING_SYSTEM.md`
- ⏳ Créer des tests unitaires pour les filtres
- ⏳ Tests manuels de tous les scénarios

---

## 📝 NOTES IMPORTANTES

### Compatibilité Ascendante

Les anciennes valeurs dans la base de données seront **automatiquement normalisées** :
- Si une annonce a un format invalide, elle sera exclue des filtres
- Les coachs restent visibles mais leurs annonces invalides ne sont pas filtrables

### Gestion des Erreurs

- ✅ Valeurs invalides → Ignorées (console.warn)
- ✅ Champs manquants → Traités comme null
- ✅ Types inconnus → Conservés mais signalés

### Performance

- ✅ Extraction de filtres en `useMemo` (recalcul uniquement si coaches changent)
- ✅ Filtrage en `useMemo` (recalcul uniquement si filtres ou coaches changent)
- ✅ Pas de requêtes supplémentaires, tout est côté client

---

## 🎓 COMMENT ÉTENDRE LE SYSTÈME

### Ajouter un Nouveau Type d'Annonce

**Exemple : Ajouter "PACK" (offre de coaching en pack)**

1. **Ajouter les constantes** dans `src/constants/announcements.ts` :
```typescript
export const PACK_DURATIONS = [
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'MONTHLY', label: 'Mensuel' },
] as const;

export const PACK_INTENSITIES = [
  { value: 'LIGHT', label: 'Léger (2h/semaine)' },
  { value: 'INTENSIVE', label: 'Intensif (5h/semaine)' },
] as const;
```

2. **Ajouter le case** dans `extractDynamicFilters()` :
```typescript
case 'PACK':
  if (announcement.packDuration) packDurations.add(announcement.packDuration);
  if (announcement.packIntensity) packIntensities.add(announcement.packIntensity);
  break;
```

3. **Ajouter les filtres** dans l'interface UI :
```tsx
{selectedAnnouncementType === 'PACK' && (
  <div className="mt-8">
    <p>Durée du pack</p>
    {dynamicFilters.packDurations.map(/* ... */)}
  </div>
)}
```

C'est tout ! Le reste s'adapte automatiquement.

---

## 🎯 RÉSULTAT ATTENDU

### Avant
- Filtres basiques : Langues, Formats (générique), Types
- 70% des données non exploitées
- Impossible de filtrer précisément
- Incohérence avec les formulaires

### Après
- Filtres dynamiques selon le type d'annonce
- 100% des données filtrables
- Alignement parfait avec les formulaires
- Expérience utilisateur fluide et intuitive
- Système extensible et maintenable

---

## 📞 SUPPORT

Pour toute question sur cette architecture :
- Documentation des constantes : `src/constants/announcements.ts`
- Documentation du filtrage : `src/lib/announcementFilters.ts`
- Ce document : `PLAN_FILTRAGE_COMPLET.md`

**Principe fondamental** : Toute valeur de filtre DOIT exister dans `src/constants/announcements.ts`. Aucune exception.
