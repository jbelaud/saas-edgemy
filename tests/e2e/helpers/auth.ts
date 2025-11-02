import { Page } from '@playwright/test';

/**
 * Helper pour l'authentification dans les tests E2E
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'PLAYER' | 'COACH' | 'ADMIN';
}

// Utilisateurs de test (à créer dans votre DB de test)
export const TEST_USERS = {
  player: {
    email: 'player.test@edgemy.com',
    password: 'TestPassword123!',
    role: 'PLAYER' as const,
  },
  coach: {
    email: 'coach.test@edgemy.com',
    password: 'TestPassword123!',
    role: 'COACH' as const,
  },
  admin: {
    email: 'admin.test@edgemy.com',
    password: 'TestPassword123!',
    role: 'ADMIN' as const,
  },
};

/**
 * Se connecte avec un utilisateur de test
 */
export async function login(page: Page, user: TestUser) {
  await page.goto('/fr/sign-in');

  // Remplir le formulaire de connexion
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  // Cliquer sur le bouton de connexion
  await page.click('button[type="submit"]');

  // Attendre la redirection après connexion
  await page.waitForURL(/\/(fr|en)\/(player|coach|admin)/, { timeout: 10000 });
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
