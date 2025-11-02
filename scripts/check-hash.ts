// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkHashes() {
  console.log('🔍 Vérification des formats de hash...\n');

  // Vérifier un user créé par seed-safe
  const coachUser = await prisma.user.findUnique({
    where: { email: 'coach-actif@edgemy.fr' },
    include: { account: true }
  });

  if (coachUser && coachUser.account.length > 0) {
    const hash = coachUser.account[0].password;
    console.log('User seed-safe (coach-actif@edgemy.fr):');
    console.log('  - Hash prefix:', hash?.substring(0, 7));
    console.log('  - Hash length:', hash?.length);
    console.log('  - Full hash:', hash);
    console.log('');
  }

  // Vérifier un user E2E
  const e2eUser = await prisma.user.findUnique({
    where: { email: 'e2e-player@edgemy.test' },
    include: { account: true }
  });

  if (e2eUser && e2eUser.account.length > 0) {
    const hash = e2eUser.account[0].password;
    console.log('User E2E (e2e-player@edgemy.test):');
    console.log('  - Hash prefix:', hash?.substring(0, 7));
    console.log('  - Hash length:', hash?.length);
    console.log('  - Full hash:', hash);
    console.log('');
  }

  await prisma.$disconnect();
}

checkHashes().catch(console.error);
