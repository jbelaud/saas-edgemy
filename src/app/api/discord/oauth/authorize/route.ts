import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/discord/oauth/authorize
 * Redirige vers Discord pour l'autorisation OAuth2
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/fr/sign-in?error=unauthorized', request.url)
      );
    }

    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

    if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
      console.error('Variables Discord OAuth manquantes');
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=config', request.url)
      );
    }

    // Construire l'URL d'autorisation Discord
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordAuthUrl.searchParams.set('client_id', DISCORD_CLIENT_ID);
    discordAuthUrl.searchParams.set('redirect_uri', DISCORD_REDIRECT_URI);
    discordAuthUrl.searchParams.set('response_type', 'code');
    discordAuthUrl.searchParams.set('scope', 'identify');

    return NextResponse.redirect(discordAuthUrl.toString());
  } catch (error) {
    console.error('Erreur lors de l\'autorisation Discord:', error);
    return NextResponse.redirect(
      new URL('/fr/player/settings?discord_error=server', request.url)
    );
  }
}
