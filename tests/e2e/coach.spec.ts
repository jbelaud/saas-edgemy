import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers/auth';

test.describe('Parcours Coach', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant que coach
    await login(page, TEST_USERS.coach);
  });

  test('Devrait accéder au dashboard coach', async ({ page }) => {
    await page.goto('/fr/coach/dashboard');

    // Vérifier qu'on voit les statistiques
    await expect(page.locator('text=/statistiques|stats|analytics/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait afficher la liste des annonces', async ({ page }) => {
    await page.goto('/fr/coach/announcements');

    // Vérifier qu'on est sur la page des annonces
    await expect(page).toHaveURL(/\/coach\/announcements/);

    // Vérifier qu'on voit le bouton pour créer une annonce
    await expect(page.locator('button:has-text("Créer"), button:has-text("Create")')).toBeVisible();
  });

  test('Devrait ouvrir le formulaire de création d\'annonce', async ({ page }) => {
    await page.goto('/fr/coach/announcements');

    // Cliquer sur créer une annonce
    await page.locator('button:has-text("Créer une annonce"), button:has-text("Create")').first().click();

    // Vérifier que le formulaire s'ouvre
    await expect(page.locator('input[name="title"], input[name="titre"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test.skip('Devrait créer une nouvelle annonce', async ({ page }) => {
    await page.goto('/fr/coach/announcements');

    // Ouvrir le formulaire
    await page.locator('button:has-text("Créer")').first().click();

    // Remplir le formulaire
    await page.fill('input[name="title"]', 'Session test E2E');
    await page.fill('textarea[name="description"]', 'Ceci est une session de test automatisée');
    await page.fill('input[name="price"], input[name="priceCents"]', '5000'); // 50€
    await page.fill('input[name="duration"], input[name="durationMin"]', '60'); // 1h

    // Soumettre
    await page.locator('button[type="submit"]').click();

    // Vérifier le succès
    await expect(page.locator('text=/succès|success|créée|created/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait afficher la page de gestion des disponibilités', async ({ page }) => {
    await page.goto('/fr/coach/availability');

    // Vérifier qu'on est sur la bonne page
    await expect(page).toHaveURL(/\/coach\/availability/);

    // Vérifier qu'on voit le calendrier ou les créneaux
    await expect(page.locator('text=/disponibilité|availability|calendrier|calendar/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait afficher la liste des étudiants', async ({ page }) => {
    await page.goto('/fr/coach/students');

    // Vérifier qu'on est sur la page des étudiants
    await expect(page).toHaveURL(/\/coach\/students/);
  });

  test('Devrait afficher les packs vendus', async ({ page }) => {
    await page.goto('/fr/coach/packs');

    // Vérifier qu'on est sur la page des packs
    await expect(page).toHaveURL(/\/coach\/packs/);

    // Vérifier qu'on voit les statistiques des packs
    await expect(page.locator('text=/packs|packages/i')).toBeVisible();
  });

  test('Devrait afficher le calendrier agenda', async ({ page }) => {
    await page.goto('/fr/coach/agenda');

    // Vérifier qu'on est sur la page agenda
    await expect(page).toHaveURL(/\/coach\/agenda/);

    // Vérifier qu'on voit le calendrier
    await expect(page.locator('[data-testid="calendar"], .calendar, .fc-view')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait accéder aux paramètres du coach', async ({ page }) => {
    await page.goto('/fr/coach/settings');

    // Vérifier qu'on est sur la page des paramètres
    await expect(page).toHaveURL(/\/coach\/settings/);

    // Vérifier qu'on voit les champs de profil
    await expect(page.locator('input[name="firstName"], input[name="lastName"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('Devrait naviguer entre les différentes sections du dashboard coach', async ({ page }) => {
    await page.goto('/fr/coach/dashboard');

    // Tester la navigation via le menu
    const sections = [
      { link: 'Annonces', url: /announcements/ },
      { link: 'Agenda', url: /agenda/ },
      { link: 'Étudiants', url: /students/ },
      { link: 'Packs', url: /packs/ },
    ];

    for (const section of sections) {
      const navLink = page.locator(`a:has-text("${section.link}")`).first();

      if (await navLink.isVisible({ timeout: 2000 })) {
        await navLink.click();
        await expect(page).toHaveURL(section.url, { timeout: 5000 });
      }
    }
  });
});
