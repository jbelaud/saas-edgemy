import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase pour le stockage de fichiers
let supabaseInstance: SupabaseClient | null = null;

/**
 * Client Supabase Admin avec Service Role Key
 *
 * Utilise la service role key pour bypasser les politiques RLS.
 * La sécurité est assurée côté serveur dans les API routes via Better Auth.
 *
 * ⚠️ À utiliser UNIQUEMENT côté serveur (API routes, server actions)
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables (URL or SERVICE_ROLE_KEY)');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  },
});

/**
 * Upload un fichier vers Supabase Storage
 *
 * Sécurité : Utilise la service role key pour bypasser RLS.
 * La validation de sécurité est faite dans l'API route via Better Auth.
 * Seul l'utilisateur authentifié peut uploader dans son propre dossier (userId).
 *
 * @param file - Le fichier à uploader
 * @param bucket - Le bucket de destination ('coach-media' ou 'player-media')
 * @param userId - ID de l'utilisateur (vérifié dans l'API route)
 * @param type - Type de fichier ('avatar' ou 'banner')
 * @returns URL publique du fichier uploadé
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: 'coach-media' | 'player-media',
  userId: string,
  type: 'avatar' | 'banner'
): Promise<string> {
  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

  // Upload vers Supabase Storage avec service role (bypass RLS)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true, // Remplace si existe déjà
    });

  if (error) {
    console.error('Erreur upload Supabase:', error);
    throw new Error(`Erreur d'upload: ${error.message}`);
  }

  // Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Supprime un fichier de Supabase Storage
 * @param bucket - Le bucket source
 * @param filePath - Chemin du fichier à supprimer
 */
export async function deleteFileFromSupabase(
  bucket: 'coach-media' | 'player-media',
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Erreur suppression Supabase:', error);
    throw new Error(`Erreur de suppression: ${error.message}`);
  }
}
