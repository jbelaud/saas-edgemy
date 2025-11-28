/**
 * VÉRIFICATION DU BUG TROUVÉ
 */

console.log('\n========================================');
console.log('  BUG IDENTIFIÉ: Variable .env incorrecte');
console.log('========================================\n');

// Simulation avec la MAUVAISE valeur (celle dans .env)
function calculateWithWrongEnv(priceCents) {
  const WRONG_FEE = 0.065; // ❌ Valeur actuelle dans .env
  const percentDecimal = WRONG_FEE / 100; // 0.065 / 100 = 0.00065
  const serviceFeeMultiplier = 1 + percentDecimal; // 1.00065
  const totalCustomerCents = Math.round(priceCents * serviceFeeMultiplier);
  return totalCustomerCents;
}

// Simulation avec la BONNE valeur
function calculateWithCorrectEnv(priceCents) {
  const CORRECT_FEE = 6.5; // ✅ Valeur attendue
  const percentDecimal = CORRECT_FEE / 100; // 6.5 / 100 = 0.065
  const serviceFeeMultiplier = 1 + percentDecimal; // 1.065
  const totalCustomerCents = Math.round(priceCents * serviceFeeMultiplier);
  return totalCustomerCents;
}

const coachPrice = 9000; // 90€

console.log('Prix coach: 90.00€ (9000 centimes)\n');

console.log('AVEC LA MAUVAISE VARIABLE .env:');
console.log('  EDGEMY_SERVICE_FEE_PERCENT="0.065"  ❌');
console.log('  → Interprété comme: 0.065% au lieu de 6.5%');
console.log('  → percentDecimal = 0.065 / 100 = 0.00065');
console.log('  → serviceFeeMultiplier = 1.00065');
console.log('  → totalCustomerCents = 9000 * 1.00065 = ' + (9000 * 1.00065).toFixed(2));
const wrong = calculateWithWrongEnv(coachPrice);
console.log('  → Arrondi: ' + wrong + ' centimes = ' + (wrong / 100).toFixed(2) + '€');
console.log('  → Frais service: ' + (wrong - coachPrice) + ' centimes = ' + ((wrong - coachPrice) / 100).toFixed(2) + '€');
console.log('  → Pourcentage effectif: ' + (((wrong - coachPrice) / coachPrice) * 100).toFixed(4) + '%\n');

console.log('AVEC LA BONNE VARIABLE .env:');
console.log('  EDGEMY_SERVICE_FEE_PERCENT="6.5"  ✅');
console.log('  → Interprété comme: 6.5%');
console.log('  → percentDecimal = 6.5 / 100 = 0.065');
console.log('  → serviceFeeMultiplier = 1.065');
console.log('  → totalCustomerCents = 9000 * 1.065 = ' + (9000 * 1.065).toFixed(2));
const correct = calculateWithCorrectEnv(coachPrice);
console.log('  → Arrondi: ' + correct + ' centimes = ' + (correct / 100).toFixed(2) + '€');
console.log('  → Frais service: ' + (correct - coachPrice) + ' centimes = ' + ((correct - coachPrice) / 100).toFixed(2) + '€');
console.log('  → Pourcentage effectif: ' + (((correct - coachPrice) / coachPrice) * 100).toFixed(2) + '%\n');

console.log('========================================');
console.log('  RÉSULTAT');
console.log('========================================\n');

console.log('Montant ACTUEL envoyé à Stripe: ' + (wrong / 100).toFixed(2) + '€');
console.log('Montant ATTENDU à envoyer à Stripe: ' + (correct / 100).toFixed(2) + '€');
console.log('Différence: ' + ((correct - wrong) / 100).toFixed(2) + '€\n');

console.log('❌ PROBLÈME: Edgemy perd ' + ((correct - wrong) / 100).toFixed(2) + '€ par transaction!');
console.log('   Au lieu de prendre 6.5% de commission, nous prenons seulement 0.065%\n');

console.log('SOLUTION:');
console.log('  Changer dans .env et .env.local:');
console.log('  - AVANT: EDGEMY_SERVICE_FEE_PERCENT="0.065"  ❌');
console.log('  - APRÈS: EDGEMY_SERVICE_FEE_PERCENT="6.5"    ✅');
console.log('\n');
