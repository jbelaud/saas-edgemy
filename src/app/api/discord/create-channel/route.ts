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
    const DISCORD_ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_CATEGORY_ID) {
      return NextResponse.json(
        { error: 'Configuration Discord incomplète' },
        { status: 500 }
      );
    }

    // Vérifier que le bot a les bonnes permissions
    try {
      const botResponse = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/@me`,
        {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          },
        }
      );

      if (!botResponse.ok) {
        console.error('Le bot n\'a pas accès au serveur Discord');
        return NextResponse.json(
          { error: 'Bot Discord non configuré correctement' },
          { status: 500 }
        );
      }

      const botMember = await botResponse.json();
      console.log('[Discord] Bot vérifié avec succès:', botMember.user?.username);
    } catch (error) {
      console.error('[Discord] Erreur vérification bot:', error);
      return NextResponse.json(
        { error: 'Erreur de connexion Discord' },
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

      // Audit log - Réutilisation du canal
      console.log('[Discord Audit] Canal réutilisé:', {
        action: 'CHANNEL_REUSED',
        textChannelId,
        voiceChannelId,
        coachId: reservation.coachId,
        playerId: reservation.playerId,
        timestamp: new Date().toISOString(),
        initiatedBy: session.user.id,
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

      // Construire les permissions de base
      const basePermissionOverwrites = [
        // 1. Bloquer @everyone (personne ne peut voir par défaut)
        {
          id: DISCORD_GUILD_ID,
          type: 0, // role
          deny: '1024', // VIEW_CHANNEL
        },
        // 2. Autoriser le coach
        {
          id: coachDiscordId,
          type: 1, // member
          allow: '3072', // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
        },
        // 3. Autoriser le joueur
        {
          id: playerDiscordId,
          type: 1, // member
          allow: '3072', // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
        },
      ];

      // 4. Ajouter le rôle admin si configuré (pour support/modération)
      if (DISCORD_ADMIN_ROLE_ID) {
        basePermissionOverwrites.push({
          id: DISCORD_ADMIN_ROLE_ID,
          type: 0, // role
          allow: '3072', // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
        });
      }

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
            type: 0, // GUILD_TEXT
            parent_id: DISCORD_CATEGORY_ID,
            permission_overwrites: basePermissionOverwrites,
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

      // Construire les permissions pour le salon vocal
      const voicePermissionOverwrites = [
        // 1. Bloquer @everyone
        {
          id: DISCORD_GUILD_ID,
          type: 0, // role
          deny: '1024', // VIEW_CHANNEL
        },
        // 2. Autoriser le coach (avec permissions vocales)
        {
          id: coachDiscordId,
          type: 1, // member
          allow: '3146752', // VIEW_CHANNEL (1024) + CONNECT (1048576) + SPEAK (2097152)
        },
        // 3. Autoriser le joueur (avec permissions vocales)
        {
          id: playerDiscordId,
          type: 1, // member
          allow: '3146752', // VIEW_CHANNEL (1024) + CONNECT (1048576) + SPEAK (2097152)
        },
      ];

      // 4. Ajouter le rôle admin si configuré
      if (DISCORD_ADMIN_ROLE_ID) {
        voicePermissionOverwrites.push({
          id: DISCORD_ADMIN_ROLE_ID,
          type: 0, // role
          allow: '3146752', // Mêmes permissions vocales que coach/joueur
        });
      }

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
            type: 2, // GUILD_VOICE
            parent_id: DISCORD_CATEGORY_ID,
            permission_overwrites: voicePermissionOverwrites,
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

      // Audit log - Enregistrer la création du canal
      console.log('[Discord Audit] Canal créé:', {
        action: 'CHANNEL_CREATED',
        textChannelId,
        voiceChannelId,
        coachId: reservation.coachId,
        playerId: reservation.playerId,
        coachDiscordId,
        playerDiscordId,
        timestamp: new Date().toISOString(),
        initiatedBy: session.user.id,
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
      `📹 **Visio**: Le coach communiquera le lien de la visio avant la session.\n\n` +
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
