'use client';

import { useState } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui';
import { GlassCard } from '@/components/ui';

interface ReviewFormProps {
  coachId: string;
  coachName: string;
  locale: string;
}

export function ReviewForm({ coachId, coachName, locale }: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // État du formulaire
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  // Données joueur (création rapide de compte)
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation côté client
      if (rating === 0) {
        throw new Error('Veuillez sélectionner une note');
      }
      if (!playerName.trim()) {
        throw new Error('Veuillez entrer votre nom');
      }
      if (!playerEmail.trim() || !playerEmail.includes('@')) {
        throw new Error('Veuillez entrer un email valide');
      }
      if (!comment.trim() || comment.length < 10) {
        throw new Error('Veuillez écrire un commentaire d\'au moins 10 caractères');
      }

      const response = await fetchWithCsrf('/api/reviews/submit', {
        method: 'POST',
        body: JSON.stringify({
          coachId,
          rating,
          comment: comment.trim(),
          playerName: playerName.trim(),
          playerEmail: playerEmail.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'avis');
      }

      setSuccess(true);

      // Redirection vers la page de remerciement avec email pour pré-remplir le formulaire d'inscription
      setTimeout(() => {
        router.push(`/${locale}/coach/${data.coachSlug}/review/thank-you?playerEmail=${encodeURIComponent(playerEmail.trim().toLowerCase())}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <GlassCard className="p-8 text-center border-emerald-400/30 bg-emerald-500/10">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-emerald-200 mb-3">
          Avis envoyé avec succès !
        </h2>
        <p className="text-slate-300 mb-4">
          Redirection en cours...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 border-white/10 bg-slate-900/60">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection note (étoiles) */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">
            Votre note *
          </label>
          <div className="flex gap-2 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400">
            {rating === 0 && 'Cliquez pour noter'}
            {rating === 1 && 'Très décevant'}
            {rating === 2 && 'Décevant'}
            {rating === 3 && 'Correct'}
            {rating === 4 && 'Très bon'}
            {rating === 5 && 'Excellent !'}
          </p>
        </div>

        {/* Nom du joueur */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Votre nom *
          </label>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Jean Dupont"
            className="bg-slate-800/60 border-slate-600 text-slate-100"
            required
          />
        </div>

        {/* Email du joueur */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Votre email *
          </label>
          <Input
            type="email"
            value={playerEmail}
            onChange={(e) => setPlayerEmail(e.target.value)}
            placeholder="jean@example.com"
            className="bg-slate-800/60 border-slate-600 text-slate-100"
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            Votre email ne sera pas publié publiquement
          </p>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Votre avis *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Partagez votre expérience avec ${coachName}...`}
            rows={5}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none resize-none"
            required
            minLength={10}
          />
          <p className="mt-1 text-xs text-slate-400">
            Minimum 10 caractères • {comment.length}/500
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          En soumettant cet avis, vous acceptez qu&apos;il soit publié publiquement sur la page de {coachName}.
        </p>
      </form>
    </GlassCard>
  );
}
