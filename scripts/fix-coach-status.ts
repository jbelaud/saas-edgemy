/**
 * Script pour corriger le statut des coachs
 * 
 * Usage: npx tsx scripts/fix-coach-status.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCoachStatus() {
  console.log('🔧 Correction des statuts coach...\n');

  // Trouver tous les coachs avec subscriptionStatus ACTIVE mais status INACTIVE
  const coachesToFix = await prisma.coach.findMany({
    where: {
      subscriptionStatus: 'ACTIVE',
      status: 'INACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      subscriptionStatus: true,
    },
  });

  console.log(`📋 ${coachesToFix.length} coach(s) à corriger:\n`);

  for (const coach of coachesToFix) {
    console.log(`  - ${coach.firstName} ${coach.lastName} (${coach.id})`);
    console.log(`    status: ${coach.status} → ACTIVE`);
    console.log(`    subscriptionStatus: ${coach.subscriptionStatus}`);
    
    await prisma.coach.update({
      where: { id: coach.id },
      data: { status: 'ACTIVE' },
    });
    
    console.log(`    ✅ Corrigé!\n`);
  }

  if (coachesToFix.length === 0) {
    console.log('  Aucun coach à corriger.\n');
  }

  // Afficher un résumé de tous les coachs
  console.log('📊 Résumé de tous les coachs:\n');
  
  const allCoaches = await prisma.coach.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      subscriptionStatus: true,
      planKey: true,
      subscriptionPlan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  for (const coach of allCoaches) {
    console.log(`  ${coach.firstName} ${coach.lastName}`);
    console.log(`    ID: ${coach.id}`);
    console.log(`    status: ${coach.status}`);
    console.log(`    subscriptionStatus: ${coach.subscriptionStatus || 'null'}`);
    console.log(`    planKey: ${coach.planKey}`);
    console.log(`    subscriptionPlan: ${coach.subscriptionPlan || 'null'}\n`);
  }

  console.log('✅ Terminé!');
}

fixCoachStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
