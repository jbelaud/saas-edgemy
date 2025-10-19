import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role } = body;

    // Valider le rôle
    const validRoles = ["USER", "PLAYER", "COACH", "ADMIN"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Empêcher les utilisateurs de se donner le rôle ADMIN
    if (role === "ADMIN") {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous attribuer le rôle ADMIN" },
        { status: 403 }
      );
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Créer l'entrée correspondante dans la table coach ou player
    if (role === "COACH") {
      // Vérifier si l'entrée coach existe déjà
      const existingCoach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
      });

      if (!existingCoach) {
        // Créer un profil coach minimal avec statut INACTIVE
        // Le coach pourra compléter son profil via l'onboarding
        const userName = session.user.name || '';
        const nameParts = userName.split(' ');
        const firstName = nameParts[0] || 'Coach';
        const lastName = nameParts.slice(1).join(' ') || 'Edgemy';
        
        // Générer un slug unique
        const baseSlug = `${firstName}-${lastName}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        let slug = baseSlug;
        let counter = 1;
        let slugExists = await prisma.coach.findUnique({ where: { slug } });
        
        while (slugExists) {
          slug = `${baseSlug}-${counter}`;
          slugExists = await prisma.coach.findUnique({ where: { slug } });
          counter++;
        }

        await prisma.coach.create({
          data: {
            userId: session.user.id,
            slug,
            firstName,
            lastName,
            bio: '',
            formats: [],
            languages: ['fr'], // Langue par défaut
            badges: [],
            status: 'INACTIVE',
          },
        });
      }
    } else if (role === "PLAYER") {
      // Vérifier si l'entrée player existe déjà
      const existingPlayer = await prisma.player.findUnique({
        where: { userId: session.user.id },
      });

      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            id: `player_${session.user.id}`,
            userId: session.user.id,
            formats: [],
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du rôle" },
      { status: 500 }
    );
  }
}
