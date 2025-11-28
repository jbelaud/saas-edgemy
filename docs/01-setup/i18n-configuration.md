# Configuration i18n - Edgemy

## Vue d'ensemble

Le projet Edgemy utilise **next-intl** pour l'internationalisation avec support de **2 langues** :
- 🇫🇷 **Français (fr)** - Langue par défaut
- 🇬🇧 **Anglais (en)**

## Structure des fichiers

```
saas-edgemy/
├── messages/
│   ├── fr.json          # Traductions françaises
│   └── en.json          # Traductions anglaises
├── src/
│   ├── i18n/
│   │   ├── routing.ts   # Configuration des locales
│   │   └── request.ts   # Configuration next-intl
│   ├── app/
│   │   └── [locale]/    # Routes internationalisées
│   │       └── layout.tsx
│   └── contexts/
│       └── LanguageContext.tsx  # Context React pour la langue
├── middleware.ts        # Middleware next-intl + sous-domaines
└── next.config.ts       # Configuration Next.js avec next-intl
```

## Configuration

### 1. Routing (`src/i18n/routing.ts`)

```typescript
import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})
```

### 2. Next.js Config (`next.config.ts`)

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
```

### 3. Middleware (`middleware.ts`)

Le middleware gère :
- ✅ Routing i18n automatique (fr/en)
- ✅ Sous-domaines (app.edgemy.fr)
- ✅ Protection des routes /app en production

### 4. Layout locale (`src/app/[locale]/layout.tsx`)

Fournit le contexte next-intl à toute l'application.

## Utilisation

### Dans les Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('home');
  
  return <h1>{t('title')}</h1>;
}
```

### Dans les Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  
  return <p>{t('loading')}</p>;
}
```

### Avec le LanguageContext (système existant)

```tsx
'use client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Component() {
  const { t, language, setLanguage } = useLanguage();
  
  return <p>{t('home.title')}</p>;
}
```

## Structure des traductions

Les fichiers JSON suivent une structure hiérarchique :

```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue"
  },
  "home": {
    "title": "Bienvenue sur Edgemy",
    "subtitle": "La plateforme de coaching poker"
  },
  "auth": {
    "signUp": {
      "title": "Devenir Coach Edgemy",
      "email": "Email"
    }
  }
}
```

## Routes

Les URLs sont préfixées par la locale :

- 🇫🇷 `https://edgemy.fr/fr` → Page d'accueil française
- 🇬🇧 `https://edgemy.fr/en` → Page d'accueil anglaise
- 🇫🇷 `https://app.edgemy.fr/fr/dashboard` → Dashboard français
- 🇬🇧 `https://app.edgemy.fr/en/dashboard` → Dashboard anglais

## Changement de langue

Le composant `LanguageSwitcher` permet de changer de langue :

```tsx
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

<LanguageSwitcher />
```

## Ajout de nouvelles traductions

1. Ajouter les clés dans `messages/fr.json`
2. Ajouter les traductions correspondantes dans `messages/en.json`
3. Utiliser `useTranslations()` ou `t()` pour accéder aux traductions

## Migration vers d'autres langues (futur)

Pour ajouter DE, IT, ES :

1. Créer les fichiers `messages/de.json`, `messages/it.json`, `messages/es.json`
2. Mettre à jour `src/i18n/routing.ts` :
   ```typescript
   locales: ['fr', 'en', 'de', 'it', 'es']
   ```
3. Mettre à jour le middleware pour supporter les nouvelles locales
4. Mettre à jour `LanguageSwitcher` pour afficher les nouvelles langues

## Notes importantes

- ⚠️ Toujours tester les traductions dans les 2 langues
- ⚠️ Le français est la langue par défaut (règle métier)
- ⚠️ Les routes API ne sont pas internationalisées
- ⚠️ Les emails Brevo peuvent être internationalisés séparément
