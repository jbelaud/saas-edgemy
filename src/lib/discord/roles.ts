const DISCORD_COACH_ROLE_ID = process.env.DISCORD_COACH_ROLE_ID;
const DISCORD_PLAYER_ROLE_ID = process.env.DISCORD_PLAYER_ROLE_ID;
const DISCORD_VISITOR_ROLE_ID = process.env.DISCORD_VISITOR_ROLE_ID;

interface EnsureMemberRoleParams {
  discordId: string;
  role: 'COACH' | 'PLAYER';
}

function getDiscordConfig() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    throw new Error('Configuration Discord incomplète pour la gestion des rôles');
  }

  return { botToken, guildId };
}

async function fetchGuildMember(discordId: string) {
  const { botToken, guildId } = getDiscordConfig();

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur récupération membre Discord (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<{ roles: string[] } & Record<string, unknown>>;
}

async function updateMemberRoles(discordId: string, roles: string[]) {
  const { botToken, guildId } = getDiscordConfig();

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roles }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur mise à jour des rôles (${response.status}): ${errorText}`);
  }
}

export async function ensureMemberRole({ discordId, role }: EnsureMemberRoleParams): Promise<void> {
  try {
    const roleId = role === 'COACH' ? DISCORD_COACH_ROLE_ID : DISCORD_PLAYER_ROLE_ID;

    if (!roleId) {
      console.warn('[Discord] Aucun role ID configuré pour', role);
      return;
    }

    const member = await fetchGuildMember(discordId);

    if (!member) {
      console.warn('[Discord] Le membre n\'est pas présent sur le serveur, impossible d\'assigner un rôle', {
        discordId,
        role,
      });
      return;
    }

    const currentRoles = new Set(member.roles);
    let mutated = false;

    if (!currentRoles.has(roleId)) {
      currentRoles.add(roleId);
      mutated = true;
    }

    if (DISCORD_VISITOR_ROLE_ID && currentRoles.has(DISCORD_VISITOR_ROLE_ID)) {
      currentRoles.delete(DISCORD_VISITOR_ROLE_ID);
      mutated = true;
    }

    if (!mutated) {
      return;
    }

    await updateMemberRoles(discordId, Array.from(currentRoles));
    console.log('[Discord] Rôle membre mis à jour', { discordId, role });
  } catch (error) {
    console.error('[Discord] Échec assignation rôle', { discordId, role, error });
  }
}
