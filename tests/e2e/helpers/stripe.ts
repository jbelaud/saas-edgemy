import { Page } from '@playwright/test';

/**
 * Helpers pour les paiements Stripe en mode test
 */

/**
 * Remplit le formulaire de paiement Stripe avec une carte de test
 */
export async function fillStripeCardForm(
  page: Page,
  cardType: 'success' | 'decline' | '3ds' = 'success'
) {
  // Cartes de test Stripe
  const TEST_CARDS = {
    success: '4242424242424242',
    decline: '4000000000000002',
    '3ds': '4000002500003155',
  };

  // Attendre que l'iframe Stripe soit chargée
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

  // Remplir le numéro de carte
  await stripeFrame.locator('input[name="cardnumber"]').fill(TEST_CARDS[cardType]);

  // Date d'expiration (toujours dans le futur)
  await stripeFrame.locator('input[name="exp-date"]').fill('12/30');

  // CVC
  await stripeFrame.locator('input[name="cvc"]').fill('123');

  // Code postal (si demandé)
  const postalInput = stripeFrame.locator('input[name="postal"]');
  if (await postalInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await postalInput.fill('75001');
  }
}

/**
 * Soumet le formulaire de paiement Stripe
 */
export async function submitStripePayment(page: Page) {
  // Cliquer sur le bouton de paiement
  await page.click('button:has-text("Payer"), button:has-text("Pay")');

  // Attendre la redirection ou le message de succès
  await page.waitForURL(/success|confirmed/, { timeout: 15000 });
}

/**
 * Process complet d'un paiement Stripe en mode test
 */
export async function completeStripePayment(
  page: Page,
  cardType: 'success' | 'decline' | '3ds' = 'success'
) {
  await fillStripeCardForm(page, cardType);
  await submitStripePayment(page);
}

/**
 * Attend et gère la page de checkout Stripe
 */
export async function handleStripeCheckout(page: Page) {
  // Si on est redirigé vers Stripe Checkout
  const isStripeCheckout = await page.waitForURL(/checkout\.stripe\.com/, {
    timeout: 5000,
  }).then(() => true).catch(() => false);

  if (isStripeCheckout) {
    // Remplir le formulaire Stripe Checkout
    await page.fill('input[name="email"]', 'test@example.com');
    await fillStripeCardForm(page);
    await page.click('button[type="submit"]');

    // Attendre la redirection de retour
    await page.waitForURL(/success|confirmed/, { timeout: 15000 });
  }
}
