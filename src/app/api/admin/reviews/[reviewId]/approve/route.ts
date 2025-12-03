import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { validateCsrfToken } from '@/lib/security';

/**
 * API pour approuver un avis (admin/coach)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    // Protection CSRF
    const csrfError = await validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { reviewId } = await params;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou coach
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

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

    // Si l'utilisateur est un coach, vérifier qu'il est le propriétaire de l'avis
    if (session.user.role === 'COACH' && review.coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

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
