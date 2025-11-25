import { prisma } from './prisma';

/**
 * Calcule les statistiques d'avis d'un coach
 * Uniquement les avis publics et validés
 */
export async function getCoachReviewStats(coachId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      coachId,
      isPublic: true, // Seulement les avis validés
    },
    select: {
      rating: true,
    },
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Arrondi à 1 décimale

  return {
    averageRating,
    totalReviews: reviews.length,
  };
}

/**
 * Récupère les avis publics d'un coach avec détails
 */
export async function getCoachReviews(coachId: string, limit = 10) {
  return prisma.review.findMany({
    where: {
      coachId,
      isPublic: true,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      player: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}
