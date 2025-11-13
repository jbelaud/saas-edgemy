import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkExistingStripeAccount() {
  try {
    const email = process.argv[2] || 'harmonie.meron@gmail.com';
    const stripeAccountId = process.argv[3];

    if (!stripeAccountId) {
      console.error('❌ Erreur: Vous devez fournir un ID de compte Stripe');
      console.log('\nUsage:');
      console.log('  npx tsx scripts/link-existing-stripe-account.ts <email> <stripe_account_id>');
      console.log('\nExemple:');
      console.log('  npx tsx scripts/link-existing-stripe-account.ts harmonie.meron@gmail.com acct_1234567890');
      return;
    }

    if (!stripeAccountId.startsWith('acct_')) {
      console.error('❌ Erreur: L\'ID du compte Stripe doit commencer par "acct_"');
      console.log(`   Vous avez fourni: ${stripeAccountId}`);
      return;
    }

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
      data: { stripeAccountId },
    });

    console.log(`✅ Compte Stripe lié avec succès !`);
    console.log(`   Coach: ${email}`);
    console.log(`   Coach ID: ${user.coach.id}`);
    console.log(`   Stripe Account ID: ${stripeAccountId}`);
    console.log('\n💡 Le coach peut maintenant recevoir des paiements directement sur ce compte Stripe.');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkExistingStripeAccount();
