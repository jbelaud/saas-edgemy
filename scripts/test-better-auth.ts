// Script pour tester l'API Better Auth
import { PrismaClient } from '@prisma/client';
import { hashSync, compareSync } from '@node-rs/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Test de l\'authentification Better Auth\n');

  // 1. Vérifier que le compte existe
  const user = await prisma.user.findUnique({
    where: { email: 'coach-actif@edgemy.fr' },
  });

  if (!user) {
    console.log('❌ Utilisateur non trouvé!');
    return;
  }

  console.log('✅ Utilisateur trouvé:', user.email);

  // 2. Vérifier le compte d'authentification
  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
  });

  if (!account) {
    console.log('❌ Compte d\'authentification non trouvé!');
    return;
  }

  console.log('✅ Compte d\'authentification trouvé');
  console.log('   Provider:', account.providerId);
  console.log('   Password hash:', account.password?.substring(0, 30) + '...');

  // 3. Tester la vérification du mot de passe
  const testPassword = 'Password123!';
  console.log('\n🔍 Test de vérification du mot de passe...');
  console.log('   Mot de passe testé:', testPassword);

  if (!account.password) {
    console.log('❌ Pas de mot de passe dans le compte!');
    return;
  }

  try {
    const isValid = compareSync(testPassword, account.password);
    if (isValid) {
      console.log('✅ Mot de passe valide!');
    } else {
      console.log('❌ Mot de passe invalide!');
      
      // Tester avec un nouveau hash
      console.log('\n🔧 Création d\'un nouveau hash pour comparaison...');
      const newHash = hashSync(testPassword, 10);
      console.log('   Nouveau hash:', newHash.substring(0, 30) + '...');
      
      const isValidNew = compareSync(testPassword, newHash);
      console.log('   Validation du nouveau hash:', isValidNew ? '✅' : '❌');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }

  // 4. Vérifier les variables d'environnement nécessaires
  console.log('\n🔍 Vérification des variables d\'environnement...');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante');
  console.log('   BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? '✅ Définie' : '❌ Manquante');
  console.log('   BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL || 'Non définie (optionnel)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
