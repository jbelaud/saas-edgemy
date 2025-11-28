# 🧪 Guide de Test - Edgemy

## 🚀 Démarrage rapide

### 1. Installation (déjà fait ✅)

Les dépendances de test sont déjà installées :
- ✅ Playwright (tests E2E)
- ✅ Vitest (tests unitaires/intégration)
- ✅ Testing Library (tests de composants React)
- ✅ MSW (mock des APIs externes)

### 2. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.test.example .env.test

# Éditer .env.test avec vos valeurs de TEST
```

⚠️ **IMPORTANT** : Utilisez une base de données de TEST séparée, jamais la production !

### 3. Créer les utilisateurs de test

Vous devez créer ces utilisateurs dans votre DB de test :

```sql
-- Joueur
INSERT INTO "User" (email, name) VALUES
  ('player.test@edgemy.com', 'Test Player');

-- Coach
INSERT INTO "User" (email, name) VALUES
  ('coach.test@edgemy.com', 'Test Coach');

-- Admin
INSERT INTO "User" (email, name) VALUES
  ('admin.test@edgemy.com', 'Test Admin');
```

Ou utilisez votre seed de test :
```bash
pnpm db:seed:safe
```

## 📦 Commandes disponibles

### Tests rapides (recommandé pour démarrer)

```bash
# Lancer les tests unitaires uniquement (le plus rapide)
pnpm test:unit

# Lancer tous les tests Vitest (unit + integration)
pnpm test
```

### Tests E2E (tests complets de l'application)

```bash
# Mode UI interactif (RECOMMANDÉ pour débuter)
pnpm test:e2e:ui

# Headless (comme en CI)
pnpm test:e2e

# Avec navigateur visible
pnpm test:e2e:headed
```

### Tests avec couverture

```bash
# Générer le rapport de couverture
pnpm test:coverage

# Ouvrir coverage/index.html pour voir le rapport
```

### Tout lancer

```bash
# Lancer tous les types de tests (unit, integration, e2e)
pnpm test:all
```

## 🎯 Tester manuellement vos fonctionnalités

### Exemple 1 : Tester l'authentification

```bash
# 1. Lancer le serveur dev
pnpm dev

# 2. Dans un autre terminal, lancer les tests d'auth
npx playwright test tests/e2e/auth.spec.ts --headed
```

Vous verrez le navigateur s'ouvrir et exécuter les tests automatiquement !

### Exemple 2 : Tester une réservation

```bash
npx playwright test tests/e2e/booking.spec.ts --ui
```

Le mode `--ui` ouvre une interface visuelle pour :
- ✅ Voir chaque étape du test
- ✅ Débugger visuellement
- ✅ Rejouer les tests

### Exemple 3 : Tester un composant spécifique

```bash
pnpm vitest tests/unit/components/GlassCard.test.tsx --watch
```

Le mode `--watch` relance automatiquement le test quand vous modifiez le code.

## 📝 Créer vos propres tests

### Test E2E simple

Créez `tests/e2e/mon-test.spec.ts` :

```typescript
import { test, expect } from '@playwright/test';

test('Ma nouvelle fonctionnalité', async ({ page }) => {
  await page.goto('/fr');

  await page.click('text=Mon bouton');

  await expect(page.locator('.resultat')).toBeVisible();
});
```

Lancez-le :
```bash
npx playwright test tests/e2e/mon-test.spec.ts --ui
```

### Test de composant simple

Créez `tests/unit/components/MonComposant.test.tsx` :

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonComposant } from '@/components/MonComposant';

describe('MonComposant', () => {
  it('affiche le titre', () => {
    render(<MonComposant titre="Test" />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

Lancez-le :
```bash
pnpm vitest tests/unit/components/MonComposant.test.tsx
```

## 🐛 Debugging

### Playwright bloqué ?

```bash
# Mode debug pas à pas
npx playwright test --debug

# Voir le dernier rapport
npx playwright show-report
```

### Vitest ne trouve pas un module ?

Vérifiez que votre alias `@/` est bien configuré dans `vitest.config.ts` (✅ déjà fait).

### Les tests E2E échouent en timeout ?

```typescript
// Augmenter le timeout pour un test lent
test('Test lent', async ({ page }) => {
  test.setTimeout(60000); // 60 secondes

  await page.goto('/page-lente');
});
```

## 📊 Comprendre les résultats

### ✅ Test réussi
```
✓ tests/e2e/auth.spec.ts:5:7 › Devrait se connecter (2s)
```

### ❌ Test échoué
```
✗ tests/e2e/auth.spec.ts:5:7 › Devrait se connecter (2s)
  Error: Timeout 5000ms exceeded.
```

Ouvrez le rapport HTML pour voir les captures d'écran :
```bash
npx playwright show-report
```

## 🎓 Prochaines étapes

1. **Lancez les tests existants** pour voir comment ça fonctionne
2. **Modifiez un test** pour l'adapter à votre app
3. **Créez vos propres tests** pour vos nouvelles fonctionnalités
4. **Intégrez en CI/CD** (GitHub Actions, GitLab CI, etc.)

## 💡 Conseils

✅ **DO** :
- Tester les parcours utilisateur critiques
- Utiliser `data-testid` pour les sélecteurs
- Lancer les tests avant chaque commit
- Tester sur différents navigateurs (Chrome, Firefox, Safari)

❌ **DON'T** :
- Ne jamais tester sur la base de production
- Ne pas tester avec de vraies clés Stripe/Discord
- Ne pas ignorer les tests qui échouent
- Ne pas oublier de nettoyer les données de test

## 📚 Documentation complète

Pour plus de détails, consultez :
- [`tests/README.md`](./tests/README.md) - Documentation complète
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)

## 🆘 Besoin d'aide ?

Les tests ne passent pas ? Voici le checklist :

- [ ] Le serveur dev tourne (`pnpm dev`)
- [ ] Le fichier `.env.test` existe et est configuré
- [ ] La base de données de test existe
- [ ] Les utilisateurs de test existent
- [ ] Les dépendances sont installées (`pnpm install`)
- [ ] Playwright est installé (`pnpm exec playwright install`)

Si tout est ✅ et que ça ne marche toujours pas, ouvrez un ticket avec :
- Le message d'erreur complet
- La commande utilisée
- Le fichier de test concerné

---

**Prêt à tester ?** Commencez par :
```bash
pnpm test:unit
```

Bon test ! 🚀
