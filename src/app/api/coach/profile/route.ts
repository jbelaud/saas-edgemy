import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { updateCoachProfileSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { validateCsrfToken } from '@/lib/security';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    // Retourner 200 même si pas de profil coach (comportement normal pour un joueur)
    return NextResponse.json({ coach: coach || null });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Protection CSRF
    const csrfError = await validateCsrfToken(request);
    if (csrfError) return csrfError;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est bien un coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validation avec Zod
    const validationResult = updateCoachProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Mettre à jour le profil coach
    const updatedCoach = await prisma.coach.update({
      where: { id: coach.id },
      data: updateData,
    });

    return NextResponse.json({ coach: updatedCoach });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    logger.error('Erreur lors de la mise à jour du profil coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
