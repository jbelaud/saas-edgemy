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
  coachDiscordId: string;
  playerDiscordId: string;
  sessionId: string;
}

/**
 * POST /api/discord/create-channel
 * Crée un salon Discord privé (texte + vocal) pour une session de coaching
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
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
    const { coachDiscordId, playerDiscordId, sessionId } = body;

    // Validation des champs requis
    if (!coachDiscordId || !playerDiscordId || !sessionId) {
      return NextResponse.json(
        { error: 'coachDiscordId, playerDiscordId et sessionId requis' },
        { status: 400 }
      );
    }

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await prisma.reservation.findUnique({
      where: { id: sessionId },
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

    // Vérifier que l'utilisateur est le coach ou le joueur de cette réservation
    if (
      reservation.playerId !== session.user.id &&
      reservation.coach.user.discordId !== coachDiscordId
    ) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le salon n'existe pas déjà
    if (reservation.discordChannelId) {
      return NextResponse.json(
        {
          message: 'Salon Discord déjà créé',
          channelId: reservation.discordChannelId,
        },
        { status: 200 }
      );
    }

    // Récupérer les variables d'environnement Discord
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
    const DISCORD_CATEGORY_ID = process.env.DISCORD_CATEGORY_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_CATEGORY_ID) {
      console.error('Variables Discord manquantes:', {
        hasToken: !!DISCORD_BOT_TOKEN,
        hasGuildId: !!DISCORD_GUILD_ID,
        hasCategoryId: !!DISCORD_CATEGORY_ID,
      });
      return NextResponse.json(
        { error: 'Configuration Discord incomplète' },
        { status: 500 }
      );
    }

    // Créer le nom du salon (format: session-coach-joueur-timestamp)
    const coachName = `${reservation.coach.firstName}-${reservation.coach.lastName}`
      .toLowerCase()
      .replace(/\s+/g, '-');
    const playerName = (reservation.player.name || 'joueur')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const timestamp = Date.now().toString().slice(-6);
    const channelName = `session-${coachName}-${playerName}-${timestamp}`;

    // Créer le salon texte
    const textChannelResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelName,
          type: 0, // 0 = GUILD_TEXT
          parent_id: DISCORD_CATEGORY_ID,
          permission_overwrites: [
            {
              id: DISCORD_GUILD_ID, // @everyone
              type: 0,
              deny: '1024', // VIEW_CHANNEL
            },
            {
              id: coachDiscordId,
              type: 1, // member
              allow: '3072', // VIEW_CHANNEL + SEND_MESSAGES
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
      console.error('Erreur création salon texte Discord:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du salon texte' },
        { status: 500 }
      );
    }

    const textChannel: DiscordChannel = await textChannelResponse.json();

    // Créer le salon vocal
    const voiceChannelResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `🎙️ ${channelName}`,
          type: 2, // 2 = GUILD_VOICE
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
              allow: '3146752', // VIEW_CHANNEL + CONNECT + SPEAK
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

    if (!voiceChannelResponse.ok) {
      const error = await voiceChannelResponse.text();
      console.error('Erreur création salon vocal Discord:', error);
      // Ne pas échouer si le salon vocal n'a pas pu être créé
    }

    const voiceChannel: DiscordChannel | null = voiceChannelResponse.ok
      ? await voiceChannelResponse.json()
      : null;

    // Envoyer un message de bienvenue dans le salon texte
    const welcomeMessage = `🎉 **Bienvenue dans votre session de coaching !**\n\n` +
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
      `https://discord.com/api/v10/channels/${textChannel.id}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: welcomeMessage,
        }),
      }
    );

    // Mettre à jour la réservation avec l'ID du salon Discord
    await prisma.reservation.update({
      where: { id: sessionId },
      data: {
        discordChannelId: textChannel.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        textChannelId: textChannel.id,
        voiceChannelId: voiceChannel?.id || null,
        channelName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du salon Discord:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
