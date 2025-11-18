import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/coach/reservations
 * Récupère les réservations du coach (avec filtres optionnels)
 * Query params:
 *  - paymentStatus: Filtrer par statut de paiement (ex: EXTERNAL_PENDING)
 *  - status: Filtrer par statut de réservation (ex: CONFIRMED, PENDING, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le profil coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    // Récupérer les paramètres de filtrage
    const { searchParams } = new URL(request.url);
    const paymentStatusFilter = searchParams.get('paymentStatus');
    const statusFilter = searchParams.get('status');

    // Construire le filtre Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      coachId: coach.id,
    };

    if (paymentStatusFilter) {
      where.paymentStatus = paymentStatusFilter;
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    // Récupérer les réservations
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        player: {
          select: {
            name: true,
            email: true,
            image: true,
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

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('❌ Erreur récupération réservations coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
