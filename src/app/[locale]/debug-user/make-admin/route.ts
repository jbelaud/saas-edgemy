import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL(`/${locale}/auth/signin`, request.url));
    }

    // Mettre à jour le rôle dans la base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
    });

    // Rediriger vers la page debug pour voir le résultat
    return NextResponse.redirect(new URL(`/${locale}/debug-user`, request.url));
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { error: "Failed to make user admin" },
      { status: 500 }
    );
  }
}
