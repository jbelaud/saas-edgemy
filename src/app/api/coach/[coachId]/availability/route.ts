import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les disponibilités publiques d'un coach (accessible sans auth)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const { coachId } = await params;

    // Vérifier que le coach existe
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer les disponibilités futures
    const availabilities = await prisma.availability.findMany({
      where: {
        coachId,
        start: {
          gte: new Date(),
        },
      },
      orderBy: {
        start: 'asc',
      },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
