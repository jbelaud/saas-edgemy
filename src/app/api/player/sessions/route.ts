import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer toutes les sessions du joueur (réservations + sessions de pack)
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le discordId du joueur
    const player = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discordId: true },
    });

    // Récupérer toutes les réservations du joueur
    const reservations = await prisma.reservation.findMany({
      where: {
        playerId: session.user.id,
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        announcement: {
          select: {
            title: true,
            durationMin: true,
          },
        },
        pack: {
          select: {
            hours: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Séparer les sessions à venir et passées
    const now = new Date();
    const upcoming = reservations.filter(r => new Date(r.startDate) > now);
    const past = reservations.filter(r => new Date(r.startDate) <= now);

    return NextResponse.json({ 
      upcoming, 
      past,
      playerDiscordId: player?.discordId || null,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
