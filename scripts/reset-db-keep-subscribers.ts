import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Reset de la base de données (en gardant les subscribers)...\n');

  try {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    
    console.log('📋 Suppression des réservations...');
    await prisma.reservation.deleteMany({});
    
    console.log('📅 Suppression des disponibilités...');
    await prisma.availability.deleteMany({});
    
    console.log('📢 Suppression des annonces...');
    await prisma.announcement.deleteMany({});
    
    console.log('🎓 Suppression des profils coachs...');
    await prisma.coach.deleteMany({});
    
    console.log('📝 Suppression des brouillons coachs...');
    await prisma.coachDraft.deleteMany({});
    
    console.log('🎮 Suppression des profils joueurs...');
    await prisma.player.deleteMany({});
    
    console.log('🔐 Suppression des sessions...');
    await prisma.session.deleteMany({});
    
    console.log('🔗 Suppression des comptes liés...');
    await prisma.account.deleteMany({});
    
    console.log('👤 Suppression des utilisateurs...');
    await prisma.user.deleteMany({});
    
    console.log('🔑 Suppression des vérifications...');
    await prisma.verification.deleteMany({});
    
    // On garde les subscribers !
    const subscriberCount = await prisma.subscriber.count();
    console.log(`✅ Subscribers conservés : ${subscriberCount}`);
    
    console.log('\n✨ Reset terminé avec succès !');
    console.log('💡 Vous pouvez maintenant lancer : pnpm prisma db seed');
    
  } catch (error) {
    console.error('❌ Erreur lors du reset :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
