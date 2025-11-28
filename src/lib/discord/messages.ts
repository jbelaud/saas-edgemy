import { DiscordChannelReservation } from '@/lib/discord/channel';

type SessionReminderParams = {
  discordId: string;
  reservation: DiscordChannelReservation;
  channelId?: string | null;
  role: 'player' | 'coach';
};

export class DiscordMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordMessageError';
  }
}

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

async function createDMChannel(discordId: string): Promise<string | null> {
  if (!DISCORD_BOT_TOKEN) {
    console.warn('[Discord DM] Token manquant - envoi DM ignoré');
    return null;
  }

  const response = await fetch('https://discord.com/api/v10/users/@me/channels', {
    method: 'POST',
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: discordId }),
  });

  if (!response.ok) {
    console.error('[Discord DM] Impossible de créer le canal DM:', await response.text());
    return null;
  }

  const data: { id: string } = await response.json();
  return data.id;
}

function buildSessionEmbed({ reservation, channelId, role }: Omit<SessionReminderParams, 'discordId'>) {
  const start = new Date(reservation.startDate);
  const end = new Date(reservation.endDate);
  const locale = 'fr-FR';

  // Déterminer le fuseau horaire à utiliser selon le rôle
  const timezone = role === 'coach'
    ? reservation.coach?.timezone || 'UTC'
    : reservation.player?.timezone || 'UTC';

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: timezone,
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  const dateLabel = dateFormatter.format(start);
  const startTime = timeFormatter.format(start);
  const endTime = timeFormatter.format(end);

  // Obtenir l'offset UTC pour le fuseau horaire spécifique
  const getUTCOffset = (date: Date, tz: string): string => {
    try {
      // Utiliser Intl pour obtenir l'offset correct du fuseau horaire
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');

      if (offsetPart?.value && offsetPart.value.startsWith('GMT')) {
        // Convertir GMT+7 en UTC+7
        return offsetPart.value.replace('GMT', 'UTC');
      }

      // Fallback : calculer manuellement
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`;
    } catch (error) {
      console.error('Erreur calcul offset UTC:', error);
      return 'UTC';
    }
  };

  const utcOffset = getUTCOffset(start, timezone);

  const coachName = `${reservation.coach?.firstName ?? ''} ${reservation.coach?.lastName ?? ''}`.trim();
  const playerName = reservation.player?.name ?? 'Joueur';
  const sessionTitle = reservation.announcement?.title ?? 'Session de coaching';
  const packHours = reservation.pack?.hours;

  let title: string;
  let description: string;

  if (role === 'player') {
    title = '🎉 Session confirmée !';
    description = `Ta session avec **${coachName || 'ton coach'}** est confirmée. Prépare-toi pour un coaching de qualité !`;
  } else {
    title = '🎉 Nouvelle session réservée !';
    description = `Une nouvelle session avec **${playerName}** vient d'être confirmée. Pense à préparer tes ressources !`;
  }

  const fields = [
    {
      name: '📅 Date',
      value: `${dateLabel}`,
      inline: false,
    },
    {
      name: '🕒 Horaire',
      value: `${startTime} → ${endTime}\n${utcOffset}`,
      inline: true,
    },
    {
      name: '🧑‍🏫 Coach',
      value: coachName || 'À confirmer',
      inline: true,
    },
    {
      name: '🧑‍🎓 Joueur',
      value: playerName,
      inline: true,
    },
    {
      name: '🎯 Session',
      value: sessionTitle,
      inline: false,
    },
  ];

  if (packHours) {
    fields.push({
      name: '📦 Pack',
      value: `${packHours}h`,
      inline: true,
    });
  }

  const components = channelId && DISCORD_GUILD_ID
    ? [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: 'Ouvrir le salon Discord',
              url: `https://discord.com/channels/${DISCORD_GUILD_ID}/${channelId}`,
            },
          ],
        },
      ]
    : undefined;

  return {
    embeds: [
      {
        title,
        description,
        color: role === 'player' ? 0x5865f2 : 0xf97316,
        fields,
        footer: {
          text: 'Edgemy - Coaching poker',
        },
      },
    ],
    components,
  };
}

export async function sendSessionReminderDM(params: SessionReminderParams): Promise<boolean> {
  if (!params.discordId) {
    return false;
  }

  if (!DISCORD_BOT_TOKEN) {
    console.warn('[Discord DM] Token manquant - message ignoré');
    return false;
  }

  const dmChannelId = await createDMChannel(params.discordId);
  if (!dmChannelId) {
    return false;
  }

  try {
    const payload = buildSessionEmbed({
      reservation: params.reservation,
      channelId: params.channelId,
      role: params.role,
    });

    const response = await fetch(`https://discord.com/api/v10/channels/${dmChannelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Discord DM] Envoi message échoué:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Discord DM] Erreur envoi message:', error);
    return false;
  }
}
