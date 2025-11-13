import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour synchroniser le statut Discord entre User et Coach
 * Met à jour isDiscordConnected dans Coach basé sur la présence de discordId dans User
 */
async function syncDiscordStatus() {
  try {
    const email = process.argv[2] || 'harmonie.meron@gmail.com';

    console.log(`🔄 Synchronisation du statut Discord pour ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { coach: true },
    });

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé pour l'email: ${email}`);
      return;
    }

    if (!user.coach) {
      console.error(`❌ Aucun profil coach trouvé pour cet utilisateur`);
      return;
    }

    const hasDiscord = !!user.discordId;

    console.log(`📊 État actuel:`);
    console.log(`   User discordId: ${user.discordId || 'null'}`);
    console.log(`   Coach isDiscordConnected: ${user.coach.isDiscordConnected}`);

    if (user.coach.isDiscordConnected === hasDiscord) {
      console.log(`✅ Les statuts sont déjà synchronisés !`);
      return;
    }

    await prisma.coach.update({
      where: { id: user.coach.id },
      data: { isDiscordConnected: hasDiscord },
    });

    console.log(`✅ Statut Discord synchronisé avec succès !`);
    console.log(`   Coach ID: ${user.coach.id}`);
    console.log(`   isDiscordConnected: ${user.coach.isDiscordConnected} → ${hasDiscord}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDiscordStatus();
