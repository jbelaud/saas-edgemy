const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCoach() {
  try {
    const coachId = 'cmhv2cleb0003uyvs9xacware';

    console.log('=== DEBUG COACH STRIPE ACCOUNT ===\n');

    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!coach) {
      console.log('❌ Coach non trouvé');
      return;
    }

    console.log('Coach ID:', coach.id);
    console.log('User ID:', coach.userId);
    console.log('Email:', coach.user.email);
    console.log('Nom:', `${coach.firstName} ${coach.lastName}`);
    console.log('');
    console.log('=== STRIPE CONNECT ===');
    console.log('Stripe Account ID:', coach.stripeAccountId);
    console.log('Is Onboarded:', coach.isOnboarded);
    console.log('Status:', coach.status);
    console.log('');
    console.log('=== ABONNEMENT ===');
    console.log('Plan Key:', coach.planKey);
    console.log('Subscription ID:', coach.subscriptionId);
    console.log('Subscription Status:', coach.subscriptionStatus);
    console.log('Current Period End:', coach.currentPeriodEnd);
    console.log('');
    console.log('=== VÉRIFICATION COMPTE MOCK ===');
    console.log('Commence par acct_mock_?', coach.stripeAccountId?.startsWith('acct_mock_'));
    console.log('Est un compte réel Stripe?', coach.stripeAccountId?.startsWith('acct_') && !coach.stripeAccountId?.startsWith('acct_mock_'));

    // Vérifier la réservation
    console.log('\n=== RÉSERVATIONS ===');
    const reservations = await prisma.reservation.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        priceCents: true,
        coachNetCents: true,
        stripeFeeCents: true,
        edgemyFeeCents: true,
        stripePaymentId: true,
        transferStatus: true,
        createdAt: true,
      }
    });

    console.log(`Nombre de réservations: ${reservations.length}`);
    reservations.forEach((res, i) => {
      console.log(`\n--- Réservation ${i + 1} ---`);
      console.log('ID:', res.id);
      console.log('Status:', res.status);
      console.log('Payment Status:', res.paymentStatus);
      console.log('Prix:', (res.priceCents / 100).toFixed(2), '€');
      console.log('Coach Net:', (res.coachNetCents / 100).toFixed(2), '€');
      console.log('Stripe Payment ID:', res.stripePaymentId);
      console.log('Transfer Status:', res.transferStatus);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCoach();
