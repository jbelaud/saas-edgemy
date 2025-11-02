import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers/auth';
import { handleStripeCheckout } from './helpers/stripe';

test.describe('Réservation de session', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant que joueur avant chaque test
    await login(page, TEST_USERS.player);
  });

  test('Devrait afficher la liste des coachs disponibles', async ({ page }) => {
    await page.goto('/fr/player/coaches/explore');

    // Vérifier qu'on voit des coachs
    await expect(page.locator('[data-testid="coach-card"], .coach-card')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait afficher le profil d\'un coach', async ({ page }) => {
    await page.goto('/fr/player/coaches/explore');

    // Cliquer sur le premier coach
    const firstCoach = page.locator('[data-testid="coach-card"], .coach-card').first();
    await firstCoach.click();

    // Vérifier qu'on est sur le profil du coach
    await expect(page).toHaveURL(/\/coach\//);

    // Vérifier qu'on voit les informations du coach
    await expect(page.locator('text=/annonce|offer|session/i')).toBeVisible();
  });

  test('Devrait ouvrir le modal de réservation', async ({ page }) => {
    // Aller sur le profil d'un coach (utiliser un slug connu)
    await page.goto('/fr/coach/john-doe');

    // Cliquer sur le bouton de réservation
    const bookButton = page.locator('button:has-text("Réserver"), button:has-text("Book")').first();
    await bookButton.click();

    // Vérifier que le modal s'ouvre
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible();
  });

  test('Devrait permettre de sélectionner un créneau horaire', async ({ page }) => {
    await page.goto('/fr/coach/john-doe');

    // Ouvrir le modal de réservation
    await page.locator('button:has-text("Réserver")').first().click();

    // Attendre que les créneaux se chargent
    await page.waitForTimeout(2000);

    // Sélectionner un créneau
    const timeSlot = page.locator('[data-testid="time-slot"], .time-slot').first();
    if (await timeSlot.isVisible({ timeout: 5000 })) {
      await timeSlot.click();

      // Vérifier que le créneau est sélectionné
      await expect(timeSlot).toHaveClass(/selected|active/);
    }
  });

  test.skip('Parcours complet: réserver une session et payer', async ({ page }) => {
    // Ce test est marqué skip car il nécessite une configuration Stripe en mode test
    await page.goto('/fr/coach/john-doe');

    // 1. Ouvrir le modal de réservation
    await page.locator('button:has-text("Réserver")').first().click();

    // 2. Sélectionner un créneau
    const timeSlot = page.locator('[data-testid="time-slot"]').first();
    await timeSlot.click();

    // 3. Confirmer la réservation
    await page.locator('button:has-text("Confirmer")').click();

    // 4. Gérer le paiement Stripe
    await handleStripeCheckout(page);

    // 5. Vérifier qu'on arrive sur la page de succès
    await expect(page).toHaveURL(/success/);
    await expect(page.locator('text=/succès|success|confirmée/i')).toBeVisible();
  });

  test('Devrait vérifier que l\'utilisateur est connecté avant de réserver', async ({ page, context }) => {
    // Se déconnecter
    await context.clearCookies();

    await page.goto('/fr/coach/john-doe');

    // Essayer de réserver sans être connecté
    await page.locator('button:has-text("Réserver")').first().click();

    // Devrait être redirigé vers la page de connexion
    await expect(page).toHaveURL(/sign-in/);
  });

  test('Devrait afficher un message si le coach n\'a pas de créneaux disponibles', async ({ page }) => {
    // Utiliser un coach qui n'a pas de créneaux (à adapter selon votre DB de test)
    await page.goto('/fr/coach/no-availability');

    const bookButton = page.locator('button:has-text("Réserver")');

    if (await bookButton.isVisible({ timeout: 5000 })) {
      await bookButton.click();

      // Vérifier qu'un message indique qu'il n'y a pas de créneaux
      await expect(page.locator('text=/aucun.*disponible|no.*available/i')).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
