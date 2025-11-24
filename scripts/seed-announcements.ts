/**
 * Script pour créer des annonces de test pour les 4 types
 * Usage: npx tsx scripts/seed-announcements.ts
 */

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Création des annonces de test...\n');

  // Récupérer le coach Olivier Belaud
  const olivierCoach = await prisma.coach.findUnique({
    where: { slug: 'olivier-belaud' },
  });

  if (!olivierCoach) {
    console.error('❌ Coach Olivier Belaud non trouvé');
    return;
  }

  console.log(`✅ Coach trouvé: ${olivierCoach.firstName} ${olivierCoach.lastName}`);

  // 1. STRATEGY - NLHE Cash Game
  const strategy1 = await prisma.announcement.upsert({
    where: { id: 'test-strategy-001' },
    update: {
      priceCents: 12000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-strategy-001',
      slug: 'coaching-nlhe-cash-game',
      coachId: olivierCoach.id,
      type: 'STRATEGY',
      title: 'Coaching NLHE Cash Game',
      description: 'Coaching stratégique pour le Cash Game NLHE',
      priceCents: 12000,
      durationMin: 90,
      isActive: true,
      variant: 'NLHE',
      format: 'CASH_GAME',
      abiRange: '100-200',
      tags: ['Postflop', 'GTO', 'Exploitative'],
    },
  });
  console.log(`✅ Créé: ${strategy1.title} (${strategy1.type})`);

  // 2. STRATEGY - PLO MTT
  const strategy2 = await prisma.announcement.upsert({
    where: { id: 'test-strategy-002' },
    update: {
      priceCents: 15000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-strategy-002',
      slug: 'coaching-plo-mtt',
      coachId: olivierCoach.id,
      type: 'STRATEGY',
      title: 'Coaching PLO MTT',
      description: 'Stratégie avancée PLO pour les tournois',
      priceCents: 15000,
      durationMin: 120,
      isActive: true,
      variant: 'PLO',
      format: 'MTT',
      abiRange: '50-100',
      tags: ['Ranges', 'ICM', 'Bubble'],
    },
  });
  console.log(`✅ Créé: ${strategy2.title} (${strategy2.type})`);

  // 3. REVIEW - Session MTT
  const review1 = await prisma.announcement.upsert({
    where: { id: 'test-review-001' },
    update: {
      priceCents: 8000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-review-001',
      slug: 'review-session-mtt',
      coachId: olivierCoach.id,
      type: 'REVIEW',
      title: 'Review de session MTT',
      description: 'Analyse détaillée de votre session MTT',
      priceCents: 8000,
      durationMin: 60,
      isActive: true,
      reviewType: 'SESSION_MTT',
      reviewSupport: 'VIDEO_REPLAY',
      format: 'MTT',
    },
  });
  console.log(`✅ Créé: ${review1.title} (${review1.type})`);

  // 4. REVIEW - Session Cash
  const review2 = await prisma.announcement.upsert({
    where: { id: 'test-review-002' },
    update: {
      priceCents: 9000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-review-002',
      slug: 'review-session-cash-game',
      coachId: olivierCoach.id,
      type: 'REVIEW',
      title: 'Review de session Cash Game',
      description: 'Analyse approfondie de vos sessions Cash Game',
      priceCents: 9000,
      durationMin: 75,
      isActive: true,
      reviewType: 'SESSION_CASH',
      reviewSupport: 'SCREEN_SHARE',
      format: 'CASH_GAME',
    },
  });
  console.log(`✅ Créé: ${review2.title} (${review2.type})`);

  // 5. TOOL - GTO Wizard
  const tool1 = await prisma.announcement.upsert({
    where: { id: 'test-tool-001' },
    update: {
      priceCents: 6000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-tool-001',
      slug: 'formation-gto-wizard',
      coachId: olivierCoach.id,
      type: 'TOOL',
      title: 'Formation GTO Wizard',
      description: 'Prise en main complète de GTO Wizard',
      priceCents: 6000,
      durationMin: 45,
      isActive: true,
      toolName: 'GTO_WIZARD',
      toolObjective: 'ONBOARDING',
    },
  });
  console.log(`✅ Créé: ${tool1.title} (${tool1.type})`);

  // 6. TOOL - Hold'em Manager 3
  const tool2 = await prisma.announcement.upsert({
    where: { id: 'test-tool-002' },
    update: {
      priceCents: 5500,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-tool-002',
      slug: 'formation-holdem-manager-3',
      coachId: olivierCoach.id,
      type: 'TOOL',
      title: 'Formation Hold\'em Manager 3',
      description: 'Maîtrise complète de HM3 pour l\'analyse de votre jeu',
      priceCents: 5500,
      durationMin: 40,
      isActive: true,
      toolName: 'HM3',
      toolObjective: 'ADVANCED',
    },
  });
  console.log(`✅ Créé: ${tool2.title} (${tool2.type})`);

  // 7. MENTAL - Gestion du tilt
  const mental1 = await prisma.announcement.upsert({
    where: { id: 'test-mental-001' },
    update: {
      priceCents: 7000,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-mental-001',
      slug: 'gestion-du-tilt',
      coachId: olivierCoach.id,
      type: 'MENTAL',
      title: 'Gestion du tilt',
      description: 'Session de coaching mental sur la gestion du tilt',
      priceCents: 7000,
      durationMin: 50,
      isActive: true,
      mentalFocus: 'TILT_MANAGEMENT',
    },
  });
  console.log(`✅ Créé: ${mental1.title} (${mental1.type})`);

  // 8. MENTAL - Confiance en soi
  const mental2 = await prisma.announcement.upsert({
    where: { id: 'test-mental-002' },
    update: {
      priceCents: 6500,
      updatedAt: new Date(),
    },
    create: {
      id: 'test-mental-002',
      slug: 'developper-sa-confiance',
      coachId: olivierCoach.id,
      type: 'MENTAL',
      title: 'Développer sa confiance',
      description: 'Boostez votre confiance en vous aux tables',
      priceCents: 6500,
      durationMin: 45,
      isActive: true,
      mentalFocus: 'CONFIDENCE',
    },
  });
  console.log(`✅ Créé: ${mental2.title} (${mental2.type})`);

  // Statistiques
  console.log('\n📊 Statistiques des annonces:');
  const stats = await prisma.announcement.groupBy({
    by: ['type'],
    where: { isActive: true },
    _count: { id: true },
    _min: { priceCents: true },
    _max: { priceCents: true },
  });

  stats.forEach((stat) => {
    const minPrice = stat._min.priceCents ? stat._min.priceCents / 100 : 0;
    const maxPrice = stat._max.priceCents ? stat._max.priceCents / 100 : 0;
    console.log(`  ${stat.type}: ${stat._count.id} annonces (${minPrice}€ - ${maxPrice}€)`);
  });

  console.log('\n✅ Script terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
