# 🧪 Suite de Tests - Edgemy

Ce dossier contient tous les tests de l'application Edgemy SaaS.

## 📂 Structure

```
tests/
├── e2e/              # Tests End-to-End (Playwright)
│   ├── helpers/      # Helpers pour les tests E2E
│   ├── auth.spec.ts
│   ├── booking.spec.ts
│   └── coach.spec.ts
├── integration/      # Tests d'intégration API
│   └── api/
│       ├── coach.test.ts
│       └── reservations.test.ts
├── unit/            # Tests unitaires et composants
│   └── components/
│       ├── GlassCard.test.tsx
│       └── BookingModal.test.tsx
├── mocks/           # Mock Service Worker (MSW)
│   ├── handlers.ts
│   └── server.ts
├── setup.ts         # Configuration globale des tests
└── README.md        # Ce fichier
```

## 🚀 Lancer les tests

### Tests unitaires et d'intégration (Vitest)

```bash
# Lancer tous les tests Vitest
pnpm test

# Tests unitaires uniquement
pnpm test:unit

# Tests d'intégration uniquement
pnpm test:integration

# Mode watch (relance automatiquement)
pnpm test:watch

# Avec couverture de code
pnpm test:coverage
```

### Tests E2E (Playwright)

```bash
# Lancer tous les tests E2E
pnpm test:e2e

# Avec UI interactive (recommandé pour le debug)
pnpm test:e2e:ui

# Avec navigateur visible
pnpm test:e2e:headed

# Lancer tous les types de tests
pnpm test:all
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.test` pour les variables spécifiques aux tests :

```env
# Base URL pour les tests
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database de test (séparée de la prod)
DATABASE_URL="postgresql://user:password@localhost:5432/edgemy_test"

# Stripe en mode test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Discord (utiliser un serveur de test)
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
```

### Utilisateurs de test

Les tests E2E utilisent des utilisateurs prédéfinis dans `tests/e2e/helpers/auth.ts` :

- **Joueur** : `player.test@edgemy.com`
- **Coach** : `coach.test@edgemy.com`
- **Admin** : `admin.test@edgemy.com`

⚠️ **Important** : Ces utilisateurs doivent exister dans votre base de données de test.

## 📝 Écrire des tests

### Test E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';

test('Mon nouveau test', async ({ page }) => {
  // Se connecter
  await login(page, TEST_USERS.player);

  // Naviguer
  await page.goto('/fr/coach/john-doe');

  // Interagir
  await page.click('button:has-text("Réserver")');

  // Vérifier
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

### Test de composant (Vitest + Testing Library)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaComponent } from '@/components/MaComponent';

describe('MaComponent', () => {
  it('devrait afficher le titre', () => {
    render(<MaComponent title="Test" />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Test d'API

```typescript
import { describe, it, expect } from 'vitest';

describe('API Endpoint', () => {
  it('devrait retourner 200', async () => {
    const response = await fetch('http://localhost:3000/api/test');

    expect(response.status).toBe(200);
  });
});
```

## 🛠️ Helpers disponibles

### Authentification (`tests/e2e/helpers/auth.ts`)

- `login(page, user)` - Se connecter avec un utilisateur
- `logout(page)` - Se déconnecter
- `signUp(page, data)` - Créer un compte
- `expectToBeLoggedIn(page)` - Vérifier qu'on est connecté

### Paiement Stripe (`tests/e2e/helpers/stripe.ts`)

- `fillStripeCardForm(page, cardType)` - Remplir le formulaire de carte
- `submitStripePayment(page)` - Soumettre le paiement
- `completeStripePayment(page)` - Processus complet
- `handleStripeCheckout(page)` - Gérer la redirection Stripe

## 🎯 Bonnes pratiques

### 1. Tests indépendants
Chaque test doit pouvoir s'exécuter seul sans dépendre d'autres tests.

### 2. Nettoyage
Les données créées durant les tests doivent être nettoyées après.

### 3. Stabilité
Utiliser des `data-testid` pour les sélecteurs plutôt que des classes CSS.

```tsx
<button data-testid="submit-button">Envoyer</button>
```

```typescript
await page.click('[data-testid="submit-button"]');
```

### 4. Timeouts appropriés
Adapter les timeouts selon l'action :
- Navigation : 10-15s
- API call : 5s
- Élément visible : 2-3s

### 5. Mock des services externes
MSW est configuré pour mocker Stripe, Discord, etc. Pas besoin de vraies clés API!

## 🐛 Debugging

### Playwright

```bash
# Mode UI avec debug visuel
pnpm test:e2e:ui

# Ouvrir le dernier rapport HTML
npx playwright show-report

# Lancer un seul fichier
npx playwright test tests/e2e/auth.spec.ts
```

### Vitest

```bash
# Mode watch avec debug
pnpm test:watch

# Debug un seul fichier
pnpm vitest tests/unit/components/GlassCard.test.tsx

# Voir la couverture
pnpm test:coverage
# Ouvrir coverage/index.html dans un navigateur
```

## 📊 Coverage (Couverture)

La couverture de code est générée avec `pnpm test:coverage`.

**Objectifs minimaux :**
- **E2E** : Parcours critiques (auth, réservation, paiement)
- **Intégration** : Toutes les routes API publiques
- **Unitaires** : Composants réutilisables et logique métier

## 🔄 CI/CD

Les tests sont automatiquement lancés sur :
- ✅ Chaque push sur une branche
- ✅ Chaque Pull Request
- ✅ Avant chaque déploiement

Configuration dans `.github/workflows/tests.yml` (à créer).

## 📚 Documentation

- [Playwright](https://playwright.dev)
- [Vitest](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [MSW](https://mswjs.io)

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que le serveur dev tourne (`pnpm dev`)
2. Vérifiez les variables d'environnement
3. Vérifiez que les utilisateurs de test existent
4. Consultez les logs des tests
