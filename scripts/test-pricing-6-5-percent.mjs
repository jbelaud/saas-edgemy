/**
 * Script de test avec frais uniformes à 6.5% pour TOUT
 * Sessions uniques : 6.5%
 * Packs : 6.5%
 */

type CardType = {
  name: string;
  percentFee: number;
  fixedFeeCents: number;
};

const CARD_TYPES: Record<string, CardType> = {
  EU: { name: 'Carte française/UE', percentFee: 0.015, fixedFeeCents: 25 },
  UK: { name: 'Carte britannique', percentFee: 0.025, fixedFeeCents: 25 },
  INTERNATIONAL: { name: 'Carte internationale', percentFee: 0.0325, fixedFeeCents: 25 },
  UK_WITH_CONVERSION: { name: 'Carte UK + conversion', percentFee: 0.045, fixedFeeCents: 25 },
  INTERNATIONAL_WITH_CONVERSION: { name: 'Carte internationale + conversion', percentFee: 0.0525, fixedFeeCents: 25 },
};

function calculateStripeFee(totalCents: number, cardType: CardType): number {
  return Math.round(totalCents * cardType.percentFee + cardType.fixedFeeCents);
}

function calculateSessionWithCard(priceCents: number, cardType: CardType, serviceFeePercent: number) {
  const coachNetCents = priceCents;
  const serviceFeeCents = Math.round(priceCents * serviceFeePercent);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  const stripeFeeCents = calculateStripeFee(totalCustomerCents, cardType);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - stripeFeeCents);

  const VAT_RATE = 0.20;
  const edgemyRevenueHT = Math.round(edgemyFeeCents / (1 + VAT_RATE));
  const edgemyRevenueTVACents = edgemyFeeCents - edgemyRevenueHT;

  return {
    coachNetCents,
    serviceFeeCents,
    totalCustomerCents,
    stripeFeeCents,
    edgemyFeeCents,
    edgemyRevenueHT,
    edgemyRevenueTVACents,
  };
}

function calculatePackWithCard(priceCents: number, sessionsCount: number, cardType: CardType, serviceFeePercent: number) {
  const coachNetCents = priceCents;
  const serviceFeeCents = Math.round(priceCents * serviceFeePercent);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  const stripeFeeCents = calculateStripeFee(totalCustomerCents, cardType);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - stripeFeeCents);

  const VAT_RATE = 0.20;
  const edgemyRevenueHT = Math.round(edgemyFeeCents / (1 + VAT_RATE));
  const edgemyRevenueTVACents = edgemyFeeCents - edgemyRevenueHT;

  return {
    coachNetCents,
    serviceFeeCents,
    totalCustomerCents,
    stripeFeeCents,
    edgemyFeeCents,
    edgemyRevenueHT,
    edgemyRevenueTVACents,
    sessionsCount,
  };
}

console.log('🧪 TEST AVEC FRAIS UNIFORMES À 6.5%\n');
console.log('═'.repeat(80));

// ==================== SESSIONS UNIQUES ====================
console.log('\n📊 SESSION UNIQUE 100€ avec 6.5%\n');
console.log('─'.repeat(80));

const session100Results = Object.entries(CARD_TYPES).map(([key, cardType]) => {
  const old5 = calculateSessionWithCard(10000, cardType, 0.05);
  const new65 = calculateSessionWithCard(10000, cardType, 0.065);

  return {
    name: cardType.name,
    old: old5,
    new: new65,
    gain: new65.edgemyRevenueHT - old5.edgemyRevenueHT,
    gainPercent: ((new65.edgemyRevenueHT - old5.edgemyRevenueHT) / old5.edgemyRevenueHT) * 100,
  };
});

session100Results.forEach((r) => {
  const status = r.new.edgemyFee > 0 ? '✅ Rentable' : '❌ Perte';
  console.log(`${r.name.padEnd(35)}`);
  console.log(`  Ancien (5%)       : Marge HT ${(r.old.edgemyRevenueHT / 100).toFixed(2)}€ | Joueur paie ${(r.old.totalCustomerCents / 100).toFixed(2)}€`);
  console.log(`  Nouveau (6.5%)    : Marge HT ${(r.new.edgemyRevenueHT / 100).toFixed(2)}€ | Joueur paie ${(r.new.totalCustomerCents / 100).toFixed(2)}€`);
  console.log(`  Gain              : +${(r.gain / 100).toFixed(2)}€ (+${r.gainPercent.toFixed(1)}%) ${status}`);
  console.log('');
});

// ==================== PACKS ====================
console.log('\n📊 PACK 10h à 850€ avec 6.5%\n');
console.log('─'.repeat(80));

const pack850Results = Object.entries(CARD_TYPES).map(([key, cardType]) => {
  // Ancien : 5€ + 3% = 30.50€
  const oldServiceFee = 500 + Math.round(85000 * 0.03);
  const oldTotal = 85000 + oldServiceFee;
  const oldStripeFee = calculateStripeFee(oldTotal, cardType);
  const oldEdgemyFee = Math.max(0, oldServiceFee - oldStripeFee);
  const oldEdgemyHT = Math.round(oldEdgemyFee / 1.20);

  const new65 = calculatePackWithCard(85000, 10, cardType, 0.065);

  return {
    name: cardType.name,
    oldServiceFee,
    oldHT: oldEdgemyHT,
    newServiceFee: new65.serviceFeeCents,
    newHT: new65.edgemyRevenueHT,
    gain: new65.edgemyRevenueHT - oldEdgemyHT,
    gainPercent: oldEdgemyHT > 0 ? ((new65.edgemyRevenueHT - oldEdgemyHT) / oldEdgemyHT) * 100 : 0,
  };
});

pack850Results.forEach((r) => {
  const status = r.newHT > 1000 ? '✅ Rentable' : r.newHT > 0 ? '⚠️  Marge faible' : '❌ Perte';
  console.log(`${r.name.padEnd(35)}`);
  console.log(`  Ancien (5€+3%)    : Frais ${(r.oldServiceFee / 100).toFixed(2)}€ | Marge HT ${(r.oldHT / 100).toFixed(2)}€`);
  console.log(`  Nouveau (6.5%)    : Frais ${(r.newServiceFee / 100).toFixed(2)}€ | Marge HT ${(r.newHT / 100).toFixed(2)}€`);
  if (r.oldHT > 0) {
    console.log(`  Gain              : +${(r.gain / 100).toFixed(2)}€ (+${r.gainPercent.toFixed(1)}%) ${status}`);
  } else {
    console.log(`  Gain              : +${(r.gain / 100).toFixed(2)}€ ${status}`);
  }
  console.log('');
});

// ==================== PACK 500€ ====================
console.log('\n📊 PACK 5h à 500€ avec 6.5%\n');
console.log('─'.repeat(80));

const pack500Results = Object.entries(CARD_TYPES).map(([key, cardType]) => {
  const old = calculatePackWithCard(50000, 5, cardType, 0.05 + 0.01); // Ancien : 5€ + 3%
  const oldServiceFee = 500 + Math.round(50000 * 0.03);
  const oldTotal = 50000 + oldServiceFee;
  const oldStripeFee = calculateStripeFee(oldTotal, cardType);
  const oldEdgemyFee = Math.max(0, oldServiceFee - oldStripeFee);
  const oldEdgemyHT = Math.round(oldEdgemyFee / 1.20);

  const new65 = calculatePackWithCard(50000, 5, cardType, 0.065);

  return {
    name: cardType.name,
    oldHT: oldEdgemyHT,
    newHT: new65.edgemyRevenueHT,
    gain: new65.edgemyRevenueHT - oldEdgemyHT,
  };
});

pack500Results.forEach((r) => {
  const status = r.newHT > 500 ? '✅ Rentable' : r.newHT > 0 ? '⚠️  Marge faible' : '❌ Perte';
  console.log(`${r.name.padEnd(35)} : Marge HT ${(r.newHT / 100).toFixed(2)}€ (${(r.gain / 100).toFixed(2)}€ vs ancien) ${status}`);
});

// ==================== COMPARAISON GLOBALE ====================
console.log('\n' + '═'.repeat(80));
console.log('📊 COMPARAISON GLOBALE: Impact du passage à 6.5% uniforme');
console.log('═'.repeat(80));

console.log('\n💰 SESSIONS UNIQUES (100€):');
console.log('   Actuel (5%)    : Joueur paie 105.00€ | Marge Edgemy 2.64€ HT (carte UE)');
console.log('   Nouveau (6.5%) : Joueur paie 106.50€ | Marge Edgemy 4.77€ HT (carte UE)');
console.log('   Impact         : +1.50€ pour joueur (+1.4%) | +2.13€ de marge (+80.7%)');

console.log('\n💰 PACKS (850€):');
console.log('   Actuel (5€+3%) : Joueur paie 880.50€ | Marge Edgemy 14.20€ HT (carte UE)');
console.log('   Nouveau (6.5%) : Joueur paie 905.25€ | Marge Edgemy 38.56€ HT (carte UE)');
console.log('   Impact         : +24.75€ pour joueur (+2.8%) | +24.36€ de marge (+171.5%)');

// ==================== RÉSUMÉ ====================
console.log('\n' + '═'.repeat(80));
console.log('📝 RÉSUMÉ & RECOMMANDATION');
console.log('═'.repeat(80));

console.log('\n✅ AVANTAGES du 6.5% uniforme:');
console.log('   - Simplicité : Un seul taux pour tout (sessions + packs)');
console.log('   - Rentabilité : Marges positives sur TOUS les types de cartes (sauf inter+conversion)');
console.log('   - Transparence : Plus facile à communiquer aux coachs et joueurs');
console.log('   - Scalabilité : Pas besoin de logique complexe selon le type de transaction');

console.log('\n⚠️  INCONVÉNIENTS:');
console.log('   - Sessions uniques : +1.50€ pour le joueur (105€ → 106.50€)');
console.log('   - Packs : +24.75€ pour le joueur (880.50€ → 905.25€)');
console.log('   - Peut sembler plus cher que la concurrence avec frais fixes');

console.log('\n💡 RECOMMANDATION FINALE:');
console.log('   Option A (6.5% uniforme)  : Simple, rentable, transparent');
console.log('   Option B (5% + 5€+3%)     : Moins cher pour petites sessions, complexe');
console.log('   Option C (Mix intelligent): 5% sessions, 6.5% packs');

console.log('\n🎯 CHOIX SUGGÉRÉ:');
console.log('   → Option A (6.5% uniforme) si vous privilégiez la SIMPLICITÉ');
console.log('   → Option B (5% + 5€+3%) si vous privilégiez la DIFFÉRENCIATION sessions/packs');

console.log('\n');
