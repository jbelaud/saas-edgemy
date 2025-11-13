import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/discord/disconnect
 * Déconnecte le compte Discord de l'utilisateur
 */
export async function POST() {
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

    // Supprimer le discordId de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { discordId: null },
    });

    // Mettre à jour le profil coach si existant
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (coach) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { isDiscordConnected: false },
      });
      console.log(`✅ Coach ${coach.id} Discord déconnecté`);
    }

    return NextResponse.json({
      success: true,
      message: 'Discord déconnecté avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion Discord:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
