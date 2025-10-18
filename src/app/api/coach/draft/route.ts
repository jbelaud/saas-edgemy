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

    const draft = await prisma.coachDraft.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Erreur lors de la récupération du brouillon:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { currentStep, ...draftData } = body;

    // Upsert du brouillon
    const draft = await prisma.coachDraft.upsert({
      where: { userId: session.user.id },
      update: {
        ...draftData,
        currentStep,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...draftData,
        currentStep,
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du brouillon:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    await prisma.coachDraft.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du brouillon:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
