/**
 * Script de test des calculs de pricing avec différents types de cartes
 *
 * Frais Stripe selon le type de carte:
 * - Cartes UE/françaises : 1.5% + 0.25€
 * - Cartes britanniques : 2.5% + 0.25€
 * - Cartes internationales : 3.25% + 0.25€
 * - Conversion de devises : +2% supplémentaire
 */

import { calculateForSession, calculateForPack } from '../src/lib/stripe/pricing';

// Types de cartes et leurs frais
type CardType = {
  name: string;
  percentFee: number;  // En décimal (0.015 = 1.5%)
  fixedFeeCents: number;
  currency: string;
  hasCurrencyConversion?: boolean;
};

const CARD_TYPES: Record<string, CardType> = {
  EU: {
    name: 'Carte française/UE',
    percentFee: 0.015,  // 1.5%
    fixedFeeCents: 25,   // 0.25€
    currency: 'EUR',
  },
  UK: {
    name: 'Carte britannique',
    percentFee: 0.025,  // 2.5%
    fixedFeeCents: 25,   // 0.25€
    currency: 'EUR',
  },
  INTERNATIONAL: {
    name: 'Carte internationale',
    percentFee: 0.0325, // 3.25%
    fixedFeeCents: 25,   // 0.25€
    currency: 'EUR',
  },
  UK_WITH_CONVERSION: {
    name: 'Carte britannique + conversion',
    percentFee: 0.045,  // 2.5% + 2% = 4.5%
    fixedFeeCents: 25,   // 0.25€
    currency: 'GBP→EUR',
    hasCurrencyConversion: true,
  },
  INTERNATIONAL_WITH_CONVERSION: {
    name: 'Carte internationale + conversion',
    percentFee: 0.0525, // 3.25% + 2% = 5.25%
    fixedFeeCents: 25,   // 0.25€
    currency: 'USD→EUR',
    hasCurrencyConversion: true,
  },
};

// Fonction pour calculer les frais Stripe personnalisés
function calculateStripeFee(totalCents: number, cardType: CardType): number {
  const percentFee = totalCents * cardType.percentFee;
  const totalFee = percentFee + cardType.fixedFeeCents;
  return Math.round(totalFee);
}

// Fonction pour calculer manuellement avec un type de carte spécifique
function calculateSessionWithCard(priceCents: number, cardType: CardType) {
  const coachNetCents = priceCents;
  const serviceFeeCents = Math.round(priceCents * 0.05); // 5%
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  const stripeFeeCents = calculateStripeFee(totalCustomerCents, cardType);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - stripeFeeCents);

  // TVA
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

console.log('🧪 TEST DES CALCULS DE PRICING - TOUS TYPES DE CARTES\n');
console.log('═'.repeat(80));

// Test pour chaque type de carte
Object.entries(CARD_TYPES).forEach(([key, cardType]) => {
  console.log(`\n📊 TEST: Session 100€ avec ${cardType.name}`);
  console.log('─'.repeat(80));

  const result = calculateSessionWithCard(10000, cardType);

  console.log(`Type de carte                 : ${cardType.name}`);
  console.log(`Devise                        : ${cardType.currency}`);
  console.log(`Frais Stripe                  : ${(cardType.percentFee * 100).toFixed(2)}% + ${(cardType.fixedFeeCents / 100).toFixed(2)}€`);
  if (cardType.hasCurrencyConversion) {
    console.log(`⚠️  Inclut conversion devise    : +2%`);
  }
  console.log(``);
  console.log(`Prix coach (base)             : ${(result.coachNetCents / 100).toFixed(2)}€`);
  console.log(`Frais joueur (5%)             : ${(result.serviceFeeCents / 100).toFixed(2)}€`);
  console.log(`Total payé joueur             : ${(result.totalCustomerCents / 100).toFixed(2)}€`);
  console.log(`---`);
  console.log(`Frais Stripe                  : ${(result.stripeFeeCents / 100).toFixed(2)}€`);
  console.log(`Marge Edgemy TTC              : ${(result.edgemyFeeCents / 100).toFixed(2)}€`);
  console.log(`  dont HT                     : ${(result.edgemyRevenueHT / 100).toFixed(2)}€`);
  console.log(`  dont TVA (20%)              : ${(result.edgemyRevenueTVACents / 100).toFixed(2)}€`);

  // Analyse de rentabilité
  const marginPercent = (result.edgemyFeeCents / result.totalCustomerCents) * 100;
  console.log(`---`);
  if (result.edgemyFeeCents > 0) {
    console.log(`✅ Marge positive              : ${marginPercent.toFixed(2)}% du total`);
  } else if (result.edgemyFeeCents === 0) {
    console.log(`⚠️  Marge nulle                : Edgemy ne gagne rien`);
  } else {
    console.log(`❌ Marge NÉGATIVE              : ${marginPercent.toFixed(2)}% (PERTE)`);
  }
});

// Comparaison des marges
console.log('\n' + '═'.repeat(80));
console.log('📊 COMPARAISON DES MARGES EDGEMY (Session 100€)');
console.log('═'.repeat(80));

const comparisons = Object.entries(CARD_TYPES).map(([key, cardType]) => {
  const result = calculateSessionWithCard(10000, cardType);
  return {
    name: cardType.name,
    stripeFee: result.stripeFeeCents,
    edgemyFee: result.edgemyFeeCents,
    edgemyHT: result.edgemyRevenueHT,
    marginPercent: (result.edgemyFeeCents / result.totalCustomerCents) * 100,
  };
});

// Trier par marge décroissante
comparisons.sort((a, b) => b.edgemyFee - a.edgemyFee);

comparisons.forEach((comp, index) => {
  const icon = comp.edgemyFee > 0 ? '✅' : comp.edgemyFee === 0 ? '⚠️' : '❌';
  console.log(`${index + 1}. ${comp.name.padEnd(35)} | Stripe: ${(comp.stripeFee / 100).toFixed(2)}€ | Edgemy: ${(comp.edgemyFee / 100).toFixed(2)}€ (HT: ${(comp.edgemyHT / 100).toFixed(2)}€) | ${comp.marginPercent.toFixed(2)}% ${icon}`);
});

// Tests avec petits montants
console.log('\n' + '═'.repeat(80));
console.log('📊 TEST: Session 30€ (petit montant) avec différentes cartes');
console.log('═'.repeat(80));

const smallAmountTests = Object.entries(CARD_TYPES).map(([key, cardType]) => {
  const result = calculateSessionWithCard(3000, cardType);
  return {
    name: cardType.name,
    stripeFee: result.stripeFeeCents,
    edgemyFee: result.edgemyFeeCents,
    totalPaid: result.totalCustomerCents,
    marginPercent: (result.edgemyFeeCents / result.totalCustomerCents) * 100,
  };
});

smallAmountTests.forEach((test) => {
  const status = test.edgemyFee > 0 ? '✅ Rentable' : test.edgemyFee === 0 ? '⚠️  Seuil' : '❌ PERTE';
  console.log(`${test.name.padEnd(35)} | Payé: ${(test.totalPaid / 100).toFixed(2)}€ | Stripe: ${(test.stripeFee / 100).toFixed(2)}€ | Edgemy: ${(test.edgemyFee / 100).toFixed(2)}€ | ${status}`);
});

// Recommandations
console.log('\n' + '═'.repeat(80));
console.log('📝 RECOMMANDATIONS');
console.log('═'.repeat(80));

// Trouver le montant minimum rentable pour chaque type de carte
console.log('\n💡 Montants minimums recommandés pour garantir une marge positive:\n');

Object.entries(CARD_TYPES).forEach(([key, cardType]) => {
  // Chercher le montant minimum où edgemyFee > 0
  let minAmount = 1000; // Commencer à 10€
  let found = false;

  for (let amount = minAmount; amount <= 10000; amount += 100) {
    const result = calculateSessionWithCard(amount, cardType);
    if (result.edgemyFeeCents > 0) {
      minAmount = amount;
      found = true;
      break;
    }
  }

  if (found) {
    console.log(`   ${cardType.name.padEnd(35)} : >= ${(minAmount / 100).toFixed(2)}€`);
  } else {
    console.log(`   ${cardType.name.padEnd(35)} : ⚠️  Difficile d'être rentable`);
  }
});

// Résumé final
console.log('\n' + '═'.repeat(80));
console.log('📝 RÉSUMÉ');
console.log('═'.repeat(80));

const hasNegativeMargins = comparisons.some(c => c.edgemyFee < 0);
const hasZeroMargins = comparisons.some(c => c.edgemyFee === 0);

if (hasNegativeMargins) {
  console.log('\n❌ ATTENTION: Certains types de cartes génèrent des PERTES');
  console.log('   → Considérer un montant minimum ou ajuster les frais de service');
} else if (hasZeroMargins) {
  console.log('\n⚠️  ATTENTION: Certains types de cartes ne génèrent aucune marge');
  console.log('   → Considérer un ajustement des frais de service');
} else {
  console.log('\n✅ Tous les types de cartes sont rentables pour ce montant');
}

console.log('\n💡 Points clés:');
console.log('   - Cartes UE/françaises: Les plus rentables (frais 1.5%)');
console.log('   - Cartes britanniques: Rentables mais marge réduite (frais 2.5%)');
console.log('   - Cartes internationales: Marge faible (frais 3.25%)');
console.log('   - Avec conversion devise: Marge très faible ou négative (frais +2%)');

console.log('\n');
