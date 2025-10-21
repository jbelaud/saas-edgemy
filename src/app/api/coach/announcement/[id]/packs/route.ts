import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/coach/announcement/[id]/packs - Récupérer les packs d'une annonce
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: announcementId } = params;

    // Vérifier que l'annonce appartient au coach
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        coach: true,
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    if (announcement.coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les packs
    const packs = await prisma.announcementPack.findMany({
      where: { announcementId },
      orderBy: { hours: 'asc' },
    });

    return NextResponse.json({ packs });
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/coach/announcement/[id]/packs - Créer un pack
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: announcementId } = params;
    const body = await request.json();
    const { hours, totalPrice, discountPercent } = body;

    // Validation
    if (!hours || !totalPrice) {
      return NextResponse.json(
        { error: 'Champs requis manquants: hours, totalPrice' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce appartient au coach
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        coach: true,
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    if (announcement.coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Créer le pack
    const pack = await prisma.announcementPack.create({
      data: {
        announcementId,
        hours: parseInt(hours, 10),
        totalPrice: parseInt(totalPrice, 10),
        discountPercent: discountPercent ? parseInt(discountPercent, 10) : null,
      },
    });

    return NextResponse.json({ pack }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du pack:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/coach/announcement/[id]/packs - Modifier un pack
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { packId, hours, totalPrice, discountPercent, isActive } = body;

    if (!packId) {
      return NextResponse.json({ error: 'packId requis' }, { status: 400 });
    }

    // Vérifier que le pack appartient au coach
    const pack = await prisma.announcementPack.findUnique({
      where: { id: packId },
      include: {
        announcement: {
          include: {
            coach: true,
          },
        },
      },
    });

    if (!pack) {
      return NextResponse.json({ error: 'Pack non trouvé' }, { status: 404 });
    }

    if (pack.announcement.coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Mettre à jour le pack
    const updatedPack = await prisma.announcementPack.update({
      where: { id: packId },
      data: {
        ...(hours && { hours: parseInt(hours, 10) }),
        ...(totalPrice && { totalPrice: parseInt(totalPrice, 10) }),
        ...(discountPercent !== undefined && { 
          discountPercent: discountPercent ? parseInt(discountPercent, 10) : null 
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ pack: updatedPack });
  } catch (error) {
    console.error('Erreur lors de la modification du pack:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/coach/announcement/[id]/packs - Supprimer un pack
export async function DELETE(
  request: NextRequest,
  _context: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const packId = searchParams.get('packId');

    if (!packId) {
      return NextResponse.json({ error: 'packId requis' }, { status: 400 });
    }

    // Vérifier que le pack appartient au coach
    const pack = await prisma.announcementPack.findUnique({
      where: { id: packId },
      include: {
        announcement: {
          include: {
            coach: true,
          },
        },
        reservations: true,
      },
    });

    if (!pack) {
      return NextResponse.json({ error: 'Pack non trouvé' }, { status: 404 });
    }

    if (pack.announcement.coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier qu'il n'y a pas de réservations
    if (pack.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un pack avec des réservations' },
        { status: 400 }
      );
    }

    // Supprimer le pack
    await prisma.announcementPack.delete({
      where: { id: packId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du pack:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
