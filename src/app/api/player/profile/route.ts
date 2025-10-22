import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer ou créer le profil joueur
    let player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Si le profil n'existe pas, le créer automatiquement
    if (!player) {
      const userName = session.user.name || '';
      const nameParts = userName.split(' ');
      const firstName = nameParts[0] || 'Joueur';
      const lastName = nameParts.slice(1).join(' ') || '';

      player = await prisma.player.create({
        data: {
          userId: session.user.id,
          firstName,
          lastName,
          formats: [],
          timezone: 'Europe/Paris',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil joueur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
