/**
 * Helpers métier pour Edgemy
 * Fonctions réutilisables pour la logique business
 */

import { db } from '@/lib/db';
import { RoleType, SubscriptionStatus, PlanType } from '@prisma/client';

// ==================== ROLES ====================

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export async function userHasRole(userId: string, roleType: RoleType): Promise<boolean> {
  const role = await db.userRole.findFirst({
    where: {
      userId,
      type: roleType,
    },
  });
  return !!role;
}

/**
 * Ajoute un rôle à un utilisateur (si pas déjà présent)
 */
export async function addRoleToUser(userId: string, roleType: RoleType) {
  return db.userRole.upsert({
    where: {
      type_userId: {
        type: roleType,
        userId,
      },
    },
    create: {
      type: roleType,
      userId,
    },
    update: {},
  });
}

/**
 * Retire un rôle à un utilisateur
 */
export async function removeRoleFromUser(userId: string, roleType: RoleType) {
  return db.userRole.deleteMany({
    where: {
      userId,
      type: roleType,
    },
  });
}

// ==================== SUBSCRIPTIONS ====================

/**
 * Vérifie si un utilisateur a un abonnement actif d'un type donné
 */
export async function hasActiveSubscription(
  userId: string,
  planType?: PlanType
): Promise<boolean> {
  const where = {
    userId,
    status: SubscriptionStatus.ACTIVE,
    ...(planType && { plan: planType }),
  };

  const subscription = await db.subscription.findFirst({ where });
  return !!subscription;
}

/**
 * Récupère l'abonnement actif d'un utilisateur
 */
export async function getActiveSubscription(userId: string, planType?: PlanType) {
  const where = {
    userId,
    status: SubscriptionStatus.ACTIVE,
    ...(planType && { plan: planType }),
  };

  return db.subscription.findFirst({ where });
}

/**
 * Vérifie si un utilisateur est coach actif (rôle + abonnement)
 */
export async function isActiveCoach(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      subscriptions: {
        where: {
          status: SubscriptionStatus.ACTIVE,
          plan: {
            in: [PlanType.COACH_MONTHLY, PlanType.COACH_YEARLY],
          },
        },
      },
    },
  });

  if (!user) return false;

  const hasCoachRole = user.roles.some((r) => r.type === RoleType.COACH);
  const hasActiveCoachSubscription = user.subscriptions.length > 0;

  return hasCoachRole && hasActiveCoachSubscription;
}

/**
 * Vérifie si un utilisateur est player premium
 */
export async function isPremiumPlayer(userId: string): Promise<boolean> {
  return hasActiveSubscription(userId, PlanType.PLAYER_PREMIUM);
}

// ==================== COMMISSION ====================

/**
 * Calcule les frais de commission pour une réservation
 */
export async function calculateCommissionFee(
  userId: string,
  offerPrice: number
): Promise<{ commissionRate: number; commissionFee: number; totalPrice: number }> {
  // Vérifier si le joueur est premium
  const isPremium = await isPremiumPlayer(userId);

  if (isPremium) {
    return {
      commissionRate: 0,
      commissionFee: 0,
      totalPrice: offerPrice,
    };
  }

  // Récupérer le taux de commission du joueur
  const playerProfile = await db.playerProfile.findUnique({
    where: { userId },
  });

  const commissionRate = playerProfile?.commissionRate || 0.05; // 5% par défaut
  const commissionFee = offerPrice * commissionRate;
  const totalPrice = offerPrice + commissionFee;

  return {
    commissionRate,
    commissionFee,
    totalPrice,
  };
}

// ==================== USER CREATION ====================

/**
 * Crée un utilisateur avec le rôle PLAYER par défaut
 */
export async function createPlayerUser(data: {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  image?: string;
}) {
  return db.user.create({
    data: {
      ...data,
      roles: {
        create: {
          type: RoleType.PLAYER,
        },
      },
      playerProfile: {
        create: {
          commissionRate: 0.05, // 5% par défaut
        },
      },
    },
    include: {
      roles: true,
      playerProfile: true,
    },
  });
}

/**
 * Upgrade un utilisateur en coach (après paiement Stripe)
 */
export async function upgradeToCoach(
  userId: string,
  subscriptionData: {
    plan: PlanType;
    stripeId: string;
    expiresAt?: Date;
  }
) {
  return db.user.update({
    where: { id: userId },
    data: {
      roles: {
        connectOrCreate: {
          where: {
            type_userId: {
              type: RoleType.COACH,
              userId,
            },
          },
          create: {
            type: RoleType.COACH,
          },
        },
      },
      subscriptions: {
        create: {
          plan: subscriptionData.plan,
          stripeId: subscriptionData.stripeId,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          expiresAt: subscriptionData.expiresAt,
        },
      },
      coachProfile: {
        connectOrCreate: {
          where: { userId },
          create: {},
        },
      },
    },
    include: {
      roles: true,
      subscriptions: true,
      coachProfile: true,
    },
  });
}

/**
 * Upgrade un joueur en premium (après paiement Stripe)
 */
export async function upgradeToPlayerPremium(
  userId: string,
  subscriptionData: {
    stripeId: string;
    expiresAt?: Date;
  }
) {
  return db.user.update({
    where: { id: userId },
    data: {
      subscriptions: {
        create: {
          plan: PlanType.PLAYER_PREMIUM,
          stripeId: subscriptionData.stripeId,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          expiresAt: subscriptionData.expiresAt,
        },
      },
      playerProfile: {
        update: {
          commissionRate: 0, // Plus de commission
        },
      },
    },
    include: {
      subscriptions: true,
      playerProfile: true,
    },
  });
}

// ==================== PERMISSIONS ====================

/**
 * Middleware: Vérifie que l'utilisateur est un coach actif
 * @throws Error si l'utilisateur n'est pas coach ou n'a pas d'abonnement actif
 */
export async function requireActiveCoach(userId: string) {
  const isCoach = await isActiveCoach(userId);

  if (!isCoach) {
    throw new Error('Abonnement coach actif requis');
  }

  return db.user.findUnique({
    where: { id: userId },
    include: {
      coachProfile: true,
      roles: true,
      subscriptions: {
        where: { status: SubscriptionStatus.ACTIVE },
      },
    },
  });
}

/**
 * Middleware: Vérifie que l'utilisateur existe
 * @throws Error si l'utilisateur n'existe pas
 */
export async function requireUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      playerProfile: true,
      coachProfile: true,
    },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  return user;
}
