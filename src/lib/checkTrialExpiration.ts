import { prisma } from '@/lib/prisma';

/**
 * Vérifie et met à jour le statut des essais gratuits expirés
 * @param coachId - ID du coach à vérifier
 * @returns Le coach mis à jour (uniquement les champs subscription)
 */
export async function checkAndExpireFreeTrial(coachId: string) {
  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    select: {
      id: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      freeTrialEndDate: true,
    },
  });

  if (!coach) {
    return null;
  }

  // Si le coach est en essai gratuit et que la date d'expiration est passée
  if (
    coach.subscriptionPlan === 'FREE_TRIAL' &&
    coach.subscriptionStatus === 'ACTIVE' &&
    coach.freeTrialEndDate &&
    new Date() > coach.freeTrialEndDate
  ) {
    console.log(`⏰ Essai gratuit expiré pour le coach ${coach.id}`);

    // Mettre à jour le statut
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        subscriptionStatus: 'CANCELED',
        // On garde subscriptionPlan à 'FREE_TRIAL' pour l'historique
        // mais subscriptionStatus passe à 'CANCELED'
      },
    });

    // Retourner uniquement les infos de changement
    return {
      subscriptionStatus: 'CANCELED' as const,
    };
  }

  return null; // Pas de changement
}

/**
 * Calcule le nombre de jours restants pour un essai gratuit
 * @param endDate - Date de fin de l'essai
 * @returns Nombre de jours restants (0 si expiré)
 */
export function getRemainingTrialDays(endDate: Date | null): number {
  if (!endDate) return 0;

  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}
