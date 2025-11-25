import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API pour récupérer TOUS les avis (pour modération admin)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est admin
    // const session = await getAuth(request);
    // if (!session || session.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    // Récupérer tous les avis avec toutes les informations
    const reviews = await prisma.review.findMany({
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
        reservation: {
          select: {
            id: true,
            startDate: true,
          },
        },
      },
      orderBy: [
        { isPublic: 'asc' }, // Avis non publiés en premier
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}
