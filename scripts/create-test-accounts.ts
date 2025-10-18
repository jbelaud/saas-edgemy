// Script pour créer les comptes de test via Better Auth
// Utilise l'API interne de Better Auth pour garantir la compatibilité

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Création des comptes de test via Better Auth...\n');

  // Better Auth utilise son propre système de hashing
  // On doit utiliser la méthode signUp de Better Auth ou créer les comptes via l'API

  const testAccounts = [
    {
      email: 'coach-actif@edgemy.fr',
      password: 'Password123!',
      name: 'Jean Dupont',
    },
    {
      email: 'coach-inactif@edgemy.fr',
      password: 'Password123!',
      name: 'Marie Martin',
    },
    {
      email: 'coach-pending@edgemy.fr',
      password: 'Password123!',
      name: 'Pierre Durand',
    },
    {
      email: 'joueur@edgemy.fr',
      password: 'Password123!',
      name: 'Sophie Bernard',
    },
  ];

  console.log('📝 Comptes à créer :');
  testAccounts.forEach((account) => {
    console.log(`  - ${account.email} (${account.name})`);
  });

  console.log('\n⚠️  IMPORTANT :');
  console.log('Pour créer ces comptes, vous devez :');
  console.log('1. Démarrer le serveur : pnpm dev');
  console.log('2. Aller sur http://localhost:3000');
  console.log('3. Créer chaque compte via le formulaire d\'inscription');
  console.log('\nOu utiliser l\'API Better Auth directement.\n');

  // Alternative : Appeler l'API Better Auth
  console.log('💡 Alternative : Utiliser curl pour créer les comptes :');
  console.log('');
  testAccounts.forEach((account) => {
    console.log(`curl -X POST http://localhost:3000/api/auth/sign-up/email \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email":"${account.email}","password":"${account.password}","name":"${account.name}"}'`);
    console.log('');
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
