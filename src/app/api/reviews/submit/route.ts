import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { validateCsrfToken } from '@/lib/security';

/**
 * API pour soumettre un avis externe (sans réservation)
 * Crée automatiquement un compte joueur si l'email n'existe pas
 */
export async function POST(request: NextRequest) {
  try {
    // Protection CSRF
    const csrfError = await validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const { coachId, rating, comment, playerName, playerEmail } = body;

    // Validation
    if (!coachId || typeof coachId !== 'string') {
      return NextResponse.json(
        { error: 'Coach ID invalide' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Note invalide (doit être entre 1 et 5)' },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 10) {
      return NextResponse.json(
        { error: 'Commentaire trop court (minimum 10 caractères)' },
        { status: 400 }
      );
    }

    if (!playerName || playerName.length < 2) {
      return NextResponse.json(
        { error: 'Nom invalide' },
        { status: 400 }
      );
    }

    if (!playerEmail || !playerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le coach existe
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: { id: true, slug: true },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach non trouvé' },
        { status: 404 }
      );
    }

    // Trouver ou créer le joueur
    let user = await prisma.user.findUnique({
      where: { email: playerEmail.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      // Créer un nouveau compte utilisateur basique
      const now = new Date();
      user = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: playerEmail.toLowerCase(),
          name: playerName,
          emailVerified: false,
          role: 'PLAYER',
          createdAt: now,
          updatedAt: now,
        },
        select: { id: true },
      });
    }

    // Vérifier si le joueur n'a pas déjà laissé un avis pour ce coach
    const existingReview = await prisma.review.findFirst({
      where: {
        coachId: coach.id,
        playerId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour ce coach' },
        { status: 400 }
      );
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        coachId: coach.id,
        playerId: user.id,
        rating,
        comment,
        isPublic: false, // Pas public par défaut, nécessite validation manuelle
        isVerified: false,
        source: 'EXTERNAL',
      },
    });

    // TODO: Envoyer notification au coach et/ou admin pour validation
    // await sendReviewNotification(coach.id, review.id);

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      coachSlug: coach.slug,
      message: 'Avis soumis avec succès. Il sera publié après validation.',
    });
  } catch (error) {
    console.error('Error submitting review:', error);

    // Gestion des erreurs Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Un avis existe déjà pour ce coach' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la soumission de l\'avis' },
      { status: 500 }
    );
  }
}
