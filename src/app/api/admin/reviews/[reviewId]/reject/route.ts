import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API pour rejeter/supprimer un avis (admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    // TODO: Vérifier que l'utilisateur est admin
    // const session = await getAuth(request);
    // if (!session || session.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

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

    // Supprimer l'avis
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    );
  }
}
