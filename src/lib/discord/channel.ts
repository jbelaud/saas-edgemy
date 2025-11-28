import { prisma } from '@/lib/prisma';

type CreateChannelParams = {
  reservationId: string;
  initiatedBy?: string | null;
};

export type DiscordChannelReservation = {
  id: string;
  startDate: Date;
  endDate: Date;
  coach: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    timezone: string | null;
    user: {
      id: string;
      discordId: string | null;
    } | null;
  } | null;
  player: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    timezone: string | null;
    discordId: string | null;
  } | null;
  announcement: {
    title: string | null;
  } | null;
  pack: {
    hours: number | null;
  } | null;
};

export type DiscordChannelResult = {
  textChannelId: string;
  voiceChannelId: string | null;
  isNewChannel: boolean;
  reservation: DiscordChannelReservation;
};

export class DiscordChannelError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'DISCORD_CHANNEL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type DiscordReservation = Awaited<
  ReturnType<typeof prisma.reservation.findUnique>
>;

function ensureReservation(reservation: DiscordReservation | null): asserts reservation is NonNullable<DiscordReservation> {
  if (!reservation) {
    throw new DiscordChannelError('Réservation introuvable', 404, 'RESERVATION_NOT_FOUND');
  }
}

function slugify(...parts: Array<string | null | undefined>): string {
  const raw = parts
    .filter(Boolean)
    .map((part) => part!.trim())
    .filter((part) => part.length > 0)
    .join('-');

  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 90);
}

export async function createOrReuseDiscordChannel({
  reservationId,
  initiatedBy,
}: CreateChannelParams): Promise<DiscordChannelResult> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          timezone: true,
          user: {
            select: {
              id: true,
              discordId: true,
            },
          },
        },
      },
      player: {
        select: {
          id: true,
          name: true,
          timezone: true,
          discordId: true,
        },
      },
      announcement: {
        select: {
          title: true,
        },
      },
      pack: {
        select: {
          hours: true,
        },
      },
    },
  });

  ensureReservation(reservation);

  const coachDiscordId = reservation.coach?.user?.discordId;
  const playerDiscordId = reservation.player?.discordId;

  const playerProfile = await prisma.player.findUnique({
    where: { userId: reservation.playerId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!coachDiscordId || !playerDiscordId) {
    throw new DiscordChannelError(
      'Coach et joueur doivent connecter Discord',
      400,
      'DISCORD_IDS_MISSING',
    );
  }

  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
  const DISCORD_CATEGORY_ID = process.env.DISCORD_CATEGORY_ID;
  const DISCORD_ADMIN_ROLE_ID = process.env.DISCORD_ADMIN_ROLE_ID;

  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_CATEGORY_ID) {
    throw new DiscordChannelError(
      'Configuration Discord incomplète',
      500,
      'DISCORD_CONFIG_MISSING',
    );
  }

  try {
    const botUserResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!botUserResponse.ok) {
      const errorText = await botUserResponse.text();
      console.error('[Discord] Impossible de récupérer le bot', {
        status: botUserResponse.status,
        error: errorText,
      });
      throw new DiscordChannelError(
        'Bot Discord non accessible',
        500,
        'DISCORD_BOT_ACCESS',
      );
    }

    const botUser = (await botUserResponse.json()) as { id: string; username?: string };

    const botMemberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${botUser.id}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      },
    );

    if (botMemberResponse.status === 404) {
      console.error('[Discord] Le bot n\'est pas présent sur la guilde cible', {
        guildId: DISCORD_GUILD_ID,
        botId: botUser.id,
      });
      throw new DiscordChannelError(
        'Bot Discord absent du serveur',
        500,
        'DISCORD_BOT_NOT_IN_GUILD',
      );
    }

    if (!botMemberResponse.ok) {
      const errorText = await botMemberResponse.text();
      console.error('[Discord] Vérification bot échouée', {
        status: botMemberResponse.status,
        error: errorText,
        guildId: DISCORD_GUILD_ID,
      });
      throw new DiscordChannelError(
        'Bot Discord non configuré correctement',
        500,
        'DISCORD_BOT_ACCESS',
      );
    }

    console.log('[Discord] Bot vérifié avec succès dans la guilde', {
      guildId: DISCORD_GUILD_ID,
      botId: botUser.id,
      botUsername: botUser.username,
    });
  } catch (error) {
    if (error instanceof DiscordChannelError) {
      throw error;
    }

    console.error('[Discord] Erreur vérification bot:', error);
    throw new DiscordChannelError('Erreur de connexion Discord', 500, 'DISCORD_BOT_CONNECTION');
  }

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
  let isNewChannel = false;

  if (channelRecord) {
    textChannelId = channelRecord.discordChannelId;
    voiceChannelId = channelRecord.discordVoiceId ?? null;

    await prisma.coachPlayerChannel.update({
      where: { id: channelRecord.id },
      data: { lastUsedAt: new Date() },
    });

    console.log('[Discord Audit] Canal réutilisé:', {
      action: 'CHANNEL_REUSED',
      textChannelId,
      voiceChannelId,
      coachId: reservation.coachId,
      playerId: reservation.playerId,
      timestamp: new Date().toISOString(),
      initiatedBy: initiatedBy ?? 'system',
    });
  } else {
    isNewChannel = true;
    const coachNameSlug = slugify(reservation.coach?.firstName, reservation.coach?.lastName) || 'coach';
    const playerNameSlug =
      slugify(playerProfile?.firstName, playerProfile?.lastName)
        || slugify(reservation.player?.name)
        || reservation.playerId.substring(0, 6);
    const baseChannelName = `coach-${coachNameSlug}-player-${playerNameSlug}`;
    const textChannelName = baseChannelName;
    const voiceChannelName = `${baseChannelName}-voice`;

    console.log('[Discord] Création d\'un nouveau canal', {
      reservationId,
      textChannelName,
      voiceChannelName,
      categoryId: DISCORD_CATEGORY_ID,
    });

    const basePermissionOverwrites = [
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
    ];

    if (DISCORD_ADMIN_ROLE_ID) {
      basePermissionOverwrites.push({
        id: DISCORD_ADMIN_ROLE_ID,
        type: 0,
        allow: '3072',
      });
    }

    const textChannelResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: textChannelName,
          type: 0,
          parent_id: DISCORD_CATEGORY_ID,
          permission_overwrites: basePermissionOverwrites,
        }),
      },
    );

    if (!textChannelResponse.ok) {
      const errorText = await textChannelResponse.text();
      console.error('Erreur création salon texte:', errorText);
      throw new DiscordChannelError('Erreur création salon texte', 500, 'DISCORD_TEXT_CHANNEL');
    }

    const textChannel = (await textChannelResponse.json()) as { id: string };
    textChannelId = textChannel.id;

    const voicePermissionOverwrites = [
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
    ];

    if (DISCORD_ADMIN_ROLE_ID) {
      voicePermissionOverwrites.push({
        id: DISCORD_ADMIN_ROLE_ID,
        type: 0,
        allow: '3146752',
      });
    }

    const voiceChannelResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: voiceChannelName,
          type: 2,
          parent_id: DISCORD_CATEGORY_ID,
          permission_overwrites: voicePermissionOverwrites,
        }),
      },
    );

    if (voiceChannelResponse.ok) {
      const voiceChannel = (await voiceChannelResponse.json()) as { id: string };
      voiceChannelId = voiceChannel.id;
    }

    channelRecord = await prisma.coachPlayerChannel.create({
      data: {
        coachId: reservation.coachId,
        playerId: reservation.playerId,
        discordChannelId: textChannelId,
        discordVoiceId: voiceChannelId,
      },
    });

    console.log('[Discord Audit] Canal créé:', {
      action: 'CHANNEL_CREATED',
      textChannelId,
      voiceChannelId,
      coachId: reservation.coachId,
      playerId: reservation.playerId,
      coachDiscordId,
      playerDiscordId,
      timestamp: new Date().toISOString(),
      initiatedBy: initiatedBy ?? 'system',
    });
  }

  const sessionMessage = `🎉 **Nouvelle session programmée !**\n\n` +
    `👤 **Coach**: ${reservation.coach?.firstName || ''} ${reservation.coach?.lastName || ''}\n` +
    `👤 **Joueur**: ${playerProfile?.firstName || reservation.player?.name || 'Joueur'} ${playerProfile?.lastName || ''}\n` +
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
    `📚 **Sujet**: ${reservation.announcement?.title || 'Session de coaching'}\n\n` +
    `Bon coaching ! 🚀`;

  try {
    await fetch(`https://discord.com/api/v10/channels/${channelRecord.discordChannelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: sessionMessage,
      }),
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message Discord:', error);
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      discordChannelId: channelRecord.discordChannelId,
    },
  });

  return {
    textChannelId: channelRecord.discordChannelId,
    voiceChannelId: channelRecord.discordVoiceId ?? null,
    isNewChannel,
    reservation: {
      id: reservation.id,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      coach: reservation.coach
        ? {
            id: reservation.coach.id,
            firstName: reservation.coach.firstName,
            lastName: reservation.coach.lastName,
            user: reservation.coach.user
              ? {
                  id: reservation.coach.user.id,
                  discordId: reservation.coach.user.discordId,
                }
              : null,
          }
        : null,
      player: reservation.player
        ? {
            id: reservation.player.id,
            name: reservation.player.name,
            firstName: playerProfile?.firstName ?? null,
            lastName: playerProfile?.lastName ?? null,
            discordId: reservation.player.discordId,
          }
        : null,
      announcement: reservation.announcement
        ? {
            title: reservation.announcement.title,
          }
        : null,
      pack: reservation.pack
        ? {
            hours: reservation.pack.hours,
          }
        : null,
    },
  };
}
