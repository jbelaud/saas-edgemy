import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from './helpers/auth';

test.describe('Authentification', () => {
  test('Devrait afficher la page de connexion', async ({ page }) => {
    await page.goto('/fr/sign-in');

    // Vérifier que le formulaire de connexion est présent
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Devrait se connecter en tant que joueur', async ({ page }) => {
    await login(page, TEST_USERS.player);

    // Vérifier qu'on est bien sur le dashboard joueur
    await expect(page).toHaveURL(/\/(fr|en)\/player/);

    // Vérifier qu'on voit du contenu authentifié
    await expect(page.locator('text=/dashboard|tableau de bord/i')).toBeVisible();
  });

  test('Devrait se connecter en tant que coach', async ({ page }) => {
    await login(page, TEST_USERS.coach);

    // Vérifier qu'on est bien sur le dashboard coach
    await expect(page).toHaveURL(/\/(fr|en)\/coach/);

    // Vérifier qu'on voit du contenu coach
    await expect(page.locator('text=/dashboard|tableau de bord/i')).toBeVisible();
  });

  test('Devrait se connecter en tant qu\'admin', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Vérifier qu'on est bien sur le dashboard admin
    await expect(page).toHaveURL(/\/(fr|en)\/admin/);

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
    await page.goto('/fr/sign-in');

    await page.fill('input[name="email"]', 'invalid@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Vérifier qu'un message d'erreur s'affiche
    await expect(page.locator('text=/erreur|error|invalid|incorrect/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait valider le format de l\'email', async ({ page }) => {
    await page.goto('/fr/sign-in');

    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'somepassword');
    await page.click('button[type="submit"]');

    // Vérifier la validation HTML5 ou un message d'erreur
    const emailInput = page.locator('input[name="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });
});
