import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtres optionnels
    const type = searchParams.get('type'); // STRATEGY, REVIEW, TOOL, MENTAL
    const format = searchParams.get('format'); // NLHE, PLO, etc.
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const language = searchParams.get('language');

    // Récupérer les coachs actifs
    const coaches = await prisma.coach.findMany({
      where: {
        status: 'ACTIVE',
        ...(format && { formats: { has: format } }),
        ...(language && { languages: { has: language } }),
      },
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        formats: true,
        languages: true,
        experience: true,
        roi: true,
        stakes: true,
        badges: true,
        announcements: {
          where: {
            isActive: true,
            ...(type ? { type } : {}),
          },
          select: {
            id: true,
            type: true,
            title: true,
            priceCents: true,
            durationMin: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrer par prix si spécifié
    let filteredCoaches = coaches;
    if (minPrice || maxPrice) {
      filteredCoaches = coaches.filter((coach) => {
        if (coach.announcements.length === 0) return false;
        
        const prices = coach.announcements.map((a) => a.priceCents / 100);
        const minCoachPrice = Math.min(...prices);
        const maxCoachPrice = Math.max(...prices);
        
        if (minPrice && maxCoachPrice < parseFloat(minPrice)) return false;
        if (maxPrice && minCoachPrice > parseFloat(maxPrice)) return false;
        
        return true;
      });
    }

    // Calculer des statistiques pour chaque coach
    const coachesWithStats = filteredCoaches.map((coach) => {
      const priceRange = coach.announcements.length > 0
        ? {
            min: Math.min(...coach.announcements.map((a) => a.priceCents / 100)),
            max: Math.max(...coach.announcements.map((a) => a.priceCents / 100)),
          }
        : null;

      return {
        ...coach,
        priceRange,
        announcementTypes: [...new Set(coach.announcements.map((a) => a.type))],
      };
    });

    return NextResponse.json({ coaches: coachesWithStats });
  } catch (error) {
    console.error("Erreur lors de la récupération des coachs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
