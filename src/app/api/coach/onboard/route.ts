import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
    const {
      firstName,
      lastName,
      bio,
      formats,
      stakes,
      roi,
      experience,
      languages,
      twitchUrl,
      youtubeUrl,
      twitterUrl,
      discordUrl,
      avatarUrl,
      bannerUrl,
      stripeAccountId,
      subscriptionId,
    } = body;

    // Validation des champs requis
    if (!firstName || !lastName || !formats || formats.length === 0) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Générer le slug
    let slug = generateSlug(firstName, lastName);
    
    // Vérifier l'unicité du slug
    let slugExists = await prisma.coach.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(firstName, lastName)}-${counter}`;
      slugExists = await prisma.coach.findUnique({ where: { slug } });
      counter++;
    }

    // Créer le profil coach
    const coach = await prisma.coach.create({
      data: {
        userId: session.user.id,
        slug,
        firstName,
        lastName,
        bio,
        formats,
        stakes,
        roi,
        experience,
        languages,
        twitchUrl,
        youtubeUrl,
        twitterUrl,
        discordUrl,
        avatarUrl,
        bannerUrl,
        stripeAccountId,
        subscriptionId,
        status: subscriptionId ? 'PENDING_REVIEW' : 'INACTIVE',
      },
    });

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'COACH' },
    });

    // Supprimer le brouillon
    await prisma.coachDraft.delete({
      where: { userId: session.user.id },
    }).catch(() => {
      // Ignore si le brouillon n'existe pas
    });

    return NextResponse.json({ coach });
  } catch (error) {
    console.error('Erreur lors de la création du profil coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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

    // Vérifier que l'utilisateur est bien coach
    const existingCoach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingCoach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      bio,
      formats,
      stakes,
      roi,
      experience,
      languages,
      twitchUrl,
      youtubeUrl,
      twitterUrl,
      discordUrl,
      avatarUrl,
      bannerUrl,
    } = body;

    // Mettre à jour le profil
    const coach = await prisma.coach.update({
      where: { userId: session.user.id },
      data: {
        firstName,
        lastName,
        bio,
        formats,
        stakes,
        roi,
        experience,
        languages,
        twitchUrl,
        youtubeUrl,
        twitterUrl,
        discordUrl,
        avatarUrl,
        bannerUrl,
      },
    });

    return NextResponse.json({ coach });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil coach:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
