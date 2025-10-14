# Exemples d'utilisation i18n - Edgemy

## 🎯 Guide pratique pour utiliser les traductions

Ce document fournit des exemples concrets d'utilisation de next-intl dans le projet Edgemy.

---

## 📚 Table des matières

1. [Server Components](#server-components)
2. [Client Components](#client-components)
3. [Layouts](#layouts)
4. [Metadata et SEO](#metadata-et-seo)
5. [Navigation](#navigation)
6. [Formulaires](#formulaires)
7. [Messages d'erreur](#messages-derreur)

---

## Server Components

### Exemple basique

```tsx
// src/app/[locale]/(app)/dashboard/page.tsx
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
```

### Avec plusieurs namespaces

```tsx
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('profile');
  
  return (
    <div>
      <h1>{tProfile('title')}</h1>
      {isLoading && <p>{tCommon('loading')}</p>}
    </div>
  );
}
```

---

## Client Components

### Exemple basique

```tsx
// src/components/auth/SignInForm.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function SignInForm() {
  const t = useTranslations('auth.signIn');
  
  return (
    <form>
      <h2>{t('title')}</h2>
      <p>{t('subtitle')}</p>
      <Button type="submit">
        {t('submit')}
      </Button>
    </form>
  );
}
```

### Avec gestion d'état

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  return (
    <div>
      <h3>{t('title')}</h3>
      {status === 'loading' && <p>{t('submitting')}</p>}
      {status === 'success' && <p>{t('success')}</p>}
      {status === 'error' && <p>{t('error')}</p>}
    </div>
  );
}
```

---

## Layouts

### Layout avec traductions

```tsx
// src/app/[locale]/(app)/layout.tsx
import { useTranslations } from 'next-intl';
import { AppHeader } from '@/components/layout/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  
  return (
    <div>
      <AppHeader 
        dashboardLabel={t('dashboard')}
        profileLabel={t('profile')}
      />
      <main>{children}</main>
    </div>
  );
}
```

---

## Metadata et SEO

### Metadata dynamique par locale

```tsx
// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('home.title'),
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
      locale: locale,
    },
  };
}

export default function HomePage() {
  return <div>Home Page</div>;
}
```

### Fichier de traductions pour metadata

```json
// messages/fr.json
{
  "metadata": {
    "home": {
      "title": "Edgemy – Coaching poker : trouvez votre coach idéal",
      "description": "La plateforme qui connecte joueurs et coachs de poker"
    }
  }
}
```

---

## Navigation

### Liens avec locale

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function LocalizedLink({ href, children }: { href: string; children: React.ReactNode }) {
  const locale = useLocale();
  
  return (
    <Link href={`/${locale}${href}`}>
      {children}
    </Link>
  );
}
```

### Changement de langue avec navigation

```tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  const switchLanguage = (newLocale: 'fr' | 'en') => {
    // Remplacer la locale dans le pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname);
  };
  
  return (
    <div>
      <button onClick={() => switchLanguage('fr')}>🇫🇷 FR</button>
      <button onClick={() => switchLanguage('en')}>🇬🇧 EN</button>
    </div>
  );
}
```

---

## Formulaires

### Formulaire avec validation

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export function ContactForm() {
  const t = useTranslations('forms.contact');
  
  // Schema Zod avec traductions
  const schema = z.object({
    email: z.string().email(t('errors.invalidEmail')),
    message: z.string().min(10, t('errors.messageTooShort')),
  });
  
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  return (
    <form>
      <label>{t('fields.email')}</label>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      
      <label>{t('fields.message')}</label>
      <textarea {...form.register('message')} />
      
      <button type="submit">{t('submit')}</button>
    </form>
  );
}
```

### Traductions pour formulaires

```json
// messages/fr.json
{
  "forms": {
    "contact": {
      "fields": {
        "email": "Adresse email",
        "message": "Votre message"
      },
      "errors": {
        "invalidEmail": "Email invalide",
        "messageTooShort": "Le message doit contenir au moins 10 caractères"
      },
      "submit": "Envoyer"
    }
  }
}
```

---

## Messages d'erreur

### Gestion des erreurs API

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function SubscribeForm() {
  const t = useTranslations('subscribe');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/subscribe-simple', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      if (response.status === 409) {
        setError(t('errors.alreadySubscribed'));
      } else if (!response.ok) {
        setError(t('errors.generic'));
      } else {
        setError(null);
        // Success
      }
    } catch (err) {
      setError(t('errors.network'));
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </div>
  );
}
```

### Traductions des erreurs

```json
// messages/fr.json
{
  "subscribe": {
    "errors": {
      "alreadySubscribed": "Cet email est déjà inscrit à notre liste d'attente",
      "generic": "Une erreur est survenue. Veuillez réessayer.",
      "network": "Erreur de connexion. Vérifiez votre connexion internet."
    }
  }
}
```

---

## 🎨 Bonnes pratiques

### 1. Organisation des clés

```json
{
  "namespace": {
    "section": {
      "subsection": "Traduction"
    }
  }
}
```

### 2. Nommage cohérent

- ✅ `auth.signIn.title`
- ✅ `dashboard.stats.totalSessions`
- ❌ `AuthSignInTitle`
- ❌ `dashboard_stats_total_sessions`

### 3. Réutilisation

```tsx
// Créer des composants réutilisables
export function LoadingSpinner() {
  const t = useTranslations('common');
  return <div>{t('loading')}</div>;
}
```

### 4. Fallback

```tsx
// Toujours fournir une valeur par défaut
const title = t('title', { default: 'Default Title' });
```

---

## 🔧 Debugging

### Afficher la locale actuelle

```tsx
'use client';

import { useLocale } from 'next-intl';

export function LocaleDebug() {
  const locale = useLocale();
  return <div>Current locale: {locale}</div>;
}
```

### Vérifier les traductions manquantes

Si une clé n'existe pas, next-intl affichera la clé elle-même :
```
auth.signIn.missingKey → "auth.signIn.missingKey"
```

---

## 📝 Checklist avant déploiement

- [ ] Toutes les clés existent dans `fr.json` et `en.json`
- [ ] Les traductions sont cohérentes et naturelles
- [ ] Les metadata sont traduites pour le SEO
- [ ] Les messages d'erreur sont traduits
- [ ] Les formulaires ont des labels traduits
- [ ] Le LanguageSwitcher fonctionne correctement
- [ ] Les URLs sont correctement préfixées (`/fr/`, `/en/`)
- [ ] Les tests passent dans les 2 langues

---

## 🚀 Prochaines étapes

1. Tester l'application en FR et EN
2. Vérifier le SEO dans les 2 langues
3. Ajouter des traductions pour les emails (Brevo)
4. Préparer l'ajout de DE, IT, ES si nécessaire
