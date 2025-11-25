import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API pour approuver un avis (admin/coach)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    // TODO: Vérifier que l'utilisateur est admin ou le coach concerné
    // const session = await getAuth(request);
    // if (!session || (session.role !== 'ADMIN' && session.role !== 'COACH')) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    // Récupérer l'avis
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        coach: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // TODO: Vérifier que l'utilisateur est le coach ou admin
    // if (session.role === 'COACH' && review.coach.userId !== session.userId) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    // Approuver l'avis
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Avis approuvé et publié avec succès',
    });
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation de l\'avis' },
      { status: 500 }
    );
  }
}
