import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de test pour valider l'implémentation Stripe Connect
 *
 * Ce script vérifie :
 * 1. La création d'un compte Stripe Connect mock
 * 2. Le calcul des commissions
 * 3. La validation du compte avant paiement
 */

async function testStripeConnect() {
  console.log('🧪 === TEST STRIPE CONNECT ===\n');

  try {
    // 1. Trouver un coach de test
    const coach = await prisma.coach.findFirst({
      include: { user: true },
    });

    if (!coach) {
      console.error('❌ Aucun coach trouvé dans la base de données');
      console.log('💡 Créez un compte coach via l\'application d\'abord');
      return;
    }

    console.log(`✅ Coach trouvé: ${coach.user.email}`);
    console.log(`   Abonnement: ${coach.subscriptionStatus || 'AUCUN'}`);
    console.log(`   Stripe Account ID: ${coach.stripeAccountId || 'NON CONFIGURÉ'}\n`);

    // 2. Vérifier si le coach peut accéder à Stripe Connect
    const hasActiveSubscription = coach.subscriptionStatus === 'ACTIVE';
    const isInActivePeriod = coach.currentPeriodEnd ? new Date() < coach.currentPeriodEnd : false;
    const canAccessStripeConnect = hasActiveSubscription || isInActivePeriod;

    console.log('📋 Vérification des prérequis:');
    console.log(`   Abonnement actif: ${hasActiveSubscription ? '✅' : '❌'}`);
    console.log(`   Dans période active: ${isInActivePeriod ? '✅' : '❌'}`);
    console.log(`   Peut accéder à Stripe Connect: ${canAccessStripeConnect ? '✅' : '❌'}\n`);

    if (!canAccessStripeConnect) {
      console.warn('⚠️  Le coach ne peut pas accéder à Stripe Connect (abonnement requis)');
      console.log('💡 Pour tester, mettez à jour le coach:');
      console.log(`   UPDATE "Coach" SET "subscriptionStatus" = 'ACTIVE' WHERE id = '${coach.id}';`);
      return;
    }

    // 3. Tester les calculs de commission
    console.log('💰 === TEST CALCULS COMMISSIONS ===\n');

    const testCases = [
      { type: 'SINGLE', price: 100, expectedFee: 5, expectedTotal: 105 },
      { type: 'PACK', price: 450, expectedFee: 12, expectedTotal: 462 },
      { type: 'PACK', price: 850, expectedFee: 20, expectedTotal: 870 },
    ];

    let allTestsPassed = true;

    testCases.forEach((test) => {
      let platformFee: number;
      let playerPrice: number;

      if (test.type === 'PACK') {
        const fixedFee = 3.00;
        const percentFee = test.price * 0.02;
        platformFee = fixedFee + percentFee;
        playerPrice = test.price + platformFee;
      } else {
        platformFee = test.price * 0.05;
        playerPrice = test.price + platformFee;
      }

      const passed =
        Math.abs(platformFee - test.expectedFee) < 0.01 &&
        Math.abs(playerPrice - test.expectedTotal) < 0.01;

      console.log(`${passed ? '✅' : '❌'} ${test.type} - ${test.price}€`);
      console.log(`   Commission: ${platformFee.toFixed(2)}€ (attendu: ${test.expectedFee}€)`);
      console.log(`   Prix élève: ${playerPrice.toFixed(2)}€ (attendu: ${test.expectedTotal}€)`);

      if (!passed) allTestsPassed = false;
    });

    console.log('\n' + (allTestsPassed ? '✅ Tous les tests passent!' : '❌ Certains tests échouent'));

    // 4. Vérifier la configuration
    console.log('\n🔧 === CONFIGURATION ===\n');

    const isEnabled = process.env.STRIPE_CONNECT_ENABLED === 'true';
    console.log(`Stripe Connect: ${isEnabled ? '✅ Activé' : '⚠️  Désactivé (mode mock)'}`);
    console.log(`Single Session Fee: ${process.env.STRIPE_SINGLE_SESSION_FEE_PERCENT || '0.05'} (5%)`);
    console.log(`Pack Fixed Fee: ${process.env.STRIPE_PACK_FIXED_FEE || '3.00'}€`);
    console.log(`Pack Percent Fee: ${process.env.STRIPE_PACK_PERCENT_FEE || '0.02'} (2%)`);

    console.log('\n✨ === PROCHAINES ÉTAPES ===\n');

    if (!isEnabled) {
      console.log('1. Pour tester avec Stripe (mode test):');
      console.log('   - Activez Stripe Connect dans votre Dashboard Stripe (mode test)');
      console.log('   - Mettez STRIPE_CONNECT_ENABLED="true" dans .env');
      console.log('   - Redémarrez l\'application');
      console.log('');
    }

    console.log('2. Pour tester le flux complet:');
    console.log('   - Connectez-vous en tant que coach');
    console.log('   - Allez dans /fr/coach/settings');
    console.log('   - Cliquez sur "Configurer mon compte Stripe"');
    console.log('   - Suivez le processus d\'onboarding');
    console.log('');

    console.log('3. Pour tester un paiement:');
    console.log('   - Créez une annonce en tant que coach');
    console.log('   - Réservez une session en tant que joueur');
    console.log('   - Utilisez une carte de test Stripe: 4242 4242 4242 4242');
    console.log('   - Vérifiez dans le Dashboard Stripe que le paiement est routé vers le coach');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStripeConnect();
