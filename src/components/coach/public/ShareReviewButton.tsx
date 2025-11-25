'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareReviewButtonProps {
  coachSlug: string;
  coachName: string;
  locale: string;
}

export function ShareReviewButton({ coachSlug, coachName, locale }: ShareReviewButtonProps) {
  const [copied, setCopied] = useState(false);

  const reviewUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://edgemy.fr'}/${locale}/coach/${coachSlug}/review`;

  const handleShare = async () => {
    // Essayer le Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Laisser un avis sur ${coachName} | Edgemy`,
          text: `Partagez votre expérience avec ${coachName}, coach poker sur Edgemy`,
          url: reviewUrl,
        });
        return;
      } catch {
        // Fallback vers copie
      }
    }

    // Fallback : copier dans le presse-papier
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Lien copié !</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Partager le lien d&apos;avis</span>
        </>
      )}
    </Button>
  );
}
