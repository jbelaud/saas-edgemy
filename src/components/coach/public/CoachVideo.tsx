'use client';

import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface CoachVideoProps {
  presentationVideoUrl: string | null;
  coachName: string;
}

export function CoachVideo({ presentationVideoUrl, coachName }: CoachVideoProps) {
  if (!presentationVideoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(presentationVideoUrl);
  if (!embedUrl) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vidéo de présentation
        </h2>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={embedUrl}
            title={`Vidéo de présentation de ${coachName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
