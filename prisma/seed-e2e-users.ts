// @ts-nocheck
import { PrismaClient, Role, CoachStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

// Fonction pour générer un ID unique
function generateId() {
  return randomBytes(16).toString('hex');
}

// Fonction pour hasher un mot de passe (compatible Better Auth - utilise bcryptjs)
function hashPassword(password: string): string {
  return hashSync(password, 10);
}

async function main() {
  console.log('🧪 Création des utilisateurs de test E2E...');

  // Credentials pour les tests E2E
  const testPassword = 'TestE2E@2024!';

  // Supprimer les comptes existants pour les recréer avec de nouveaux mots de passe
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

  // Supprimer aussi les profils coach et player
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

  // Supprimer les utilisateurs
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['e2e-player@edgemy.test', 'e2e-coach@edgemy.test', 'e2e-admin@edgemy.test'],
      },
    },
  });

  console.log('✅ Nettoyage terminé');

  // 1. Créer un utilisateur PLAYER pour les tests
  console.log('👤 Création du joueur de test...');
  const playerTestUser = await prisma.user.upsert({
    where: { email: 'e2e-player@edgemy.test' },
    update: {
      name: 'E2E Test Player',
      emailVerified: true,
      role: 'USER',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-player',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'e2e-player@edgemy.test',
      name: 'E2E Test Player',
      emailVerified: true,
      role: 'USER',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-player',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Créer le compte credential pour le player
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: playerTestUser.id,
      },
    },
    update: {
      password: hashPassword(testPassword),
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      userId: playerTestUser.id,
      accountId: playerTestUser.id,
      providerId: 'credential',
      password: hashPassword(testPassword),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Créer le profil player associé
  await prisma.player.upsert({
    where: { userId: playerTestUser.id },
    update: {
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      userId: playerTestUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Joueur de test créé : e2e-player@edgemy.test / TestE2E@2024!');

  // 2. Créer un utilisateur COACH pour les tests
  console.log('🎓 Création du coach de test...');
  const coachTestUser = await prisma.user.upsert({
    where: { email: 'e2e-coach@edgemy.test' },
    update: {
      name: 'E2E Test Coach',
      emailVerified: true,
      role: 'USER',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-coach',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'e2e-coach@edgemy.test',
      name: 'E2E Test Coach',
      emailVerified: true,
      role: 'USER',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-coach',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Créer le compte credential pour le coach
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: coachTestUser.id,
      },
    },
    update: {
      password: hashPassword(testPassword),
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      userId: coachTestUser.id,
      accountId: coachTestUser.id,
      providerId: 'credential',
      password: hashPassword(testPassword),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Créer le profil coach associé
  await prisma.coach.upsert({
    where: { userId: coachTestUser.id },
    update: {
      status: 'ACTIVE',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      userId: coachTestUser.id,
      slug: 'e2e-test-coach',
      firstName: 'E2E',
      lastName: 'Test Coach',
      bio: 'Coach de test pour E2E',
      status: 'ACTIVE',
      badges: ['NL50', 'NL100'],
      formats: ['Cash Game', 'MTT'],
      languages: ['Français', 'English'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Coach de test créé : e2e-coach@edgemy.test / TestE2E@2024!');

  // 3. Créer un utilisateur ADMIN pour les tests
  console.log('👑 Création de l\'admin de test...');
  const adminTestUser = await prisma.user.upsert({
    where: { email: 'e2e-admin@edgemy.test' },
    update: {
      name: 'E2E Test Admin',
      emailVerified: true,
      role: 'ADMIN',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-admin',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'e2e-admin@edgemy.test',
      name: 'E2E Test Admin',
      emailVerified: true,
      role: 'ADMIN',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=e2e-admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Créer le compte credential pour l'admin
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: adminTestUser.id,
      },
    },
    update: {
      password: hashPassword(testPassword),
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      userId: adminTestUser.id,
      accountId: adminTestUser.id,
      providerId: 'credential',
      password: hashPassword(testPassword),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Admin de test créé : e2e-admin@edgemy.test / TestE2E@2024!');

  console.log('\n🎉 Tous les utilisateurs de test E2E ont été créés !');
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
