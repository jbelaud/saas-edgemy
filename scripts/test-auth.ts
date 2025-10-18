// Script pour tester l'authentification Better Auth
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des comptes dans la base de données...\n');

  // Vérifier les utilisateurs
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'coach-actif@edgemy.fr',
          'coach-inactif@edgemy.fr',
          'coach-pending@edgemy.fr',
          'joueur@edgemy.fr',
        ],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
    },
  });

  console.log('👤 Utilisateurs trouvés:', users.length);
  users.forEach((user) => {
    console.log(`  - ${user.email} (${user.name}) - Vérifié: ${user.emailVerified}`);
  });

  // Vérifier les comptes d'authentification
  const accounts = await prisma.account.findMany({
    where: {
      user: {
        email: {
          in: [
            'coach-actif@edgemy.fr',
            'coach-inactif@edgemy.fr',
            'coach-pending@edgemy.fr',
            'joueur@edgemy.fr',
          ],
        },
      },
    },
    select: {
      id: true,
      userId: true,
      providerId: true,
      password: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log('\n🔐 Comptes d\'authentification trouvés:', accounts.length);
  accounts.forEach((account) => {
    console.log(`  - ${account.user.email}`);
    console.log(`    Provider: ${account.providerId}`);
    console.log(`    Password hash: ${account.password?.substring(0, 20)}...`);
  });

  if (accounts.length === 0) {
    console.log('\n❌ PROBLÈME: Aucun compte d\'authentification trouvé!');
    console.log('   Relancez le seed: pnpm db:seed:safe');
  } else if (accounts.length < 4) {
    console.log('\n⚠️  ATTENTION: Seulement', accounts.length, 'comptes trouvés (attendu: 4)');
  } else {
    console.log('\n✅ Tous les comptes sont présents!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
