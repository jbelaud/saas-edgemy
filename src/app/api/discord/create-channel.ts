import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { coachDiscordId, playerDiscordId, sessionId } = await req.json();

  const guildId = process.env.DISCORD_GUILD_ID!;
  const categoryId = process.env.DISCORD_CATEGORY_ID!;
  const botToken = process.env.DISCORD_BOT_TOKEN!;

  // Créer un channel privé
  const channelName = `session-${sessionId}`;
  
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: channelName,
      type: 0, // salon textuel
      parent_id: categoryId,
      permission_overwrites: [
        // Bloquer l'accès par défaut
        {
          id: guildId,
          type: 0,
          deny: "1024", // VIEW_CHANNEL
        },
        // Donner accès au coach
        {
          id: coachDiscordId,
          type: 1,
          allow: "1024",
        },
        // Donner accès au joueur
        {
          id: playerDiscordId,
          type: 1,
          allow: "1024",
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Discord:", data);
    return NextResponse.json({ error: "Erreur lors de la création du salon Discord" }, { status: 500 });
  }

  // Message d’accueil
  await fetch(`https://discord.com/api/v10/channels/${data.id}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `👋 Bienvenue <@${playerDiscordId}> et <@${coachDiscordId}> !  
Ce salon est dédié à votre session de coaching #${sessionId}.`,
    }),
  });

  return NextResponse.json({ channelId: data.id });
}
