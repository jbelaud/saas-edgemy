'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Trash2, User, Image as ImageIcon } from 'lucide-react';

interface ProfileImageUploadProps {
  currentUrl: string | null;
  type: 'avatar' | 'banner';
  userId: string;
  onUploadSuccess: (url: string) => void;
  onDeleteSuccess: () => void;
}

export function ProfileImageUpload({
  currentUrl,
  type,
  onUploadSuccess,
  onDeleteSuccess,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);

  const isAvatar = type === 'avatar';
  const Icon = isAvatar ? User : ImageIcon;
  const title = isAvatar ? 'Photo de profil' : 'Bannière';
  const description = isAvatar
    ? 'JPG, PNG ou WebP - Max 5MB - Recommandé: 400x400px'
    : 'JPG, PNG ou WebP - Max 5MB - Recommandé: 1200x400px';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. Taille maximale: 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Créer une preview locale
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload vers l'API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const { url } = await response.json();

      // Mettre à jour le profil coach avec la nouvelle URL
      const updateResponse = await fetch('/api/coach/profile/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      // Libérer l'URL object
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(url);
      onUploadSuccess(url);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      setPreviewUrl(currentUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Supprimer l'image du profil (on met juste null en BDD, Supabase garde le fichier)
      const response = await fetch('/api/coach/profile/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setPreviewUrl(null);
      onDeleteSuccess();
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-amber-400" />
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>

      {/* Affichage de l'image actuelle ou placeholder */}
      <div className={`relative ${isAvatar ? 'w-32 h-32' : 'w-full h-48'} ${isAvatar ? 'rounded-full' : 'rounded-lg'} overflow-hidden border-2 ${previewUrl ? 'border-amber-500/50' : 'border-white/20'} bg-white/5`}>
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={title}
            fill
            className="object-cover"
            sizes={isAvatar ? '128px' : '100vw'}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="h-16 w-16 text-gray-600" />
          </div>
        )}

        {/* Loading overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Bouton Upload */}
        <div className="relative">
          <input
            type="file"
            id={`upload-${type}`}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || isDeleting}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || isDeleting}
            onClick={() => document.getElementById(`upload-${type}`)?.click()}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? 'Modifier' : 'Télécharger'}
              </>
            )}
          </Button>
        </div>

        {/* Bouton Supprimer */}
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || isDeleting}
            onClick={handleDelete}
            className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </Button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
