import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/csrf
 * Génère et retourne un token CSRF
 * Le token est aussi stocké dans un cookie
 */
export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get('csrf-token')?.value;

  if (!token) {
    // Générer un nouveau token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

    // Définir le cookie
    cookieStore.set('csrf-token', token, {
      httpOnly: false, // Le client doit pouvoir le lire
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 heures
    });

    console.log('[CSRF] Nouveau token créé:', token.substring(0, 8) + '...');
  }

  return NextResponse.json({ token });
}
