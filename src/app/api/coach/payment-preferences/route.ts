import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/coach/payment-preferences
 * Récupère les préférences de paiement du coach
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: {
        paymentPreferences: true,
        planKey: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      paymentPreferences: coach.paymentPreferences || [],
      planKey: coach.planKey,
    });
  } catch (error) {
    console.error('❌ Erreur récupération préférences paiement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/payment-preferences
 * Met à jour les préférences de paiement du coach (plan LITE)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentPreferences } = body;

    if (!Array.isArray(paymentPreferences)) {
      return NextResponse.json(
        { error: 'paymentPreferences doit être un tableau de chaînes' },
        { status: 400 }
      );
    }

    // Vérifier que ce sont bien des strings
    if (!paymentPreferences.every(pref => typeof pref === 'string')) {
      return NextResponse.json(
        { error: 'Les préférences doivent être des chaînes de caractères' },
        { status: 400 }
      );
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true, planKey: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    // Mettre à jour les préférences
    const updatedCoach = await prisma.coach.update({
      where: { id: coach.id },
      data: {
        paymentPreferences: paymentPreferences,
      },
      select: {
        paymentPreferences: true,
        planKey: true,
      },
    });

    console.log(`✅ Préférences de paiement mises à jour pour coach ${coach.id}`);

    return NextResponse.json({
      success: true,
      paymentPreferences: updatedCoach.paymentPreferences,
      message: 'Préférences de paiement mises à jour',
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour préférences paiement:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
