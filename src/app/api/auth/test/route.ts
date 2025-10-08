import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test simple pour vérifier que Better Auth est configuré
    return NextResponse.json({ 
      status: "Better Auth configuré avec succès",
      timestamp: new Date().toISOString(),
      config: {
        emailAndPassword: true,
        socialProviders: Object.keys(auth.options.socialProviders || {}),
        baseURL: auth.options.baseURL,
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Erreur de configuration Better Auth",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}
