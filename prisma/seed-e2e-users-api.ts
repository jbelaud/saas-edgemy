// @ts-nocheck
import { PrismaClient, Role } from '@prisma/client';
import { auth } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Création des utilisateurs de test E2E via API Better Auth...\n');

  // Credentials pour les tests E2E
  const testPassword = 'TestE2E@2024!';

  // Supprimer les utilisateurs E2E existants
  console.log('🧹 Suppression des comptes de test E2E existants...');

  await prisma.account.deleteMany({
    where: {
      user: {
        email: {
          in: ['e2e-player@edgemy.test', 'e2e-coach@edgemy.test', 'e2e-admin@edgemy.test'],
        },
      },
    },
  });

  await prisma.coach.deleteMany({
    where: {
      user: {
        email: 'e2e-coach@edgemy.test',
      },
    },
  });

  await prisma.player.deleteMany({
    where: {
      user: {
        email: 'e2e-player@edgemy.test',
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['e2e-player@edgemy.test', 'e2e-coach@edgemy.test', 'e2e-admin@edgemy.test'],
      },
    },
  });

  console.log('✅ Nettoyage terminé\n');

  // 1. Créer utilisateur PLAYER via API Better Auth
  console.log('👤 Création du joueur de test via Better Auth API...');
  const playerResult = await auth.api.signUpEmail({
    body: {
      email: 'e2e-player@edgemy.test',
      password: testPassword,
      name: 'E2E Test Player',
    },
  });

  if (playerResult && playerResult.user) {
    // Créer le profil player
    await prisma.player.create({
      data: {
        userId: playerResult.user.id,
      },
    });

    console.log('✅ Joueur de test créé : e2e-player@edgemy.test / TestE2E@2024!');
  } else {
    console.error('❌ Erreur lors de la création du joueur');
  }

  // 2. Créer utilisateur COACH via API Better Auth
  console.log('🎓 Création du coach de test via Better Auth API...');
  const coachResult = await auth.api.signUpEmail({
    body: {
      email: 'e2e-coach@edgemy.test',
      password: testPassword,
      name: 'E2E Test Coach',
    },
  });

  if (coachResult && coachResult.user) {
    // Créer le profil coach
    await prisma.coach.create({
      data: {
        userId: coachResult.user.id,
        slug: 'e2e-test-coach',
        firstName: 'E2E',
        lastName: 'Test Coach',
        bio: 'Coach de test pour E2E',
        status: 'ACTIVE',
        badges: ['NL50', 'NL100'],
        formats: ['Cash Game', 'MTT'],
        languages: ['Français', 'English'],
      },
    });

    console.log('✅ Coach de test créé : e2e-coach@edgemy.test / TestE2E@2024!');
  } else {
    console.error('❌ Erreur lors de la création du coach');
  }

  // 3. Créer utilisateur ADMIN via API Better Auth
  console.log('👑 Création de l\'admin de test via Better Auth API...');
  const adminResult = await auth.api.signUpEmail({
    body: {
      email: 'e2e-admin@edgemy.test',
      password: testPassword,
      name: 'E2E Test Admin',
    },
  });

  if (adminResult && adminResult.user) {
    // Mettre à jour le rôle en ADMIN
    await prisma.user.update({
      where: { id: adminResult.user.id },
      data: { role: 'ADMIN' },
    });

    console.log('✅ Admin de test créé : e2e-admin@edgemy.test / TestE2E@2024!');
  } else {
    console.error('❌ Erreur lors de la création de l\'admin');
  }

  console.log('\n🎉 Tous les utilisateurs de test E2E ont été créés via Better Auth API!');
  console.log('\n📋 Récapitulatif des credentials :');
  console.log('   Player: e2e-player@edgemy.test / TestE2E@2024!');
  console.log('   Coach:  e2e-coach@edgemy.test / TestE2E@2024!');
  console.log('   Admin:  e2e-admin@edgemy.test / TestE2E@2024!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création des utilisateurs E2E:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
