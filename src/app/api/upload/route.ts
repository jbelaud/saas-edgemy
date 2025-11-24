import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { uploadFileToSupabase } from '@/lib/supabase';

/**
 * API pour l'upload de fichiers vers Supabase Storage
 *
 * Buckets configurés:
 * - coach-media (public) : avatars et bannières des coachs
 * - player-media (public) : avatars des joueurs
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

    // Déterminer le bucket en fonction du rôle de l'utilisateur
    // Par défaut coach-media, mais peut être étendu pour les joueurs
    const bucket = 'coach-media';

    // Upload vers Supabase Storage
    const publicUrl = await uploadFileToSupabase(
      file,
      bucket,
      session.user.id,
      type as 'avatar' | 'banner'
    );

    return NextResponse.json({
      url: publicUrl,
      message: 'Fichier uploadé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
