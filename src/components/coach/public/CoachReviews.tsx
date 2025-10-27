'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  playerName: string;
  playerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface CoachReviewsProps {
  coachId: string;
  averageRating: number;
  totalReviews: number;
}

export function CoachReviews({ averageRating, totalReviews }: CoachReviewsProps) {
  // Mock data - à remplacer par de vraies données depuis l'API
  const reviews: Review[] = [
    {
      id: '1',
      playerName: 'Thomas M.',
      playerAvatar: undefined,
      rating: 5,
      comment: 'Excellent coach ! J\'ai progressé rapidement grâce à ses conseils précis et son analyse détaillée de mes leaks. Je recommande vivement.',
      date: 'Il y a 2 semaines',
      verified: true
    },
    {
      id: '2',
      playerName: 'Sarah L.',
      playerAvatar: undefined,
      rating: 5,
      comment: 'Très pédagogue et patient. Les sessions sont bien structurées et j\'ai enfin compris les concepts GTO que je galérais à appliquer.',
      date: 'Il y a 1 mois',
      verified: true
    },
    {
      id: '3',
      playerName: 'Marc D.',
      playerAvatar: undefined,
      rating: 4,
      comment: 'Bon coach avec une approche méthodique. J\'aurais aimé un peu plus de suivi entre les sessions mais globalement très satisfait.',
      date: 'Il y a 2 mois',
      verified: true
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold mb-2">Avis des élèves</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">({totalReviews} avis)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => {
            const initials = review.playerName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={review.id}
                className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
                
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={review.playerAvatar} alt={review.playerName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{review.playerName}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          ✓ Vérifié
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="outline" size="lg" className="font-semibold">
            Voir tous les avis ({totalReviews})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
