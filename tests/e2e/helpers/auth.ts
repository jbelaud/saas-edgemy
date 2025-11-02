import { Page } from '@playwright/test';

/**
 * Helper pour l'authentification dans les tests E2E
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'PLAYER' | 'COACH' | 'ADMIN';
}

// Utilisateurs de test E2E (créés par prisma/seed-e2e-users-api.ts)
export const TEST_USERS = {
  player: {
    email: 'e2e-player@edgemy.test',
    password: 'TestE2E@2024!',
    role: 'PLAYER' as const,
  },
  coach: {
    email: 'e2e-coach@edgemy.test',
    password: 'TestE2E@2024!',
    role: 'COACH' as const,
  },
  admin: {
    email: 'e2e-admin@edgemy.test',
    password: 'TestE2E@2024!',
    role: 'ADMIN' as const,
  },
};

/**
 * Se connecte avec un utilisateur de test
 */
export async function login(page: Page, user: TestUser) {
  // Utiliser la page de test login
  await page.goto('/fr/test/login', { waitUntil: 'networkidle' });

  // Attendre que le formulaire soit visible et interactif
  await page.waitForSelector('[data-testid="login-form"]', {
    timeout: 10000,
    state: 'visible'
  });

  // Attendre que les champs soient vraiment interactifs (pas seulement visibles)
  await page.waitForSelector('[data-testid="email-input"]:not([disabled])', {
    timeout: 5000,
    state: 'visible'
  });
  await page.waitForSelector('[data-testid="password-input"]:not([disabled])', {
    timeout: 5000,
    state: 'visible'
  });

  // Petit délai pour laisser Next.js terminer l'hydration
  await page.waitForTimeout(500);

  // Remplir le formulaire de connexion (utilise data-testid)
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);

  // Attendre que le bouton soit cliquable
  await page.waitForSelector('[data-testid="submit-button"]:not([disabled])', {
    timeout: 5000,
    state: 'visible'
  });

  // Cliquer sur le bouton de connexion
  await page.click('[data-testid="submit-button"]');

  // Attendre la redirection après connexion (plus tolérant sur l'URL)
  await page.waitForURL(/\/(fr|en)\//, { timeout: 15000 });
}

/**
 * Se déconnecte
 */
export async function logout(page: Page) {
  // Chercher le bouton de déconnexion (adapter selon votre UI)
  const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout")');

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/\/(fr|en)/, { timeout: 5000 });
  }
}

/**
 * Vérifie qu'un utilisateur est connecté
 */
export async function expectToBeLoggedIn(page: Page) {
  // Vérifier qu'on n'est pas sur la page de connexion
  const currentUrl = page.url();
  if (currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up')) {
    throw new Error('User should be logged in but is on auth page');
  }
}

/**
 * Crée un nouvel utilisateur (inscription)
 */
export async function signUp(
  page: Page,
  data: {
    email: string;
    password: string;
    name: string;
  }
) {
  await page.goto('/fr/signup');

  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="name"]', data.name);

  await page.click('button[type="submit"]');

  // Attendre la redirection
  await page.waitForURL(/\/(fr|en)\//, { timeout: 10000 });
}
