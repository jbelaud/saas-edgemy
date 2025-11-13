import { prisma } from '../src/lib/prisma';

async function fixDiscordUrl() {
  try {
    // Récupérer le coach avec son Discord ID depuis user
    const coach = await prisma.coach.findFirst({
      where: {
        id: 'cmhjmw8ce0001uyh8g0j4nfwr',
      },
      include: { user: true },
    });

    if (!coach) {
      console.log('❌ Coach non trouvé');
      return;
    }

    if (!coach.user.discordId) {
      console.log('❌ Le user n\'a pas de discordId configuré');
      return;
    }

    // Mettre à jour avec l'URL Discord
    const discordUrl = `https://discord.com/users/${coach.user.discordId}`;

    const result = await prisma.coach.update({
      where: { id: coach.id },
      data: { discordUrl },
    });

    console.log('✅ Coach mis à jour:');
    console.log('  - ID:', result.id);
    console.log('  - Nom:', result.firstName, result.lastName);
    console.log('  - Discord ID:', coach.user.discordId);
    console.log('  - Discord URL:', result.discordUrl);
    console.log('\n🎉 Le bouton Discord devrait maintenant fonctionner sur le profil public !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDiscordUrl();
