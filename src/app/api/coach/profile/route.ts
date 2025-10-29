import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
