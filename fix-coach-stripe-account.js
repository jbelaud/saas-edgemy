const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCoachAccount() {
  const coachId = 'cmhv2cleb0003uyvs9xacware';
  const realStripeAccountId = 'acct_1SSkTd2dZ7wpKq4w';

  try {
    console.log('🔧 Correction du compte Stripe du coach...\n');

    // Vérifier l'état actuel
    const currentCoach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        stripeAccountId: true,
        isOnboarded: true,
        status: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!currentCoach) {
      console.error('❌ Coach non trouvé');
      return;
    }

    console.log('📋 État actuel:');
    console.log('  Nom:', `${currentCoach.firstName} ${currentCoach.lastName}`);
    console.log('  Stripe Account ID:', currentCoach.stripeAccountId);
    console.log('  Is Onboarded:', currentCoach.isOnboarded);
    console.log('  Status:', currentCoach.status);
    console.log('');

    // Confirmer la mise à jour
    console.log('🔄 Mise à jour vers:');
    console.log('  Stripe Account ID:', realStripeAccountId);
    console.log('  Is Onboarded: true');
    console.log('  Status: ACTIVE');
    console.log('');

    // Effectuer la mise à jour
    const updated = await prisma.coach.update({
      where: { id: coachId },
      data: {
        stripeAccountId: realStripeAccountId,
        isOnboarded: true,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Coach mis à jour avec succès !');
    console.log('');
    console.log('📋 Nouvel état:');
    console.log('  ID:', updated.id);
    console.log('  Stripe Account ID:', updated.stripeAccountId);
    console.log('  Is Onboarded:', updated.isOnboarded);
    console.log('  Status:', updated.status);
    console.log('');
    console.log('🎯 Prochaine étape: Exécuter verify-stripe-account.js');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCoachAccount().catch(console.error);
