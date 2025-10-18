// Script pour créer les comptes via l'API Better Auth
// Cela garantit que les mots de passe sont hashés correctement

async function createAccount(email: string, password: string, name: string) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ ${email}: ${error}`);
      return false;
    }

    console.log(`✅ ${email}: Compte créé`);
    return true;
  } catch (error) {
    console.log(`❌ ${email}: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🔐 Création des comptes via Better Auth API...\n');
  console.log('⚠️  Assurez-vous que le serveur Next.js tourne (pnpm dev)\n');

  const accounts = [
    { email: 'coach-actif@edgemy.fr', password: 'Password123!', name: 'Jean Dupont' },
    { email: 'coach-inactif@edgemy.fr', password: 'Password123!', name: 'Marie Martin' },
    { email: 'coach-pending@edgemy.fr', password: 'Password123!', name: 'Pierre Durand' },
    { email: 'joueur@edgemy.fr', password: 'Password123!', name: 'Sophie Bernard' },
  ];

  for (const account of accounts) {
    await createAccount(account.email, account.password, account.name);
    // Attendre un peu entre chaque création
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Terminé!');
  console.log('\n📝 Vous pouvez maintenant vous connecter avec:');
  console.log('   Email: coach-actif@edgemy.fr');
  console.log('   Password: Password123!');
}

main().catch(console.error);
