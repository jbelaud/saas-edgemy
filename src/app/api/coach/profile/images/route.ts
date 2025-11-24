import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * API pour mettre à jour les images du profil coach (avatar et bannière)
 */
export async function PATCH(request: Request) {
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

    // Vérifier que l'utilisateur est bien un coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { avatarUrl, bannerUrl } = body;

    // Valider que au moins un champ est fourni
    if (avatarUrl === undefined && bannerUrl === undefined) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Construire l'objet de mise à jour dynamiquement
    const updateData: { avatarUrl?: string | null; bannerUrl?: string | null } = {};

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    if (bannerUrl !== undefined) {
      updateData.bannerUrl = bannerUrl;
    }

    // Mettre à jour le profil coach
    const updatedCoach = await prisma.coach.update({
      where: { id: coach.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Image mise à jour avec succès',
      coach: {
        avatarUrl: updatedCoach.avatarUrl,
        bannerUrl: updatedCoach.bannerUrl,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
