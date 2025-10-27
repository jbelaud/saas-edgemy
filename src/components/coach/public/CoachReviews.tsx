'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CoachReviewsProps {
  coachId: string;
  averageRating: number;
  totalReviews: number;
}

export function CoachReviews({ averageRating, totalReviews }: CoachReviewsProps) {
  const mockReviews = [
    {
      id: '1',
      playerName: 'Thomas M.',
      rating: 5,
      comment: 'Excellent coach ! J\'ai progressé rapidement grâce à ses conseils personnalisés et son approche pédagogique.',
      date: '2025-01-15',
      verified: true
    },
    {
      id: '2',
      playerName: 'Sophie L.',
      rating: 5,
      comment: 'Très professionnel et à l\'écoute. Les sessions sont bien structurées et j\'ai pu corriger mes leaks principaux.',
      date: '2025-01-10',
      verified: true
    },
    {
      id: '3',
      playerName: 'Marc D.',
      rating: 4,
      comment: 'Bon coach avec une solide expertise. Les replays sont très utiles pour revoir les concepts abordés.',
      date: '2025-01-05',
      verified: true
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-3xl font-bold mb-2">Avis des élèves</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : star - 0.5 <= averageRating
                        ? 'fill-yellow-400/50 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">({totalReviews} avis)</span>
            </div>
          </div>
        </div>
        
        {/* Message fictif */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les avis ci-dessous sont fictifs pour la démonstration. Le système d'avis réels sera disponible prochainement.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.playerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{review.playerName}</p>
                      {review.verified && (
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          ✓ Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}