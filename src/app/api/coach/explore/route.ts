import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeFormats, normalizeLanguages } from "@/constants/poker";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtres optionnels
    const type = searchParams.get('type'); // STRATEGY, REVIEW, TOOL, MENTAL
    const format = searchParams.get('format'); // NLHE, PLO, etc.
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const language = searchParams.get('language');

    // Récupérer tous les coachs avec filtres optionnels
    const coaches = await prisma.coach.findMany({
      where: {
        ...(format && { formats: { has: format } }),
        ...(language && { languages: { has: language } }),
        ...(type && {
          announcements: {
            some: {
              isActive: true,
              type,
            },
          },
        }),
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
        subscriptionStatus: true,
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

    // Normaliser et formater les données des coachs
    const coachesWithStats = filteredCoaches.map((coach) => {
      const priceRange = coach.announcements.length > 0
        ? {
            min: Math.min(...coach.announcements.map((a) => a.priceCents / 100)),
            max: Math.max(...coach.announcements.map((a) => a.priceCents / 100)),
          }
        : null;

      // Normaliser les formats et langues
      const normalizedFormats = normalizeFormats(coach.formats);
      const normalizedLanguages = normalizeLanguages(coach.languages);
      const announcementTypes = [...new Set(coach.announcements.map((a) => a.type))];

      return {
        ...coach,
        formats: normalizedFormats,
        languages: normalizedLanguages,
        priceRange,
        announcementTypes,
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
