import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanMockStripeAccounts() {
  try {
    const result = await prisma.coach.updateMany({
      where: {
        stripeAccountId: {
          startsWith: 'acct_mock_',
        },
      },
      data: {
        stripeAccountId: null,
      },
    });

    console.log(`✅ ${result.count} compte(s) mock Stripe supprimé(s)`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanMockStripeAccounts();
