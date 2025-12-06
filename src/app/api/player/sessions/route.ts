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
    // Inclure PENDING pour les anciennes réservations LITE créées avant la correction
    const reservations = await prisma.reservation.findMany({
      where: {
        playerId: session.user.id,
        status: {
          in: ['CONFIRMED', 'COMPLETED', 'PENDING'],
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        paymentStatus: true,
        packId: true,
        discordChannelId: true,
        type: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            planKey: true,
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
            durationMin: true,
          },
        },
        pack: {
          select: {
            hours: true,
          },
        },
        packageSession: {
          select: {
            id: true,
            packageId: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Récupérer les informations des packs pour les sessions de pack
    const packageIds = reservations
      .filter(r => r.packageSession?.packageId)
      .map(r => r.packageSession!.packageId);

    const uniquePackageIds = [...new Set(packageIds)];

    const coachingPackages = await prisma.coachingPackage.findMany({
      where: {
        id: { in: uniquePackageIds },
      },
      select: {
        id: true,
        totalHours: true,
        remainingHours: true,
        sessionsCompletedCount: true,
        sessionsTotalCount: true,
        coachId: true,
        announcementId: true,
      },
    });

    // Créer un map pour accès rapide
    const packagesMap = new Map(
      coachingPackages.map(p => [p.id, p])
    );

    // Enrichir les réservations avec les infos du pack
    const enrichedReservations = reservations.map(reservation => {
      const packageInfo = reservation.packageSession?.packageId
        ? packagesMap.get(reservation.packageSession.packageId)
        : null;

      return {
        ...reservation,
        coachingPackage: packageInfo ? {
          id: packageInfo.id,
          totalHours: packageInfo.totalHours,
          remainingHours: packageInfo.remainingHours,
          sessionsCompletedCount: packageInfo.sessionsCompletedCount,
          sessionsTotalCount: packageInfo.sessionsTotalCount,
          progressPercent: packageInfo.totalHours > 0
            ? ((packageInfo.totalHours - packageInfo.remainingHours) / packageInfo.totalHours) * 100
            : 0,
        } : null,
      };
    });

    // Séparer les sessions à venir et passées
    const now = new Date();
    // Une session est "upcoming" si elle n'a pas encore commencé OU si elle est en cours
    const upcoming = enrichedReservations.filter(r => new Date(r.endDate) > now);
    // Une session est "past" si elle est terminée
    const past = enrichedReservations.filter(r => new Date(r.endDate) <= now);

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
