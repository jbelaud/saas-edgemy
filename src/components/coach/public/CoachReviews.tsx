import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  source: 'RESERVATION' | 'EXTERNAL';
  createdAt: Date;
  player: {
    name: string | null;
    email: string | null;
  };
}

interface CoachReviewsProps {
  coachId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export function CoachReviews({ averageRating, totalReviews, reviews }: CoachReviewsProps) {
  // Ne rien afficher s'il n'y a aucun avis
  if (totalReviews === 0) {
    return null;
  }

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
              <span className="text-xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600">({totalReviews} {totalReviews === 1 ? 'avis' : 'avis'})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(review.player.name || review.player.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">
                        {review.player.name || review.player.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      {review.source === 'RESERVATION' && (
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          ✓ Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
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
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}