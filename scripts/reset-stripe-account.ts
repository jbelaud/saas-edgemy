import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetStripeAccount() {
  try {
    const email = process.argv[2] || 'harmonie.meron@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      include: { coach: true },
    });

    if (!user || !user.coach) {
      console.error(`❌ Aucun coach trouvé pour l'email: ${email}`);
      return;
    }

    await prisma.coach.update({
      where: { id: user.coach.id },
      data: { stripeAccountId: null },
    });

    console.log(`✅ Compte Stripe réinitialisé pour ${email}`);
    console.log(`   Coach ID: ${user.coach.id}`);
    console.log(`   Ancien stripeAccountId: ${user.coach.stripeAccountId || 'null'}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetStripeAccount();
