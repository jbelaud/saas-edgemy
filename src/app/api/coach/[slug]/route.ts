import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const coach = await prisma.coach.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        announcements: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coach });
  } catch (error) {
    console.error('Erreur lors de la récupération du coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
