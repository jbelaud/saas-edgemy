'use client';

import { useState } from 'react';
import { Star, Check, X, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  source: 'RESERVATION' | 'EXTERNAL';
  createdAt: Date;
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    avatarUrl: string | null;
  };
  player: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  reservation?: {
    id: string;
    startDate: Date;
  } | null;
}

interface ReviewsTableProps {
  reviews: Review[];
}

export function ReviewsTable({ reviews: initialReviews }: ReviewsTableProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (reviewId: string) => {
    try {
      setProcessingId(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isPublic: true } : r))
        );
        router.refresh();
      } else {
        alert(data.error || "Erreur lors de l'approbation");
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert("Erreur lors de l'approbation de l'avis");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      setProcessingId(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert("Erreur lors de la suppression de l'avis");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    try {
      setProcessingId(reviewId);
      const response = await fetch(`/api/admin/reviews/${reviewId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isPublic: !currentStatus } : r))
        );
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Erreur lors de la modification de la visibilité');
    } finally {
      setProcessingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
        <p className="text-gray-400">Aucun avis à afficher</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
            !review.isPublic
              ? 'border-yellow-500/30 bg-yellow-500/10'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="p-6">
            <div className="flex gap-4">
              {/* Avatar coach */}
              <div className="flex-shrink-0">
                {review.coach.avatarUrl ? (
                  <img
                    src={review.coach.avatarUrl}
                    alt={`${review.coach.firstName} ${review.coach.lastName}`}
                    className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                    {review.coach.firstName[0]}
                    {review.coach.lastName[0]}
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="min-w-0 flex-1">
                {/* Header avec coach et joueur */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {review.coach.firstName} {review.coach.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Par {review.player.name || review.player.email}
                    </p>
                  </div>

                  {/* Badges de statut */}
                  <div className="flex gap-2">
                    {!review.isPublic && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-300">
                        <Clock className="h-3 w-3" />
                        En attente
                      </span>
                    )}
                    {review.isPublic && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        Publié
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        review.source === 'EXTERNAL'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {review.source === 'EXTERNAL' ? 'Externe' : 'Post-session'}
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-400">({review.rating}/5)</span>
                </div>

                {/* Commentaire */}
                {review.comment && (
                  <p className="mb-4 leading-relaxed text-gray-300">{review.comment}</p>
                )}

                {/* Métadonnées */}
                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Créé le{' '}
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {review.source === 'RESERVATION' && review.reservation && (
                    <span>
                      Session du{' '}
                      {new Date(review.reservation.startDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {!review.isPublic ? (
                    <>
                      <Button
                        onClick={() => handleApprove(review.id)}
                        disabled={processingId === review.id}
                        size="sm"
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Check className="h-4 w-4" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleReject(review.id)}
                        disabled={processingId === review.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-red-500/50 text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleToggleVisibility(review.id, review.isPublic)}
                        disabled={processingId === review.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                      >
                        <Eye className="h-4 w-4" />
                        Masquer
                      </Button>
                      <Button
                        onClick={() => handleReject(review.id)}
                        disabled={processingId === review.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-red-500/50 text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </>
                  )}

                  <a
                    href={`/fr/coach/${review.coach.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-white/20 text-gray-300 hover:bg-white/5"
                    >
                      <Eye className="h-4 w-4" />
                      Voir le profil
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
