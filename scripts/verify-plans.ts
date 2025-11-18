import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des plans...\n');

  // Récupérer tous les plans
  const plans = await prisma.plan.findMany({
    orderBy: { key: 'asc' },
  });

  if (plans.length === 0) {
    console.log('❌ Aucun plan trouvé dans la base de données');
    return;
  }

  console.log(`✅ ${plans.length} plan(s) trouvé(s):\n`);

  plans.forEach((plan) => {
    console.log(`📊 Plan ${plan.key}:`);
    console.log(`   Nom: ${plan.name}`);
    console.log(`   Mensuel: ${plan.monthlyPrice / 100}€`);
    console.log(`   Annuel: ${plan.yearlyPrice / 100}€`);
    console.log(`   Stripe: ${plan.requiresStripe ? 'Oui' : 'Non'}`);
    console.log(`   Actif: ${plan.isActive ? 'Oui' : 'Non'}`);
    console.log('');
  });

  // Vérifier les coachs
  const coachStats = await prisma.coach.groupBy({
    by: ['planKey'],
    _count: true,
  });

  console.log('👥 Distribution des coachs par plan:');
  coachStats.forEach((stat) => {
    console.log(`   ${stat.planKey}: ${stat._count} coach(es)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
