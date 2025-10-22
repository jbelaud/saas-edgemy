import { NextRequest, NextResponse } from "next/server";
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

    // Récupérer le profil joueur
    const player = await prisma.player.findUnique({
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

    if (!player) {
      return NextResponse.json(
        { error: "Profil joueur non trouvé" },
        { status: 404 }
      );
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
