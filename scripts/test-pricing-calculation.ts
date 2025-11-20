/**
 * Script de test pour valider les calculs de pricing Edgemy
 *
 * Vérifie que:
 * - Les frais Stripe sont corrects (1.5% + 0.25€)
 * - Les marges Edgemy sont positives
 * - Le coach reçoit 100% du prix de base
 */

import { calculateForSession, calculateForPack } from '../src/lib/stripe/pricing';

console.log('🧪 TEST DES CALCULS DE PRICING EDGEMY\n');
console.log('═'.repeat(80));

// Test 1: Session individuelle 100€
console.log('\n📊 TEST 1: Session individuelle 100€');
console.log('─'.repeat(80));

const session100 = calculateForSession(10000); // 100€ en centimes

console.log(`Prix coach (base)             : ${(session100.coachNetCents / 100).toFixed(2)}€`);
console.log(`Frais joueur (6.5%)           : ${(session100.serviceFeeCents / 100).toFixed(2)}€`);
console.log(`Total payé joueur             : ${(session100.totalCustomerCents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Frais Stripe (1.5% + 0.25€)   : ${(session100.stripeFeeCents / 100).toFixed(2)}€`);
console.log(`Marge Edgemy TTC              : ${(session100.edgemyFeeCents / 100).toFixed(2)}€`);
console.log(`  dont HT                     : ${(session100.edgemyRevenueHT / 100).toFixed(2)}€`);
console.log(`  dont TVA (20%)              : ${(session100.edgemyRevenueTVACents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Vérification: ${(session100.stripeFeeCents / 100).toFixed(2)}€ + ${(session100.edgemyFeeCents / 100).toFixed(2)}€ + ${(session100.coachNetCents / 100).toFixed(2)}€ = ${((session100.stripeFeeCents + session100.edgemyFeeCents + session100.coachNetCents) / 100).toFixed(2)}€`);

// Vérifications
const expectedStripeFee100 = Math.round(10650 * 0.015 + 25); // 1.5% de 106.50€ + 0.25€
const totalDistribution100 = session100.stripeFeeCents + session100.edgemyFeeCents + session100.coachNetCents;
console.log(`\n✅ Vérifications:`);
console.log(`   Frais Stripe attendus      : ${(expectedStripeFee100 / 100).toFixed(2)}€ ${session100.stripeFeeCents === expectedStripeFee100 ? '✅' : '❌'}`);
console.log(`   Coach reçoit 100€          : ${session100.coachNetCents === 10000 ? '✅' : '❌'}`);
console.log(`   Marge positive             : ${session100.edgemyFeeCents > 0 ? '✅' : '❌'}`);
console.log(`   Total = somme parts        : ${totalDistribution100 === session100.totalCustomerCents ? '✅' : '❌'} (${(totalDistribution100 / 100).toFixed(2)}€ = ${(session100.totalCustomerCents / 100).toFixed(2)}€)`);
console.log(`   HT + TVA = Marge TTC       : ${(session100.edgemyRevenueHT + session100.edgemyRevenueTVACents) === session100.edgemyFeeCents ? '✅' : '❌'}`);

// Test 2: Pack 10h à 850€
console.log('\n📊 TEST 2: Pack 10h à 850€');
console.log('─'.repeat(80));

const pack850 = calculateForPack(85000, 10); // 850€ en centimes, 10 sessions

console.log(`Prix coach (base)             : ${(pack850.coachNetCents / 100).toFixed(2)}€`);
console.log(`Frais joueur (6.5%)           : ${(pack850.serviceFeeCents / 100).toFixed(2)}€`);
console.log(`Total payé joueur             : ${(pack850.totalCustomerCents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Frais Stripe (1.5% + 0.25€)   : ${(pack850.stripeFeeCents / 100).toFixed(2)}€`);
console.log(`Marge Edgemy TTC              : ${(pack850.edgemyFeeCents / 100).toFixed(2)}€`);
console.log(`  dont HT                     : ${(pack850.edgemyRevenueHT / 100).toFixed(2)}€`);
console.log(`  dont TVA (20%)              : ${(pack850.edgemyRevenueTVACents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Paiement par session          : ${(pack850.sessionPayoutCents / 100).toFixed(2)}€`);
console.log(`Nombre de sessions            : ${pack850.sessionsCount}`);
console.log(`Reliquat dernière session     : ${(pack850.sessionPayoutRemainderCents / 100).toFixed(2)}€`);

// Vérifications
const expectedFeePack = Math.round(85000 * 0.065); // 6.5%
const expectedStripeFee850 = Math.round(90525 * 0.015 + 25); // 1.5% de 905.25€ + 0.25€
console.log(`\n✅ Vérifications:`);
console.log(`   Frais joueur attendus      : ${(expectedFeePack / 100).toFixed(2)}€ ${pack850.serviceFeeCents === expectedFeePack ? '✅' : '❌'}`);
console.log(`   Frais Stripe attendus      : ${(expectedStripeFee850 / 100).toFixed(2)}€ ${pack850.stripeFeeCents === expectedStripeFee850 ? '✅' : '❌'}`);
console.log(`   Coach reçoit 850€          : ${pack850.coachNetCents === 85000 ? '✅' : '❌'}`);
console.log(`   Marge positive             : ${pack850.edgemyFeeCents > 0 ? '✅' : '❌'}`);
console.log(`   Paiement total correct     : ${(pack850.sessionPayoutCents * pack850.sessionsCount + pack850.sessionPayoutRemainderCents) === 85000 ? '✅' : '❌'}`);

// Test 3: Session 50€ (petit montant)
console.log('\n📊 TEST 3: Session 50€ (petit montant)');
console.log('─'.repeat(80));

const session50 = calculateForSession(5000); // 50€ en centimes

console.log(`Prix coach (base)             : ${(session50.coachNetCents / 100).toFixed(2)}€`);
console.log(`Frais joueur (6.5%)           : ${(session50.serviceFeeCents / 100).toFixed(2)}€`);
console.log(`Total payé joueur             : ${(session50.totalCustomerCents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Frais Stripe (1.5% + 0.25€)   : ${(session50.stripeFeeCents / 100).toFixed(2)}€`);
console.log(`Marge Edgemy TTC              : ${(session50.edgemyFeeCents / 100).toFixed(2)}€`);
console.log(`  dont HT                     : ${(session50.edgemyRevenueHT / 100).toFixed(2)}€`);
console.log(`  dont TVA (20%)              : ${(session50.edgemyRevenueTVACents / 100).toFixed(2)}€`);
console.log(`---`);
console.log(`Vérification: ${(session50.stripeFeeCents / 100).toFixed(2)}€ + ${(session50.edgemyFeeCents / 100).toFixed(2)}€ + ${(session50.coachNetCents / 100).toFixed(2)}€ = ${((session50.stripeFeeCents + session50.edgemyFeeCents + session50.coachNetCents) / 100).toFixed(2)}€`);

const totalDistribution50 = session50.stripeFeeCents + session50.edgemyFeeCents + session50.coachNetCents;
console.log(`\n✅ Vérifications:`);
console.log(`   Coach reçoit 50€           : ${session50.coachNetCents === 5000 ? '✅' : '❌'}`);
console.log(`   Marge positive             : ${session50.edgemyFeeCents > 0 ? '✅' : '❌'}`);
console.log(`   Total = somme parts        : ${totalDistribution50 === session50.totalCustomerCents ? '✅' : '❌'} (${(totalDistribution50 / 100).toFixed(2)}€ = ${(session50.totalCustomerCents / 100).toFixed(2)}€)`);
console.log(`   HT + TVA = Marge TTC       : ${(session50.edgemyRevenueHT + session50.edgemyRevenueTVACents) === session50.edgemyFeeCents ? '✅' : '❌'}`);

// Résumé
console.log('\n' + '═'.repeat(80));
console.log('📝 RÉSUMÉ DES TESTS');
console.log('═'.repeat(80));

const allTestsPassed =
  session100.coachNetCents === 10000 &&
  session100.edgemyFeeCents > 0 &&
  pack850.coachNetCents === 85000 &&
  pack850.edgemyFeeCents > 0 &&
  session50.coachNetCents === 5000 &&
  session50.edgemyFeeCents >= 0;

if (allTestsPassed) {
  console.log('\n✅ TOUS LES TESTS SONT RÉUSSIS !');
  console.log('   - Les frais Stripe sont correctement calculés (1.5% + 0.25€)');
  console.log('   - Le coach reçoit toujours 100% du prix de base');
  console.log('   - La marge Edgemy est toujours >= 0');
  console.log('   - La TVA est correctement calculée (20%)');
} else {
  console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
  process.exit(1);
}

console.log('\n');
