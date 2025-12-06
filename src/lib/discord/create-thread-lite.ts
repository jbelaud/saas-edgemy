/**
 * Création de salon Discord pour les réservations LITE
 * Réutilise les canaux existants comme pour PRO
 */

import { prisma } from '@/lib/prisma';

interface CreateDiscordThreadParams {
  reservationId: string;
  coachId: string;
  playerId: string;
  coachName: string;
  playerName: string;
  sessionTitle: string;
  startDate: Date;
  endDate: Date;
  paymentPreferences: string[];
  priceCents: number;
}

interface DiscordThreadResult {
  success: boolean;
  channelId?: string;
  voiceChannelId?: string;
  url?: string;
  error?: string;
}

export async function createDiscordThreadForLite(
  params: CreateDiscordThreadParams
): Promise<DiscordThreadResult> {
  const {
    coachId,
    playerId,
    coachName,
    playerName,
    sessionTitle,
    startDate,
    endDate,
    priceCents,
  } = params;

  try {
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
    const DISCORD_CATEGORY_ID = process.env.DISCORD_CATEGORY_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
      console.error('[Discord LITE] Configuration Discord manquante');
      return {
        success: false,
        error: 'Configuration Discord incomplète',
      };
    }

    // Récupérer les discordId du coach et du joueur
    const [coachUser, playerUser] = await Promise.all([
      prisma.coach.findUnique({
        where: { id: coachId },
        select: { user: { select: { discordId: true } } },
      }),
      prisma.user.findUnique({
        where: { id: playerId },
        select: { discordId: true, name: true },
      }),
    ]);

    const coachDiscordId = coachUser?.user?.discordId;
    const playerDiscordId = playerUser?.discordId;

    if (!coachDiscordId || !playerDiscordId) {
      console.warn('[Discord LITE] Coach ou joueur non connecté à Discord');
      return {
        success: false,
        error: 'Coach ou joueur non connecté à Discord',
      };
    }

    // Chercher un salon permanent existant (comme pour PRO)
    const channelRecord = await prisma.coachPlayerChannel.findUnique({
      where: {
        coachId_playerId: {
          coachId,
          playerId,
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

      console.log(`[Discord LITE] Canal réutilisé: ${textChannelId}`);
    } else {
      // Créer un nouveau salon permanent
      const formatName = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const coachNameFormatted = formatName(coachName);
      const playerNameFormatted = formatName(playerName);

      // Permissions de base
      const basePermissionOverwrites = [
        // Bloquer @everyone
        {
          id: DISCORD_GUILD_ID,
          type: 0, // Role
          deny: '1024', // VIEW_CHANNEL
        },
        // Autoriser le coach (VIEW_CHANNEL + SEND_MESSAGES)
        {
          id: coachDiscordId,
          type: 1, // Member
          allow: '3072', // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
        },
        // Autoriser le joueur (VIEW_CHANNEL + SEND_MESSAGES)
        {
          id: playerDiscordId,
          type: 1, // Member
          allow: '3072', // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048)
        },
      ];

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
            name: `💬-${coachNameFormatted}-${playerNameFormatted}`,
            type: 0, // GUILD_TEXT
            parent_id: DISCORD_CATEGORY_ID || undefined,
            permission_overwrites: basePermissionOverwrites,
          }),
        }
      );

      if (!textChannelResponse.ok) {
        const errorData = await textChannelResponse.json();
        console.error('[Discord LITE] Erreur création salon texte:', errorData);
        return {
          success: false,
          error: `Erreur Discord: ${errorData.message || 'Unknown'}`,
        };
      }

      const textChannel = await textChannelResponse.json();
      textChannelId = textChannel.id;

      // Permissions vocales
      const voicePermissionOverwrites = [
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
      ];

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
            name: `🎙️-${coachNameFormatted}-${playerNameFormatted}`,
            type: 2, // GUILD_VOICE
            parent_id: DISCORD_CATEGORY_ID || undefined,
            permission_overwrites: voicePermissionOverwrites,
          }),
        }
      );

      if (voiceChannelResponse.ok) {
        const voiceChannel = await voiceChannelResponse.json();
        voiceChannelId = voiceChannel.id;
      }

      // Sauvegarder en BDD pour réutilisation future
      await prisma.coachPlayerChannel.create({
        data: {
          coachId,
          playerId,
          discordChannelId: textChannelId,
          discordVoiceId: voiceChannelId,
        },
      });

      console.log(`[Discord LITE] Salons créés - Texte: ${textChannelId}, Vocal: ${voiceChannelId}`);
    }

    // Construire le message de bienvenue avec rappel paiement LITE
    // Structure alignée sur le message PRO
    const priceDisplay = priceCents > 0 ? `${(priceCents / 100).toFixed(2)}€` : 'À définir';

    const welcomeMessage = 
      `🎉 **Nouvelle session programmée !**\n\n` +
      `👤 **Coach**: ${coachName}\n` +
      `👤 **Joueur**: ${playerName}\n` +
      `📅 **Date**: ${startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n` +
      `🕐 **Heure**: ${startDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${endDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}\n` +
      `📚 **Sujet**: ${sessionTitle}\n` +
      `💰 **Montant**: ${priceDisplay}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💳 **PAIEMENT - Plan LITE**\n\n` +
      `<@${coachDiscordId}>, merci de communiquer ton lien de paiement à <@${playerDiscordId}>.\n\n` +
      `📹 **Visio**: Le coach communiquera le lien de la visio avant la session.\n\n` +
      `⚠️ *Le paiement s'effectue directement entre le coach et le joueur. Edgemy n'est pas impliqué dans cette transaction.*\n\n` +
      `Bon coaching ! 🚀`;

    // Envoyer le message de bienvenue
    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${textChannelId}/messages`,
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

    if (!messageResponse.ok) {
      const messageError = await messageResponse.json();
      console.error('[Discord LITE] Erreur envoi message:', messageError);
      // On continue quand même, le salon est créé
    } else {
      console.log(`[Discord LITE] Message envoyé dans le salon ${textChannelId}`);
    }

    return {
      success: true,
      channelId: textChannelId,
      voiceChannelId: voiceChannelId ?? undefined,
      url: `https://discord.com/channels/${DISCORD_GUILD_ID}/${textChannelId}`,
    };
  } catch (error) {
    console.error('[Discord LITE] Erreur:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
