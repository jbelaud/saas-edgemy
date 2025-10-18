import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * API Mock pour l'upload de fichiers
 * 
 * TODO: Implémenter l'upload réel avec Supabase Storage
 * 
 * Configuration requise:
 * 1. Créer un projet Supabase
 * 2. Créer un bucket 'coach-media' (public)
 * 3. Ajouter les variables d'environnement:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    - SUPABASE_SERVICE_ROLE_KEY
 * 4. Installer le SDK: pnpm add @supabase/supabase-js
 * 5. Implémenter l'upload avec supabase.storage.from('coach-media').upload()
 */

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' | 'banner'

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier manquant' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validation de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 5MB.' },
        { status: 400 }
      );
    }

    // TODO: Implémenter l'upload réel avec Supabase
    // const supabase = createClient(...)
    // const { data, error } = await supabase.storage
    //   .from('coach-media')
    //   .upload(`${session.user.id}/${type}-${Date.now()}.${ext}`, file)

    // Pour le MVP, on retourne une URL mock
    const mockUrl = `https://placeholder.co/600x400?text=${type}`;

    return NextResponse.json({
      url: mockUrl,
      message: 'Upload mock - Supabase non configuré',
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
