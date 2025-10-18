'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, User, Image as ImageIcon } from 'lucide-react';
import type { OnboardingData } from '@/types/coach';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export function OnboardingStep3({ data, onNext, onBack }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(data.bannerUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    const setLoading = type === 'avatar' ? setIsUploadingAvatar : setIsUploadingBanner;
    const setUrl = type === 'avatar' ? setAvatarUrl : setBannerUrl;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const { url } = await response.json();
      setUrl(url);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'avatar');
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'banner');
    }
  };

  const handleNext = () => {
    onNext({ avatarUrl, bannerUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Photo et bannière
        </h2>
        <p className="text-gray-600">
          Ajoutez une photo de profil et une bannière pour personnaliser votre page (optionnel)
        </p>
      </div>

      {/* Avatar */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4" />
          Photo de profil
        </Label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploadingAvatar}
            />
            <label htmlFor="avatar">
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingAvatar}
                onClick={() => document.getElementById('avatar')?.click()}
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {avatarUrl ? 'Changer' : 'Télécharger'}
                  </>
                )}
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG ou WebP - Max 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-4 w-4" />
          Bannière
        </Label>
        <div className="space-y-4">
          {bannerUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={bannerUrl}
                alt="Bannière"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div>
            <input
              type="file"
              id="banner"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
              disabled={isUploadingBanner}
            />
            <label htmlFor="banner">
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingBanner}
                onClick={() => document.getElementById('banner')?.click()}
              >
                {isUploadingBanner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {bannerUrl ? 'Changer' : 'Télécharger'}
                  </>
                )}
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG ou WebP - Max 5MB - Recommandé: 1200x400px
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Astuce :</strong> Une photo professionnelle et une bannière attrayante 
          augmentent vos chances d&apos;être choisi par les joueurs.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={isUploadingAvatar || isUploadingBanner}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
