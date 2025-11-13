import { prisma } from '../src/lib/prisma';

async function fixStripeOnboarded() {
  try {
    // Mettre à jour le coach Olivier Belaud
    const result = await prisma.coach.update({
      where: { id: 'cmhjmw8ce0001uyh8g0j4nfwr' },
      data: { isOnboarded: true },
    });

    console.log('✅ Coach mis à jour:');
    console.log('  - ID:', result.id);
    console.log('  - Nom:', result.firstName, result.lastName);
    console.log('  - isOnboarded:', result.isOnboarded);
    console.log('\n🎉 Le bloc "Versements & paiements" devrait maintenant afficher le bon message !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStripeOnboarded();
