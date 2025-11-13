import { prisma } from '../src/lib/prisma';

async function checkDiscordConfig() {
  try {
    const coach = await prisma.coach.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'Olivier', mode: 'insensitive' } },
          { lastName: { contains: 'Belaud', mode: 'insensitive' } },
        ],
      },
      include: { user: true },
    });

    if (!coach) {
      console.log('❌ Coach non trouvé');
      return;
    }

    console.log('\n📊 Informations Discord:');
    console.log('  - ID:', coach.id);
    console.log('  - Nom:', coach.firstName, coach.lastName);
    console.log('  - isDiscordConnected:', coach.isDiscordConnected);
    console.log('  - discordUrl:', coach.discordUrl || '(non configuré)');
    console.log('  - Slug:', coach.slug);

    if (coach.isDiscordConnected && !coach.discordUrl) {
      console.log('\n⚠️ Problème détecté:');
      console.log('  Le coach est marqué comme Discord connecté mais n\'a pas de discordUrl');
    } else if (!coach.isDiscordConnected && coach.discordUrl) {
      console.log('\n⚠️ Problème détecté:');
      console.log('  Le coach a un discordUrl mais n\'est pas marqué comme connecté');
    } else if (coach.isDiscordConnected && coach.discordUrl) {
      console.log('\n✅ Configuration Discord correcte');
    } else {
      console.log('\n❌ Discord non configuré');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDiscordConfig();
