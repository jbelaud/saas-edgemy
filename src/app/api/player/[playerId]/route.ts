import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { validateCsrfToken } from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
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

    const { playerId } = await params;

    // Vérifier que l'utilisateur accède à son propre profil
    const player = await prisma.player.findUnique({
      where: { id: playerId },
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

    if (player.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    // Protection CSRF
    const csrfError = await validateCsrfToken(request);
    if (csrfError) return csrfError;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { playerId } = await params;
    const body = await request.json();

    // Vérifier que l'utilisateur modifie son propre profil
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Profil joueur non trouvé" },
        { status: 404 }
      );
    }

    if (player.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le profil
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        abi: body.abi ? parseFloat(body.abi) : undefined,
        formats: body.formats,
        goals: body.goals,
        winnings: body.winnings ? parseFloat(body.winnings) : undefined,
        timezone: body.timezone,
      },
    });

    return NextResponse.json({ player: updatedPlayer });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil joueur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
