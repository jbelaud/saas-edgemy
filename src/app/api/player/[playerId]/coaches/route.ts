import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { playerId } = await params;

    // Vérifier que l'utilisateur accède à ses propres coachs
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Profil joueur non trouvé" },
        { status: 404 }
      );
    }

    if (player.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les coachs avec lesquels le joueur a des réservations
    const reservations = await prisma.reservation.findMany({
      where: {
        playerId: session.user.id,
      },
      include: {
        coach: {
          select: {
            id: true,
            slug: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            formats: true,
            languages: true,
            status: true,
          },
        },
        announcement: {
          select: {
            type: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par coach et compter les sessions
    const coachesMap = new Map();
    
    reservations.forEach((reservation) => {
      const coachId = reservation.coach.id;
      if (!coachesMap.has(coachId)) {
        coachesMap.set(coachId, {
          ...reservation.coach,
          sessionsCount: 0,
          types: new Set(),
        });
      }
      const coachData = coachesMap.get(coachId);
      coachData.sessionsCount++;
      coachData.types.add(reservation.announcement.type);
    });

    // Convertir en tableau et formater
    const coaches = Array.from(coachesMap.values()).map((coach) => ({
      ...coach,
      types: Array.from(coach.types),
    }));

    // Trier par nombre de sessions décroissant
    coaches.sort((a, b) => b.sessionsCount - a.sessionsCount);

    return NextResponse.json({ coaches });
  } catch (error) {
    console.error("Erreur lors de la récupération des coachs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
