/**
 * Script pour déboguer le flux de paiement
 * Identifie où le montant 90.60€ est généré
 */

// Simulation du calcul pricing.ts
function calculateForSession(priceCents) {
  const config = {
    stripePercentFee: 0.015,  // 1.5%
    stripeFixedFeeCents: 25,  // 0.25€
    edgemyServiceFeePercent: 6.5, // 6.5%
    roundingMode: 'nearest',
  };

  const coachNetCents = priceCents;

  // Calculer le total client (prix coach + commission 6.5%)
  const serviceFeeMultiplier = 1 + (config.edgemyServiceFeePercent / 100);
  const totalCustomerCents = Math.round(coachNetCents * serviceFeeMultiplier);
  const serviceFeeCents = totalCustomerCents - coachNetCents;

  // Frais Stripe sur le montant TOTAL
  const percentFee = totalCustomerCents * config.stripePercentFee;
  const fixedFee = config.stripeFixedFeeCents;
  const actualStripeFee = Math.round(percentFee + fixedFee);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - actualStripeFee);

  return {
    coachNetCents,
    stripeFeeCents: actualStripeFee,
    edgemyFeeCents,
    serviceFeeCents,
    totalCustomerCents,
  };
}

// Test avec le cas réel
console.log('\n=== TEST AVEC PRIX COACH 90€ (9000 centimes) ===\n');

const result = calculateForSession(9000);

console.log('Prix coach:', (result.coachNetCents / 100).toFixed(2) + '€');
console.log('Frais service (6.5%):', (result.serviceFeeCents / 100).toFixed(2) + '€');
console.log('Total client:', (result.totalCustomerCents / 100).toFixed(2) + '€');
console.log('Frais Stripe:', (result.stripeFeeCents / 100).toFixed(2) + '€');
console.log('Marge Edgemy:', (result.edgemyFeeCents / 100).toFixed(2) + '€');

console.log('\n=== CALCUL DÉTAILLÉ ===\n');
console.log('1. Prix coach: 90.00€ = 9000 centimes');
console.log('2. Multiplicateur service: 1 + 6.5/100 = 1.065');
console.log('3. Total brut: 9000 * 1.065 = 9585 centimes');
console.log('4. Total arrondi: Math.round(9585) = 9585 centimes = 95.85€');
console.log('5. Frais service: 9585 - 9000 = 585 centimes = 5.85€');
console.log('6. Frais Stripe % : 9585 * 0.015 = 143.775 centimes');
console.log('7. Frais Stripe fixe: 25 centimes');
console.log('8. Frais Stripe total: 143.775 + 25 = 168.775 → Math.round() = 169 centimes = 1.69€');
console.log('9. Marge Edgemy: 585 - 169 = 416 centimes = 4.16€');

console.log('\n=== HYPOTHÈSES ERREUR 90.60€ ===\n');

// Hypothèse 1: Multiplication incorrecte
const wrong1 = 9000 * 1.006666;
console.log('Hypothèse 1 - Si multiplicateur 1.006666:', Math.round(wrong1), 'centimes =', (Math.round(wrong1) / 100).toFixed(2) + '€');

// Hypothèse 2: Soustraction au lieu d'addition
const wrong2 = 9000 + 585 - 169 - 416;
console.log('Hypothèse 2 - Si soustraction incorrecte:', wrong2, 'centimes =', (wrong2 / 100).toFixed(2) + '€');

// Hypothèse 3: Frais appliqués sur le prix coach au lieu du total
const wrong3_stripeFee = Math.round(9000 * 0.015 + 25); // 160 centimes
const wrong3_total = 9000 + wrong3_stripeFee;
console.log('Hypothèse 3 - Si frais Stripe sur prix coach:', wrong3_total, 'centimes =', (wrong3_total / 100).toFixed(2) + '€');

// Hypothèse 4: Total = coach + frais Stripe (oubli commission)
const wrong4_stripeFee = Math.round(9585 * 0.015 + 25); // 169 centimes
const wrong4_total = 9000 + wrong4_stripeFee;
console.log('Hypothèse 4 - Si total = coach + frais Stripe:', wrong4_total, 'centimes =', (wrong4_total / 100).toFixed(2) + '€');

// Hypothèse 5: Commission calculée sur total au lieu du prix coach
const wrong5_commission = Math.round(9585 * 0.065); // 623 centimes
const wrong5_total = 9000 + wrong5_commission;
console.log('Hypothèse 5 - Si commission sur total:', wrong5_total, 'centimes =', (wrong5_total / 100).toFixed(2) + '€');

// Hypothèse 6: 90.60€ = 9060 centimes (proche de 9000 + 60)
console.log('Hypothèse 6 - 90.60€ = 9060 centimes → différence de +60 centimes avec prix coach');
console.log('              Cela pourrait être: 9000 + Math.round(9000 * 0.0066...) ≈ 9060');

// Tester différents pourcentages
console.log('\n=== RECHERCHE DU POURCENTAGE QUI DONNE 9060 ===\n');
for (let i = 0; i <= 10; i += 0.1) {
  const test = 9000 * (1 + i / 100);
  if (Math.round(test) === 9060) {
    console.log(`Trouvé! ${i.toFixed(1)}% donne 9060 centimes (90.60€)`);
  }
}

// Inverse: quel pourcentage donne 60 centimes?
const percentNeeded = (60 / 9000) * 100;
console.log(`Pour obtenir +60 centimes: ${percentNeeded.toFixed(4)}% de 9000`);
console.log(`9000 * (1 + ${percentNeeded.toFixed(4)}/100) = ${Math.round(9000 * (1 + percentNeeded / 100))} centimes`);

console.log('\n=== CONCLUSION ===\n');
console.log('Le montant 90.60€ (9060 centimes) correspond à:');
console.log('- Prix coach (9000) + 60 centimes supplémentaires');
console.log('- Cela ne correspond à AUCUN calcul valide avec 6.5% de commission');
console.log('- Vérifier si un ancien taux (0.67%) ou calcul obsolète est utilisé quelque part');
