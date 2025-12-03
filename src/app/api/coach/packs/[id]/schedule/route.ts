import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateCsrfToken } from '@/lib/security';

// POST /api/coach/packs/[id]/schedule - Planifier une nouvelle session d'un pack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Protection CSRF
    const csrfError = await validateCsrfToken(request);
    if (csrfError) return csrfError;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: packId } = await params;
    const body = await request.json();
    const { playerId, startDate, endDate } = body;

    // Validation
    if (!playerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Champs requis manquants: playerId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Vérifier que le pack appartient au coach
    const pack = await prisma.announcementPack.findUnique({
      where: { id: packId },
      include: {
        announcement: true,
        reservations: {
          where: { playerId },
          orderBy: { sessionNumber: 'desc' },
        },
      },
    });

    if (!pack) {
      return NextResponse.json({ error: 'Pack non trouvé' }, { status: 404 });
    }

    if (pack.announcement.coachId !== coach.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier qu'il reste des sessions à planifier
    const existingSessions = pack.reservations.length;
    if (existingSessions >= pack.hours) {
      return NextResponse.json(
        { error: 'Toutes les sessions de ce pack ont déjà été planifiées' },
        { status: 400 }
      );
    }

    // Calculer le numéro de session
    const sessionNumber = existingSessions + 1;

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        announcementId: pack.announcementId,
        coachId: coach.id,
        playerId,
        packId,
        sessionNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'CONFIRMED',
        priceCents: 0, // Le prix a déjà été payé lors de l'achat du pack
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Envoyer une notification au joueur
    console.log('🔔 TODO: Notification à envoyer au joueur', {
      playerId,
      playerEmail: reservation.player.email,
      sessionNumber,
      startDate,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la planification de la session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
