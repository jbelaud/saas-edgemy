import { ReservationType, CommissionCalculation } from './types';

/**
 * Calcule la commission selon les règles de la Phase 1
 *
 * Règles Phase 1:
 * - Session unique (SINGLE): Commission = 5% du montant
 * - Pack d'heures (PACK): Commission = 3€ fixe + 2% du montant
 * - Le coach reçoit 100% du montant payé par le joueur
 *
 * @param playerAmountEuros - Montant payé par le joueur en euros
 * @param type - Type de réservation (SINGLE ou PACK)
 * @returns Détails de la commission
 */
export function calculateCommission(
  playerAmountEuros: number,
  type: ReservationType
): CommissionCalculation {
  const playerAmountCents = Math.round(playerAmountEuros * 100);
  let commissionCents = 0;

  if (type === 'SINGLE') {
    // Session unique: +5% du prix
    commissionCents = Math.round(playerAmountCents * 0.05);
  } else if (type === 'PACK') {
    // Pack: 3€ fixe + 2% du prix
    const fixedFee = 300; // 3€ en centimes
    const percentFee = Math.round(playerAmountCents * 0.02);
    commissionCents = fixedFee + percentFee;
  }

  // Le coach reçoit 100% du montant payé
  const coachEarningsCents = playerAmountCents;

  return {
    playerAmount: playerAmountCents,
    commission: commissionCents,
    coachEarnings: coachEarningsCents,
  };
}

/**
 * Formatte un montant en centimes en euros avec devise
 */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)}€`;
}

/**
 * Convertit des euros en centimes
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convertit des centimes en euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Exemple d'utilisation et tests
 */
if (require.main === module) {
  console.log('=== Tests de calcul de commission ===\n');

  // Test 1: Session unique de 50€
  const test1 = calculateCommission(50, 'SINGLE');
  console.log('Test 1 - Session unique 50€:');
  console.log(`  Joueur paie: ${formatPrice(test1.playerAmount)}`);
  console.log(`  Commission Edgemy: ${formatPrice(test1.commission)} (5%)`);
  console.log(`  Coach reçoit: ${formatPrice(test1.coachEarnings)}`);
  console.log(`  Total Edgemy: ${formatPrice(test1.commission)}\n`);

  // Test 2: Pack de 200€
  const test2 = calculateCommission(200, 'PACK');
  console.log('Test 2 - Pack 200€:');
  console.log(`  Joueur paie: ${formatPrice(test2.playerAmount)}`);
  console.log(`  Commission Edgemy: ${formatPrice(test2.commission)} (3€ + 2%)`);
  console.log(`  Coach reçoit: ${formatPrice(test2.coachEarnings)}`);
  console.log(`  Total Edgemy: ${formatPrice(test2.commission)}\n`);

  // Test 3: Pack de 500€
  const test3 = calculateCommission(500, 'PACK');
  console.log('Test 3 - Pack 500€:');
  console.log(`  Joueur paie: ${formatPrice(test3.playerAmount)}`);
  console.log(`  Commission Edgemy: ${formatPrice(test3.commission)} (3€ + 2%)`);
  console.log(`  Coach reçoit: ${formatPrice(test3.coachEarnings)}`);
  console.log(`  Total Edgemy: ${formatPrice(test3.commission)}`);
}
