import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from './helpers/auth';

test.describe('Authentification', () => {
  test('Devrait afficher la page de connexion', async ({ page }) => {
    await page.goto('/fr/test/login', { waitUntil: 'networkidle' });

    // Attendre que la page soit chargée
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });

    // Vérifier que le formulaire de connexion est présent
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
  });

  test('Devrait se connecter en tant que joueur', async ({ page }) => {
    await login(page, TEST_USERS.player);

    // Vérifier qu'on est bien sur le dashboard joueur (avec timeout augmenté)
    await expect(page).toHaveURL(/\/(fr|en)\/player/, { timeout: 20000 });

    // Vérifier qu'on voit du contenu authentifié
    await expect(page.locator('text=/dashboard|tableau de bord/i')).toBeVisible();
  });

  test('Devrait se connecter en tant que coach', async ({ page }) => {
    await login(page, TEST_USERS.coach);

    // Vérifier qu'on est bien sur le dashboard coach (avec timeout augmenté)
    await expect(page).toHaveURL(/\/(fr|en)\/coach/, { timeout: 20000 });

    // Vérifier qu'on voit du contenu coach
    await expect(page.locator('text=/dashboard|tableau de bord/i')).toBeVisible();
  });

  test('Devrait se connecter en tant qu\'admin', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Vérifier qu'on est bien sur le dashboard admin (avec timeout augmenté)
    await expect(page).toHaveURL(/\/(fr|en)\/admin/, { timeout: 20000 });

    // Vérifier qu'on voit du contenu admin
    await expect(page.locator('text=/dashboard|tableau de bord/i')).toBeVisible();
  });

  test('Devrait se déconnecter correctement', async ({ page }) => {
    // Se connecter d'abord
    await login(page, TEST_USERS.player);

    // Se déconnecter
    await logout(page);

    // Vérifier qu'on est redirigé vers la page d'accueil ou de connexion
    await expect(page).toHaveURL(/\/(fr|en)(\/sign-in)?/);
  });

  test('Devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/fr/test/login', { waitUntil: 'networkidle' });

    // Attendre que le formulaire soit prêt
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="submit-button"]');

    // Attendre que le bouton repasse en état "Se connecter" (loading terminé)
    await page.waitForSelector('[data-testid="submit-button"]:not([disabled])', {
      timeout: 10000,
    });

    // Vérifier qu'un message d'erreur s'affiche
    // Chercher le div d'erreur avec la classe bg-red-500/10
    await expect(
      page.locator('div').filter({ hasText: /erreur|error|invalid|incorrect|credentials|identifiants/i }).first()
    ).toBeVisible({
      timeout: 2000,
    });
  });

  test('Devrait valider le format de l\'email', async ({ page }) => {
    await page.goto('/fr/test/login', { waitUntil: 'networkidle' });

    // Attendre que le formulaire soit prêt
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    await page.fill('[data-testid="email-input"]', 'not-an-email');
    await page.fill('[data-testid="password-input"]', 'somepassword');
    await page.click('[data-testid="submit-button"]');

    // Vérifier la validation HTML5 ou un message d'erreur
    const emailInput = page.locator('[data-testid="email-input"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });
});
