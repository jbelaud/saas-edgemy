import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Code promo unique pour tous (en variable d'environnement)
const FREE_TRIAL_CODE = process.env.FREE_TRIAL_CODE || 'EDGEMY-FREE1MONTH';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { code, planKey } = await request.json();

    // Vérifier que le code est fourni
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      );
    }

    // Vérifier que le code correspond
    if (code.toUpperCase() !== FREE_TRIAL_CODE) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 400 }
      );
    }

    // Valider le planKey (optionnel, par défaut PRO)
    const selectedPlan = planKey && ['PRO', 'LITE'].includes(planKey) ? planKey : 'PRO';

    // Récupérer le profil coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'essai gratuit a déjà été utilisé
    if (coach.freeTrialUsed) {
      return NextResponse.json(
        { error: 'Code promo déjà utilisé sur ce compte' },
        { status: 400 }
      );
    }

    // Calculer les dates
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 jours

    // Activer l'essai gratuit avec le plan sélectionné
    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        planKey: selectedPlan, // Définir le plan (PRO ou LITE)
        subscriptionPlan: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
        freeTrialUsed: true,
        freeTrialStartDate: now,
        freeTrialEndDate: trialEndDate,
        currentPeriodEnd: trialEndDate,
      },
    });

    console.log(`✅ Essai gratuit ${selectedPlan} activé pour le coach ${coach.id} jusqu'au ${trialEndDate.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Essai gratuit de 30 jours activé avec succès (Plan ${selectedPlan})`,
      endDate: trialEndDate.toISOString(),
      planKey: selectedPlan,
    });

  } catch (error) {
    console.error('Erreur activation essai gratuit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'activation' },
      { status: 500 }
    );
  }
}
