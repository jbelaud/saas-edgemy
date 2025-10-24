import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer toutes les disponibilités du coach
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les disponibilités futures
    const availabilities = await prisma.availability.findMany({
      where: {
        coachId: coach.id,
        start: {
          gte: new Date(), // Seulement les créneaux futurs
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

// POST - Créer une nouvelle disponibilité
export async function POST(request: NextRequest) {
  try {
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
    const { start, end } = body;

    // Validation
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Impossible de créer une disponibilité dans le passé' },
        { status: 400 }
      );
    }

    // Vérifier les chevauchements
    const overlapping = await prisma.availability.findFirst({
      where: {
        coachId: coach.id,
        OR: [
          {
            AND: [
              { start: { lte: startDate } },
              { end: { gt: startDate } },
            ],
          },
          {
            AND: [
              { start: { lt: endDate } },
              { end: { gte: endDate } },
            ],
          },
          {
            AND: [
              { start: { gte: startDate } },
              { end: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Ce créneau chevauche une disponibilité existante' },
        { status: 400 }
      );
    }

    // Créer la disponibilité
    const availability = await prisma.availability.create({
      data: {
        coachId: coach.id,
        start: startDate,
        end: endDate,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
