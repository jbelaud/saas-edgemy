import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// DELETE - Supprimer une disponibilité
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ coachId: string; availabilityId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { coachId, availabilityId } = await params;

    // Vérifier que le coach existe et appartient à l'utilisateur
    const coach = await prisma.coach.findUnique({
      where: { 
        id: coachId,
        userId: session.user.id,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé ou non autorisé' }, { status: 404 });
    }

    // Vérifier que la disponibilité existe et appartient au coach
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability || availability.coachId !== coachId) {
      return NextResponse.json(
        { error: 'Disponibilité non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la disponibilité
    await prisma.availability.delete({
      where: { id: availabilityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
