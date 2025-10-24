import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les réservations du joueur
    const reservations = await prisma.reservation.findMany({
      where: { 
        playerId: session.user.id,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            slug: true,
          },
        },
        announcement: {
          select: {
            title: true,
            durationMin: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
