import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ensureMemberRole } from '@/lib/discord/roles';

/**
 * GET /api/discord/oauth/callback
 * Callback OAuth2 Discord pour lier le compte Discord à l'utilisateur
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

    // Récupérer le code d'autorisation
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Erreur OAuth Discord:', error);
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=access_denied', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=no_code', request.url)
      );
    }

    // Échanger le code contre un access token
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
      console.error('Variables Discord OAuth manquantes');
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=config', request.url)
      );
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur échange token Discord:', errorText);
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=token_exchange', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Récupérer les informations de l'utilisateur Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Erreur récupération utilisateur Discord:', errorText);
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=user_fetch', request.url)
      );
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.username;
    const discordDiscriminator = discordUser.discriminator;

    // Construire l'URL Discord (format pour ouvrir un DM ou afficher le tag)
    const discordTag = discordDiscriminator && discordDiscriminator !== '0'
      ? `${discordUsername}#${discordDiscriminator}`
      : discordUsername;

    // Vérifier si ce Discord ID est déjà utilisé par un autre compte
    const existingUser = await prisma.user.findUnique({
      where: { discordId },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.redirect(
        new URL('/fr/player/settings?discord_error=already_linked', request.url)
      );
    }

    // Mettre à jour l'utilisateur avec son Discord ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: { discordId },
    });

    // Vérifier si c'est un coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    const role = coach ? 'COACH' : 'PLAYER';
    const roleId = role === 'COACH' 
      ? process.env.DISCORD_COACH_ROLE_ID 
      : process.env.DISCORD_PLAYER_ROLE_ID;

    console.log(`[Discord OAuth] Utilisateur: ${discordTag}, Role: ${role}, RoleId: ${roleId || 'NON DÉFINI'}`);
    console.log(`[Discord OAuth] DISCORD_COACH_ROLE_ID: ${process.env.DISCORD_COACH_ROLE_ID || 'NON DÉFINI'}`);
    console.log(`[Discord OAuth] DISCORD_PLAYER_ROLE_ID: ${process.env.DISCORD_PLAYER_ROLE_ID || 'NON DÉFINI'}`);

    // Ajouter automatiquement l'utilisateur au serveur Discord avec le bon rôle
    const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (DISCORD_GUILD_ID && DISCORD_BOT_TOKEN) {
      try {
        const addMemberResponse = await fetch(
          `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              roles: roleId ? [roleId] : [],
            }),
          }
        );

        if (addMemberResponse.status === 201) {
          console.log(`✅ Utilisateur ${discordTag} ajouté au serveur Discord avec rôle ${role}`);
        } else if (addMemberResponse.status === 204) {
          // L'utilisateur est déjà membre, on met à jour son rôle
          console.log(`ℹ️ Utilisateur ${discordTag} déjà membre du serveur, mise à jour du rôle...`);
          await ensureMemberRole({ discordId, role });
        } else {
          const errorText = await addMemberResponse.text();
          console.error(`⚠️ Erreur ajout membre Discord (${addMemberResponse.status}):`, errorText);
          // On continue quand même, l'utilisateur devra rejoindre manuellement
        }
      } catch (discordError) {
        console.error('⚠️ Erreur lors de l\'ajout au serveur Discord:', discordError);
        // On continue quand même, ce n'est pas bloquant
      }
    }

    // Mettre à jour le profil coach si existant
    if (coach) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: {
          isDiscordConnected: true,
          discordUrl: `https://discord.com/users/${discordId}`,
        },
      });
      console.log(`✅ Coach ${coach.id} Discord connecté - Tag: ${discordTag}`);
    }

    // Déterminer l'URL de redirection en fonction du rôle
    const redirectUrl = coach
      ? '/fr/coach/settings?discord_success=true'
      : '/fr/player/settings?discord_success=true';

    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(
      new URL(redirectUrl, request.url)
    );
  } catch (error) {
    console.error('Erreur lors du callback OAuth Discord:', error);
    return NextResponse.redirect(
      new URL('/fr/player/settings?discord_error=server', request.url)
    );
  }
}
