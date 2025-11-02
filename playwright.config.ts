import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement depuis .env.local pour les tests
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

/**
 * Configuration Playwright pour tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Timeout maximum par test (30 secondes)
  timeout: 30 * 1000,

  // Configuration globale pour tous les tests
  use: {
    // URL de base pour les tests (utilise l'env ou localhost)
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Capture d'écran seulement en cas d'échec
    screenshot: 'only-on-failure',

    // Vidéo seulement en cas d'échec
    video: 'retain-on-failure',

    // Traces pour le debugging
    trace: 'on-first-retry',
  },

  // Nombre de tests parallèles
  fullyParallel: true,

  // Ne pas échouer le build en CI si certains tests échouent
  forbidOnly: !!process.env.CI,

  // Nombre de retry en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Workers (processus parallèles)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],

  // Configuration des navigateurs pour les tests
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Décommentez pour tester sur Firefox et Safari
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Tests Mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Serveur de développement pour les tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
