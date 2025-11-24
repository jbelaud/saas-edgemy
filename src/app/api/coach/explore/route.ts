import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCoachAnnouncements } from "@/lib/announcementFilters";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtres optionnels (conservés pour rétrocompatibilité, mais le filtrage principal se fait côté client)
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const showInactive = searchParams.get('showInactive') === 'true';

    // Récupérer tous les coachs avec leurs annonces (actives et/ou inactives selon le paramètre)
    // Note: Le filtrage fin se fait côté client avec le nouveau système de filtres dynamiques
    const coaches = await prisma.coach.findMany({
      where: {
        ...(language && { languages: { has: language } }),
        ...(type && {
          announcements: {
            some: {
              ...(!showInactive && { isActive: true }),
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
            ...(!showInactive && { isActive: true }),
            ...(type ? { type } : {}),
          },
          select: {
            id: true,
            type: true,
            title: true,
            priceCents: true,
            durationMin: true,
            // STRATEGY - Champs spécifiques
            variant: true,
            format: true,
            abiRange: true,
            tags: true,
            // REVIEW - Champs spécifiques
            reviewType: true,
            reviewSupport: true,
            // TOOL - Champs spécifiques
            toolName: true,
            toolObjective: true,
            // MENTAL - Champs spécifiques
            mentalFocus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Normaliser les données des coachs pour garantir des valeurs canoniques
    const normalizedCoaches = coaches.map(normalizeCoachAnnouncements);

    return NextResponse.json({ coaches: normalizedCoaches });
  } catch (error) {
    console.error("Erreur lors de la récupération des coachs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
