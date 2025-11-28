/**
 * Trouver comment obtenir exactement 9060 centimes (90.60€)
 */

console.log('\n=== RECHERCHE DE LA FORMULE QUI DONNE 9060 ===\n');

const coachPrice = 9000;
const target = 9060;
const diff = target - coachPrice; // 60 centimes

console.log('Prix coach: 9000 centimes (90.00€)');
console.log('Montant reçu par Stripe: 9060 centimes (90.60€)');
console.log('Différence: ' + diff + ' centimes (0.60€)\n');

// Test 1: Pourcentage direct
const percentNeeded = (diff / coachPrice) * 100;
console.log('Test 1 - Pourcentage simple:');
console.log('  ' + diff + ' / ' + coachPrice + ' * 100 = ' + percentNeeded.toFixed(4) + '%');
console.log('  9000 * (1 + ' + percentNeeded.toFixed(4) + '%) = ' + Math.round(9000 * (1 + percentNeeded / 100)));
console.log('');

// Test 2: Vérifier si c'est avec 0.065 en décimal (pas en pourcentage)
const test2 = Math.round(9000 * (1 + 0.065));
console.log('Test 2 - Si on utilise 0.065 directement (pas divisé par 100):');
console.log('  9000 * (1 + 0.065) = 9000 * 1.065 = ' + (9000 * 1.065));
console.log('  Arrondi: ' + test2 + ' centimes = ' + (test2 / 100).toFixed(2) + '€');
console.log('  ❌ Ce n\'est pas 9060\n');

// Test 3: Vérifier si c'est un ancien calcul avec frais Stripe inclus
const oldStripeFee = Math.round(9000 * 0.015 + 25); // 160 centimes
console.log('Test 3 - Prix coach + frais Stripe seulement:');
console.log('  Frais Stripe: 9000 * 0.015 + 25 = ' + oldStripeFee + ' centimes');
console.log('  Total: 9000 + ' + oldStripeFee + ' = ' + (9000 + oldStripeFee) + ' centimes');
console.log('  ❌ Ce n\'est pas 9060\n');

// Test 4: Est-ce que 60 centimes vient d'un calcul sur 9000 avec un autre pourcentage?
console.log('Test 4 - Recherche exhaustive du pourcentage exact:\n');

// Tester avec différentes variations
const variations = [
  { name: 'EDGEMY_SERVICE_FEE_PERCENT="0.065" (décimal)', value: 0.065 / 100 },
  { name: 'EDGEMY_SERVICE_FEE_PERCENT="0.65" (pourcentage)', value: 0.65 / 100 },
  { name: 'EDGEMY_SERVICE_FEE_PERCENT="6.5" (pourcentage)', value: 6.5 / 100 },
  { name: 'Directement 0.065 (sans division)', value: 0.065 },
  { name: 'Pourcentage exact pour 60 centimes', value: percentNeeded / 100 },
];

variations.forEach(({ name, value }) => {
  const result = Math.round(9000 * (1 + value));
  const fee = result - 9000;
  const match = result === 9060 ? ' ✅ MATCH!' : '';
  console.log(`  ${name}`);
  console.log(`    Multiplicateur: 1 + ${value.toFixed(8)} = ${(1 + value).toFixed(8)}`);
  console.log(`    Résultat: ${result} centimes (${(result / 100).toFixed(2)}€)`);
  console.log(`    Frais: ${fee} centimes (${(fee / 100).toFixed(2)}€)${match}`);
  console.log('');
});

// Test 5: Peut-être que le calcul est fait différemment dans un ancien code?
console.log('Test 5 - Si ancien code applique 0.65% au lieu de 6.5%:');
const oldFee = Math.round(9000 * 0.0065);
const oldTotal = 9000 + oldFee;
console.log('  Commission: 9000 * 0.0065 = ' + (9000 * 0.0065).toFixed(2));
console.log('  Arrondi: ' + oldFee + ' centimes');
console.log('  Total: 9000 + ' + oldFee + ' = ' + oldTotal + ' centimes = ' + (oldTotal / 100).toFixed(2) + '€');
if (oldTotal === 9060) console.log('  ✅ MATCH!');
console.log('');

// Test 6: Peut-être un problème d'arrondi avec frais Stripe
console.log('Test 6 - Calcul inversé depuis Stripe:');
console.log('  Si Stripe a reçu 9060, et qu\'on retire les frais Stripe:');
const receivedByCoach = 9060 - Math.round(9060 * 0.015 + 25);
console.log('  9060 - (9060 * 0.015 + 25) = 9060 - ' + Math.round(9060 * 0.015 + 25) + ' = ' + receivedByCoach);
console.log('  Coach devrait recevoir: ' + receivedByCoach + ' centimes = ' + (receivedByCoach / 100).toFixed(2) + '€');
console.log('  Différence avec prix coach (9000): ' + (receivedByCoach - 9000) + ' centimes');
console.log('');
