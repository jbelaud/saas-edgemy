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
    // Exclure les sessions non payées (réservations annulées/échouées)
    const reservationWhere: Prisma.ReservationWhereInput = {
      coachId: coach.id,
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
      paymentStatus: {
        in: ['PAID', 'EXTERNAL_PAID'],
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

    // Récupérer TOUTES les sessions d'un pack (réservations + PackageSessions)
    // pour calculer les heures cumulatives correctement
    
    // 1. Réservations de type PACK
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
            id: true,
            packageId: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // 2. PackageSessions (toutes, y compris celles avec réservation)
    const allPackageSessions = await prisma.packageSession.findMany({
      where: {
        packageId: { in: uniquePackageIds },
      },
      select: {
        id: true,
        packageId: true,
        startDate: true,
        endDate: true,
        durationMinutes: true,
        reservationId: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Type unifié pour les sessions de pack
    type UnifiedPackSession = {
      id: string;
      type: 'reservation' | 'package_session';
      packageId: string;
      startDate: Date;
      endDate: Date;
      durationHours: number;
    };

    // Créer un map coachingPackageId -> sessions unifiées triées par date
    const packSessionsMap = new Map<string, UnifiedPackSession[]>();
    
    // Ajouter les PackageSessions (source de vérité pour les sessions planifiées)
    for (const ps of allPackageSessions) {
      const existing = packSessionsMap.get(ps.packageId) || [];
      const durationHours = ps.durationMinutes / 60;
      existing.push({
        id: ps.reservationId || ps.id, // Utiliser l'ID de réservation si existe, sinon l'ID de PackageSession
        type: ps.reservationId ? 'reservation' : 'package_session',
        packageId: ps.packageId,
        startDate: ps.startDate,
        endDate: ps.endDate,
        durationHours,
      });
      packSessionsMap.set(ps.packageId, existing);
    }

    // Trier chaque liste par date
    for (const [packageId, sessions] of packSessionsMap) {
      sessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      packSessionsMap.set(packageId, sessions);
    }

    // Fonction pour calculer les heures cumulatives utilisées (incluant cette session)
    const getSessionInfo = (sessionId: string, coachingPackageId: string | null, sessionType: 'reservation' | 'package_session') => {
      if (!coachingPackageId) return { 
        sessionNumber: null, 
        isFirstSession: false,
        cumulativeHoursUsed: null,
        sessionDurationHours: null,
        progressPercent: null,
      };
      
      const allSessions = packSessionsMap.get(coachingPackageId) || [];
      const packageInfo = packagesMap.get(coachingPackageId);
      if (!packageInfo || allSessions.length === 0) return { 
        sessionNumber: null, 
        isFirstSession: false,
        cumulativeHoursUsed: null,
        sessionDurationHours: null,
        progressPercent: null,
      };

      // Trouver l'index de cette session (1-indexed)
      const sessionIndex = allSessions.findIndex(s => s.id === sessionId);
      const sessionNumber = sessionIndex >= 0 ? sessionIndex + 1 : null;
      const isFirstSession = sessionIndex === 0;

      // Calculer les heures cumulatives INCLUANT cette session
      let cumulativeHoursUsed = 0;
      for (let i = 0; i <= sessionIndex && i < allSessions.length; i++) {
        cumulativeHoursUsed += allSessions[i].durationHours;
      }

      // Durée de cette session spécifique
      const currentSession = allSessions[sessionIndex];
      const sessionDurationHours = currentSession?.durationHours || 0;

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
      const sessionInfo = getSessionInfo(reservation.id, coachingPackageId, 'reservation');

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

      // Utiliser getSessionInfo pour calculer les heures cumulatives correctement
      const sessionInfo = getSessionInfo(ps.id, ps.packageId, 'package_session');

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
          progressPercent: sessionInfo.progressPercent ?? 0,
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
