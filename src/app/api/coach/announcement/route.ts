import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET - Récupérer toutes les annonces du coach
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

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        announcements: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(coach.announcements);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une annonce
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

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le coach a un abonnement actif
    if (coach.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Abonnement inactif. Activez votre abonnement pour créer des annonces.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      type, 
      title, 
      description, 
      priceCents, 
      durationMin, 
      isActive,
      // Champs STRATEGY
      variant,
      format,
      abiRange,
      tags,
      // Champs REVIEW
      reviewType,
      reviewSupport,
      // Champs TOOL
      toolName,
      toolObjective,
      prerequisites,
    } = body;

    console.log('📝 Création annonce - Body reçu:', body);

    // Validation des champs communs
    if (!type || !title || !description || priceCents === undefined || priceCents === null || durationMin === undefined || durationMin === null) {
      console.error('❌ Validation échouée:', { type, title, description, priceCents, durationMin });
      return NextResponse.json(
        { error: 'Champs requis manquants', received: { type, title, description, priceCents, durationMin } },
        { status: 400 }
      );
    }

    // Validation spécifique par type
    if (type === 'STRATEGY' && (!variant || !format || !abiRange)) {
      return NextResponse.json(
        { error: 'Champs STRATEGY manquants: variant, format, abiRange requis' },
        { status: 400 }
      );
    }
    if (type === 'REVIEW' && (!reviewType || !format || !reviewSupport)) {
      return NextResponse.json(
        { error: 'Champs REVIEW manquants: reviewType, format, reviewSupport requis' },
        { status: 400 }
      );
    }
    if (type === 'TOOL' && (!toolName || !toolObjective)) {
      return NextResponse.json(
        { error: 'Champs TOOL manquants: toolName, toolObjective requis' },
        { status: 400 }
      );
    }

    // Générer le slug
    let slug = generateSlug(title);
    let slugExists = await prisma.announcement.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await prisma.announcement.findUnique({ where: { slug } });
      counter++;
    }

    const announcement = await prisma.announcement.create({
      data: {
        coachId: coach.id,
        type,
        title,
        slug,
        description,
        priceCents,
        durationMin,
        isActive: isActive ?? true,
        // Champs STRATEGY
        ...(type === 'STRATEGY' && {
          variant,
          format,
          abiRange,
          tags: tags || [],
        }),
        // Champs REVIEW
        ...(type === 'REVIEW' && {
          reviewType,
          format,
          reviewSupport,
        }),
        // Champs TOOL
        ...(type === 'TOOL' && {
          toolName,
          toolObjective,
          prerequisites: prerequisites || null,
        }),
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une annonce
export async function PUT(request: Request) {
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
    const { id, title, description, priceCents, durationMin, format, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'annonce requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce appartient au coach
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { coach: true },
    });

    if (!announcement || announcement.coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Annonce non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        priceCents,
        durationMin,
        format,
        isActive,
      },
    });

    return NextResponse.json({ announcement: updatedAnnouncement });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'annonce requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce appartient au coach
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { coach: true },
    });

    if (!announcement || announcement.coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Annonce non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
