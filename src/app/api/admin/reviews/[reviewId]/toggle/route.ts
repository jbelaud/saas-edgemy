import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * API pour basculer la visibilité d'un avis (admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const body = await request.json();
    const { isPublic } = body;

    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Seuls les admins peuvent modifier la visibilité des avis
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Validation
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètre isPublic invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'avis existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour la visibilité
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isPublic },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: isPublic
        ? 'Avis publié avec succès'
        : 'Avis masqué avec succès',
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la visibilité' },
      { status: 500 }
    );
  }
}
