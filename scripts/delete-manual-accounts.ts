// Script pour supprimer les comptes d'authentification créés manuellement
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Suppression des comptes d\'authentification manuels...\n');

  // Supprimer tous les comptes d'authentification
  const deleted = await prisma.account.deleteMany({
    where: {
      providerId: 'credential',
    },
  });

  console.log(`✅ ${deleted.count} comptes supprimés`);
  console.log('\n📝 Maintenant, inscrivez-vous via l\'interface pour créer un compte:');
  console.log('   1. Allez sur http://localhost:3000');
  console.log('   2. Cliquez sur "S\'inscrire"');
  console.log('   3. Créez un compte avec:');
  console.log('      Email: test@edgemy.fr');
  console.log('      Password: Password123!');
  console.log('\nOu utilisez Google OAuth pour vous connecter.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
