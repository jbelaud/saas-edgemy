import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

interface CreateChannelBody {
  reservationId: string;
}

/**
 * POST /api/discord/create-channel
 * Crée ou réutilise un salon Discord permanent pour une paire Coach-Joueur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body: CreateChannelBody = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json(
        { error: 'reservationId requis' },
        { status: 400 }
      );
    }

    // Récupérer la réservation avec toutes les infos
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                discordId: true,
              },
            },
          },
        },
        player: {
          select: {
            name: true,
            discordId: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que coach ET joueur ont connecté Discord
    const coachDiscordId = reservation.coach.user.discordId;
    const playerDiscordId = reservation.player.discordId;

    if (!coachDiscordId || !playerDiscordId) {
      return NextResponse.json(
        { error: 'Coach et joueur doivent connecter Discord' },
        { status: 400 }
      );
    }

    // Variables Discord
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
    const DISCORD_CATEGORY_ID = process.env.DISCORD_CATEGORY_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_CATEGORY_ID) {
      return NextResponse.json(
        { error: 'Configuration Discord incomplète' },
        { status: 500 }
      );
    }

    // Chercher un salon permanent existant
    let channelRecord = await prisma.coachPlayerChannel.findUnique({
      where: {
        coachId_playerId: {
          coachId: reservation.coachId,
          playerId: reservation.playerId,
        },
      },
    });

    let textChannelId: string;
    let voiceChannelId: string | null = null;

    if (channelRecord) {
      // Salon existant - réutiliser
      textChannelId = channelRecord.discordChannelId;
      voiceChannelId = channelRecord.discordVoiceId;

      await prisma.coachPlayerChannel.update({
        where: { id: channelRecord.id },
        data: { lastUsedAt: new Date() },
      });
    } else {
      // Créer un nouveau salon permanent
      const coachName = `${reservation.coach.firstName}-${reservation.coach.lastName}`
        .toLowerCase()
        .replace(/\s+/g, '-');
      const playerName = (reservation.player.name || 'joueur')
        .toLowerCase()
        .replace(/\s+/g, '-');
      const channelName = `${coachName}-${playerName}`;

      // Créer salon texte
      const textChannelResponse = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `💬-${channelName}`,
            type: 0,
            parent_id: DISCORD_CATEGORY_ID,
            permission_overwrites: [
              {
                id: DISCORD_GUILD_ID,
                type: 0,
                deny: '1024',
              },
              {
                id: coachDiscordId,
                type: 1,
                allow: '3072',
              },
              {
                id: playerDiscordId,
                type: 1,
                allow: '3072',
              },
            ],
          }),
        }
      );

      if (!textChannelResponse.ok) {
        const error = await textChannelResponse.text();
        console.error('Erreur création salon texte:', error);
        return NextResponse.json(
          { error: 'Erreur création salon texte' },
          { status: 500 }
        );
      }

      const textChannel: DiscordChannel = await textChannelResponse.json();
      textChannelId = textChannel.id;

      // Créer salon vocal
      const voiceChannelResponse = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `🎙️-${channelName}`,
            type: 2,
            parent_id: DISCORD_CATEGORY_ID,
            permission_overwrites: [
              {
                id: DISCORD_GUILD_ID,
                type: 0,
                deny: '1024',
              },
              {
                id: coachDiscordId,
                type: 1,
                allow: '3146752',
              },
              {
                id: playerDiscordId,
                type: 1,
                allow: '3146752',
              },
            ],
          }),
        }
      );

      if (voiceChannelResponse.ok) {
        const voiceChannel: DiscordChannel = await voiceChannelResponse.json();
        voiceChannelId = voiceChannel.id;
      }

      // Sauvegarder en BDD
      channelRecord = await prisma.coachPlayerChannel.create({
        data: {
          coachId: reservation.coachId,
          playerId: reservation.playerId,
          discordChannelId: textChannelId,
          discordVoiceId: voiceChannelId,
        },
      });
    }

    // Envoyer message de session
    const sessionMessage = `🎉 **Nouvelle session programmée !**\n\n` +
      `👤 **Coach**: ${reservation.coach.firstName} ${reservation.coach.lastName}\n` +
      `👤 **Joueur**: ${reservation.player.name || 'Joueur'}\n` +
      `📅 **Date**: ${new Date(reservation.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n` +
      `🕐 **Heure**: ${new Date(reservation.startDate).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${new Date(reservation.endDate).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}\n` +
      `📚 **Sujet**: ${reservation.announcement.title}\n\n` +
      `Bon coaching ! 🚀`;

    await fetch(
      `https://discord.com/api/v10/channels/${textChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sessionMessage,
        }),
      }
    );

    // Mettre à jour la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        discordChannelId: textChannelId,
      },
    });

    return NextResponse.json({
      success: true,
      textChannelId,
      voiceChannelId,
      isNewChannel: channelRecord.createdAt.getTime() > Date.now() - 5000,
    });
  } catch (error) {
    console.error('Erreur création salon Discord:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
