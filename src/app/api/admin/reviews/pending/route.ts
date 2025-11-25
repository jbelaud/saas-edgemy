import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewSource } from '@prisma/client';

/**
 * API pour récupérer les avis en attente de validation
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est admin ou coach
    // const session = await getAuth(request);
    // if (!session || (session.role !== 'ADMIN' && session.role !== 'COACH')) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const coachId = searchParams.get('coachId'); // Optionnel : filtrer par coach

    const where = {
      isPublic: false, // Avis non encore publiés
      source: ReviewSource.EXTERNAL, // Uniquement les avis externes
      ...(coachId && { coachId }),
    };

    // Récupérer les avis en attente
    const pendingReviews = await prisma.review.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            avatarUrl: true,
          },
        },
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: pendingReviews.length,
      reviews: pendingReviews,
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}
