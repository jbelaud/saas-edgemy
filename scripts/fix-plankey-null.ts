/**
 * Script pour mettre planKey à null pour les coachs sans abonnement
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPlanKey() {
  const result = await prisma.coach.updateMany({
    where: { subscriptionStatus: null },
    data: { planKey: null },
  });
  
  console.log(`✅ Mis à jour: ${result.count} coach(s) avec planKey: null`);
}

fixPlanKey()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
