import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * API pour déterminer le dashboard approprié selon les rôles de l'utilisateur
 * Priorité : COACH > PLAYER
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ redirectTo: '/' }, { status: 401 });
    }

    // Récupérer l'utilisateur complet avec son rôle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    // Si l'utilisateur est ADMIN, rediriger vers le dashboard admin
    if (user?.role === 'ADMIN') {
      return NextResponse.json({ redirectTo: '/admin/dashboard' });
    }

    // Vérifier si l'utilisateur a un profil coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    // Si l'utilisateur est coach, rediriger vers le dashboard coach
    if (coach) {
      return NextResponse.json({ redirectTo: '/coach/dashboard' });
    }

    // Sinon, rediriger vers le dashboard player par défaut
    return NextResponse.json({ redirectTo: '/player/dashboard' });
  } catch (error) {
    console.error('Erreur lors de la détermination du dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
