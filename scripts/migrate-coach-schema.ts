import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migration du schéma coach...');

  try {
    // 1. Supprimer les anciennes lignes coach (si elles existent)
    const deletedCoaches = await prisma.coach.deleteMany({});
    console.log(`✅ ${deletedCoaches.count} ancien(s) coach(s) supprimé(s)`);

    // 2. Maintenant on peut faire le push
    console.log('✅ Migration terminée ! Vous pouvez maintenant faire : pnpm prisma db push');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
