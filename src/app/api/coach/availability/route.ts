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

    // Récupérer toutes les disponibilités
    const availabilities = await prisma.availability.findMany({
      where: { coachId: coach.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ availabilities });
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
    const { type, dayOfWeek, startTime, endTime, specificDate, isBlocked } = body;

    // Validation
    if (type === 'RECURRING' && (dayOfWeek === undefined || !startTime || !endTime)) {
      return NextResponse.json(
        { error: 'Les créneaux récurrents nécessitent dayOfWeek, startTime et endTime' },
        { status: 400 }
      );
    }

    if (type === 'SPECIFIC' && (!specificDate || !startTime || !endTime)) {
      return NextResponse.json(
        { error: 'Les créneaux spécifiques nécessitent specificDate, startTime et endTime' },
        { status: 400 }
      );
    }

    // Créer la disponibilité
    const availability = await prisma.availability.create({
      data: {
        coachId: coach.id,
        type,
        dayOfWeek: type === 'RECURRING' ? dayOfWeek : null,
        startTime,
        endTime,
        specificDate: type === 'SPECIFIC' ? new Date(specificDate) : null,
        isBlocked: isBlocked || false,
      },
    });

    return NextResponse.json({ availability }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier une disponibilité
export async function PATCH(request: NextRequest) {
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
    const { id, startTime, endTime, isBlocked } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de disponibilité requis' },
        { status: 400 }
      );
    }

    // Vérifier que la disponibilité appartient au coach
    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability || availability.coachId !== coach.id) {
      return NextResponse.json(
        { error: 'Disponibilité non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour la disponibilité
    const updatedAvailability = await prisma.availability.update({
      where: { id },
      data: {
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isBlocked !== undefined && { isBlocked }),
      },
    });

    return NextResponse.json({ availability: updatedAvailability });
  } catch (error) {
    console.error('Erreur lors de la modification de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une disponibilité
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const availabilityId = searchParams.get('id');

    if (!availabilityId) {
      return NextResponse.json(
        { error: 'ID de disponibilité requis' },
        { status: 400 }
      );
    }

    // Vérifier que la disponibilité appartient au coach
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability || availability.coachId !== coach.id) {
      return NextResponse.json(
        { error: 'Disponibilité non trouvée' },
        { status: 404 }
      );
    }

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
