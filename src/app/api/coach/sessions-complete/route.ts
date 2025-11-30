import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Prisma } from '@prisma/client';

/**
 * GET /api/coach/sessions-complete
 *
 * Récupère toutes les sessions du coach (réservations + sessions de pack planifiées)
 * avec filtres avancés par période et par élève
 *
 * Query params:
 * - period: 'week' | 'month' | 'year' | 'all' (défaut: 'all')
 * - studentId: ID du joueur pour filtrer par élève
 * - type: 'upcoming' | 'past' | 'all' (défaut: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all';
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type') || 'all';

    // Calculer les dates de début et fin selon la période
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Lundi
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'all':
      default:
        // Pas de filtre de date
        break;
    }

    // Mettre à jour automatiquement les sessions passées
    // Sessions de pack SCHEDULED → COMPLETED si la date est passée
    await prisma.packageSession.updateMany({
      where: {
        package: {
          coachId: coach.id,
        },
        status: 'SCHEDULED',
        endDate: { lt: now },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    // Réservations CONFIRMED → COMPLETED si la date est passée et payée
    await prisma.reservation.updateMany({
      where: {
        coachId: coach.id,
        status: 'CONFIRMED',
        endDate: { lt: now },
        paymentStatus: 'PAID',
      },
      data: {
        status: 'COMPLETED',
      },
    });

    // Construire le filtre de base pour les réservations
    const reservationWhere: Prisma.ReservationWhereInput = {
      coachId: coach.id,
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
    };

    // Filtre par élève
    if (studentId) {
      reservationWhere.playerId = studentId;
    }

    // Filtre par période
    if (startDate && endDate) {
      reservationWhere.startDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filtre par type (upcoming/past)
    if (type === 'upcoming') {
      reservationWhere.endDate = { gt: now };
    } else if (type === 'past') {
      reservationWhere.endDate = { lte: now };
    }

    // Récupérer les réservations
    const reservations = await prisma.reservation.findMany({
      where: reservationWhere,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        paymentStatus: true,
        priceCents: true,
        coachNetCents: true,
        coachEarningsCents: true,
        type: true,
        packId: true,
        discordChannelId: true,
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
            status: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Récupérer les PackageSessions planifiées par le coach (sans réservation)
    let packageSessionWhere: Prisma.PackageSessionWhereInput = {
      package: {
        coachId: coach.id,
      },
      reservationId: null, // Sessions planifiées mais pas encore réservées
    };

    // Filtre par élève
    if (studentId) {
      packageSessionWhere = {
        ...packageSessionWhere,
        package: {
          coachId: coach.id,
          playerId: studentId,
        },
      };
    }

    // Filtre par période
    if (startDate && endDate) {
      packageSessionWhere.startDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filtre par type (upcoming/past)
    if (type === 'upcoming') {
      packageSessionWhere.endDate = { gt: now };
    } else if (type === 'past') {
      packageSessionWhere.endDate = { lte: now };
    }

    const packageSessions = await prisma.packageSession.findMany({
      where: packageSessionWhere,
      select: {
        id: true,
        packageId: true,
        startDate: true,
        endDate: true,
        durationMinutes: true,
        status: true,
        package: {
          select: {
            id: true,
            totalHours: true,
            remainingHours: true,
            sessionsCompletedCount: true,
            sessionsTotalCount: true,
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            announcement: {
              select: {
                id: true,
                title: true,
                durationMin: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Récupérer les informations des packs pour les sessions de pack
    const packageIds = [
      ...reservations
        .filter(r => r.packageSession?.packageId)
        .map(r => r.packageSession!.packageId),
      ...packageSessions.map(ps => ps.packageId),
    ];

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
      },
    });

    // Créer un map pour accès rapide
    const packagesMap = new Map(
      coachingPackages.map(p => [p.id, p])
    );

    // Récupérer TOUTES les réservations de type PACK pour calculer les heures cumulatives
    // On utilise packageSession.packageId (CoachingPackage) pour regrouper les sessions
    const allPackReservations = await prisma.reservation.findMany({
      where: {
        type: 'PACK',
        packageSession: {
          packageId: { in: uniquePackageIds },
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        packageSession: {
          select: {
            packageId: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc', // Ordre chronologique pour numéroter
      },
    });

    // Créer un map coachingPackageId -> réservations triées par date
    const packReservationsMap = new Map<string, typeof allPackReservations>();
    for (const res of allPackReservations) {
      const coachingPackageId = res.packageSession?.packageId;
      if (coachingPackageId) {
        const existing = packReservationsMap.get(coachingPackageId) || [];
        existing.push(res);
        packReservationsMap.set(coachingPackageId, existing);
      }
    }

    // Fonction pour calculer les heures cumulatives utilisées (incluant cette session)
    const getSessionInfo = (reservationId: string, coachingPackageId: string | null) => {
      if (!coachingPackageId) return { 
        sessionNumber: null, 
        isFirstSession: false,
        cumulativeHoursUsed: null,
        sessionDurationHours: null,
        progressPercent: null,
      };
      
      const packReservations = packReservationsMap.get(coachingPackageId) || [];
      const packageInfo = packagesMap.get(coachingPackageId);
      if (!packageInfo) return { 
        sessionNumber: null, 
        isFirstSession: false,
        cumulativeHoursUsed: null,
        sessionDurationHours: null,
        progressPercent: null,
      };

      // Trouver l'index de cette session (1-indexed)
      const sessionIndex = packReservations.findIndex(s => s.id === reservationId);
      const sessionNumber = sessionIndex >= 0 ? sessionIndex + 1 : null;
      const isFirstSession = sessionIndex === 0;

      // Calculer les heures cumulatives INCLUANT cette session
      let cumulativeHoursUsed = 0;
      for (let i = 0; i <= sessionIndex && i < packReservations.length; i++) {
        const session = packReservations[i];
        const durationMs = new Date(session.endDate).getTime() - new Date(session.startDate).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        cumulativeHoursUsed += durationHours;
      }

      // Durée de cette session spécifique
      const currentSession = packReservations[sessionIndex];
      let sessionDurationHours = 0;
      if (currentSession) {
        const durationMs = new Date(currentSession.endDate).getTime() - new Date(currentSession.startDate).getTime();
        sessionDurationHours = durationMs / (1000 * 60 * 60);
      }

      // Pourcentage de progression basé sur les heures cumulatives
      const progressPercent = packageInfo.totalHours > 0 
        ? (cumulativeHoursUsed / packageInfo.totalHours) * 100 
        : 0;

      return { 
        sessionNumber, 
        isFirstSession,
        cumulativeHoursUsed,
        sessionDurationHours,
        progressPercent,
      };
    };

    // Enrichir les réservations avec les infos du pack
    const enrichedReservations = reservations.map(reservation => {
      const packageInfo = reservation.packageSession?.packageId
        ? packagesMap.get(reservation.packageSession.packageId)
        : null;

      // Calculer le montant pour le coach
      const coachAmount = reservation.coachNetCents || reservation.coachEarningsCents || reservation.priceCents;

      // Récupérer les infos de progression du pack (utiliser packageSession.packageId = CoachingPackage)
      const coachingPackageId = reservation.packageSession?.packageId || null;
      const sessionInfo = getSessionInfo(reservation.id, coachingPackageId);

      return {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        priceCents: reservation.priceCents,
        coachAmountCents: coachAmount,
        type: 'reservation' as const,
        reservationType: reservation.type,
        discordChannelId: reservation.discordChannelId,
        player: reservation.player,
        announcement: reservation.announcement,
        durationMinutes: reservation.announcement.durationMin,
        // Infos spécifiques aux packs - heures cumulatives
        sessionNumber: sessionInfo.sessionNumber,
        isFirstSession: sessionInfo.isFirstSession,
        cumulativeHoursUsed: sessionInfo.cumulativeHoursUsed,
        sessionDurationHours: sessionInfo.sessionDurationHours,
        packProgressPercent: sessionInfo.progressPercent,
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

    // Enrichir les PackageSessions avec les infos du pack
    const enrichedPackageSessions = packageSessions.map(ps => {
      const packageInfo = packagesMap.get(ps.packageId);

      // Calculer la durée de cette session en heures
      const sessionDurationHours = ps.durationMinutes / 60;
      
      // Pour les PackageSessions, calculer les heures utilisées jusqu'à présent
      const hoursUsed = packageInfo ? (packageInfo.totalHours - packageInfo.remainingHours) : 0;
      const progressPercent = packageInfo && packageInfo.totalHours > 0 
        ? (hoursUsed / packageInfo.totalHours) * 100 
        : 0;

      return {
        id: ps.id,
        startDate: ps.startDate,
        endDate: ps.endDate,
        status: ps.status,
        paymentStatus: 'PAID' as const, // Les PackageSessions sont toujours payées via le pack
        priceCents: 0,
        coachAmountCents: 0,
        type: 'package_session' as const,
        reservationType: 'PACK' as const,
        discordChannelId: null,
        player: ps.package.player,
        announcement: ps.package.announcement,
        durationMinutes: ps.durationMinutes,
        // Infos spécifiques aux packs - heures cumulatives
        sessionNumber: null,
        isFirstSession: false,
        cumulativeHoursUsed: hoursUsed + sessionDurationHours, // Heures après cette session
        sessionDurationHours: sessionDurationHours,
        packProgressPercent: progressPercent,
        coachingPackage: packageInfo ? {
          id: packageInfo.id,
          totalHours: packageInfo.totalHours,
          remainingHours: packageInfo.remainingHours,
          sessionsCompletedCount: packageInfo.sessionsCompletedCount,
          sessionsTotalCount: packageInfo.sessionsTotalCount,
          progressPercent: progressPercent,
        } : null,
      };
    });

    // Combiner et trier toutes les sessions
    const allSessions = [...enrichedReservations, ...enrichedPackageSessions]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Séparer upcoming et past
    const upcoming = allSessions.filter(s => new Date(s.endDate) > now);
    const past = allSessions.filter(s => new Date(s.endDate) <= now);

    // Récupérer la liste des élèves pour le filtre
    const students = await prisma.user.findMany({
      where: {
        OR: [
          {
            reservations: {
              some: {
                coachId: coach.id,
                status: {
                  in: ['CONFIRMED', 'COMPLETED'],
                },
              },
            },
          },
          {
            coachingPackages: {
              some: {
                coachId: coach.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      distinct: ['id'],
    });

    return NextResponse.json({
      sessions: allSessions,
      upcoming,
      past,
      students,
      stats: {
        total: allSessions.length,
        upcoming: upcoming.length,
        past: past.length,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
