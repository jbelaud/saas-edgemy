import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { coachNoteSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

// GET - Récupérer les notes d'un élève
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer les notes pour cet élève
    const notes = await prisma.coachNote.findMany({
      where: {
        coachId: coach.id,
        playerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    logger.error('Erreur lors de la récupération des notes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour une note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    const body = await request.json();

    // Validation avec Zod
    const validationResult = coachNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // Chercher une note existante
    const existingNote = await prisma.coachNote.findFirst({
      where: {
        coachId: coach.id,
        playerId,
      },
    });

    let note;
    if (existingNote) {
      // Mettre à jour la note existante
      note = await prisma.coachNote.update({
        where: { id: existingNote.id },
        data: { content },
      });
    } else {
      // Créer une nouvelle note
      note = await prisma.coachNote.create({
        data: {
          coachId: coach.id,
          playerId,
          content,
        },
      });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    logger.error('Erreur lors de la création/mise à jour de la note:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
