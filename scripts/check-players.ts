import { prisma } from '../src/lib/prisma';

async function checkPlayers() {
  console.log('🔍 Vérification des joueurs dans la base de données...\n');

  // Vérifier les users avec role PLAYER
  const usersWithPlayerRole = await prisma.user.count({ where: { role: 'PLAYER' } });
  console.log('✅ Users avec role PLAYER:', usersWithPlayerRole);

  // Vérifier les profils player
  const playerProfiles = await prisma.player.count();
  console.log('✅ Profils player existants:', playerProfiles);

  // Vérifier les users qui ont un profil player
  const usersWithPlayerProfile = await prisma.user.count({
    where: { player: { isNot: null } }
  });
  console.log('✅ Users avec profil player:', usersWithPlayerProfile);

  // Lister quelques exemples
  const examples = await prisma.user.findMany({
    where: { player: { isNot: null } },
    include: { player: true },
    take: 5
  });

  console.log('\n📋 Exemples de joueurs:');
  if (examples.length === 0) {
    console.log('❌ Aucun joueur trouvé !');
    console.log('\n💡 Pour créer un joueur de test:');
    console.log('   1. Créez un compte via l\'interface (Sign up)');
    console.log('   2. OU utilisez le seed: pnpm exec prisma db seed');
  } else {
    examples.forEach(u => {
      console.log(`   - ${u.email} (role: ${u.role}, name: ${u.player?.firstName || 'N/A'})`);
    });
  }

  await prisma.$disconnect();
}

checkPlayers()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
