import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/discord/check-member
 * Vérifie si l'utilisateur est membre du serveur Discord Edgemy
 */
export async function GET() {
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

    // Récupérer le discordId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discordId: true },
    });

    if (!user?.discordId) {
      return NextResponse.json({
        isMember: false,
        reason: 'discord_not_connected',
        message: 'Compte Discord non connecté',
      });
    }

    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
      console.error('Variables Discord manquantes');
      return NextResponse.json(
        { error: 'Configuration Discord incomplète' },
        { status: 500 }
      );
    }

    // Vérifier si l'utilisateur est membre du serveur via l'API Discord
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${user.discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (memberResponse.ok) {
      // L'utilisateur est membre du serveur
      return NextResponse.json({
        isMember: true,
        discordId: user.discordId,
      });
    } else if (memberResponse.status === 404) {
      // L'utilisateur n'est pas membre du serveur
      return NextResponse.json({
        isMember: false,
        reason: 'not_member',
        message: 'Vous n\'êtes pas membre du serveur Discord Edgemy',
        discordId: user.discordId,
      });
    } else {
      // Erreur lors de la vérification
      const errorText = await memberResponse.text();
      console.error('Erreur vérification membre Discord:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur check-member:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
