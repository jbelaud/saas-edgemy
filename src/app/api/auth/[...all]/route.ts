import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

// Wrapper pour logger les erreurs
export async function GET(req: NextRequest) {
  try {
    return await handler.GET(req);
  } catch (error) {
    console.error('❌ Erreur dans GET /api/auth:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔐 POST /api/auth - URL:', req.url);
    const result = await handler.POST(req);
    console.log('✅ POST /api/auth - Status:', result.status);
    return result;
  } catch (error) {
    console.error('❌ Erreur dans POST /api/auth:', error);
    throw error;
  }
}
