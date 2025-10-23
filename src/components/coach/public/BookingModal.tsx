'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Euro, Loader2, AlertCircle, Package, CheckCircle } from 'lucide-react';
import { CoachAvailabilityCalendar } from './CoachAvailabilityCalendar';

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    packs?: AnnouncementPack[];
  };
  coachId: string;
  selectedPackId?: string | null;
}

export function BookingModal({ isOpen, onClose, announcement, coachId, selectedPackId }: BookingModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
  };
  
  // Trouver le pack sélectionné
  const selectedPack = selectedPackId 
    ? announcement.packs?.find(pack => pack.id === selectedPackId)
    : null;
  
  // Calculer le prix et la durée selon si c'est un pack ou une session
  const displayPrice = selectedPack ? selectedPack.totalPrice / 100 : announcement.price;
  const displayDuration = announcement.duration;
  const isPack = !!selectedPack;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      // Rediriger vers la page de connexion
      router.push('/sign-in');
      return;
    }

    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau horaire');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcement.id,
          coachId,
          startDate: selectedSlot.start,
          endDate: selectedSlot.end,
          packageId: selectedPackId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          alert('Ce créneau n\'est plus disponible. Veuillez en choisir un autre.');
        } else {
          throw new Error(errorData.error || 'Erreur lors de la réservation');
        }
        return;
      }

      // Succès
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
        setSelectedSlot(null);
        setMessage('');
        // Recharger la page pour voir la réservation
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isPack ? `Réserver un pack de ${selectedPack?.hours}h` : 'Réserver une session'}
          </DialogTitle>
          <DialogDescription>
            {announcement.title}
          </DialogDescription>
        </DialogHeader>

        {bookingSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Réservation confirmée !
              </h3>
              <p className="text-gray-600">
                Votre session a été réservée avec succès. Le coach vous contactera bientôt.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Récapitulatif */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {isPack && (
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Type</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Pack {selectedPack?.hours}h</span>
                  {selectedPack?.discountPercent && selectedPack.discountPercent > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                      -{selectedPack.discountPercent}%
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Durée {isPack ? 'par session' : ''}</span>
              </div>
              <span className="font-semibold">{displayDuration} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Euro className="h-4 w-4" />
                <span className="text-sm">Prix {isPack ? 'total' : ''}</span>
              </div>
              <span className="font-semibold text-lg">{displayPrice}€</span>
            </div>
            {isPack && selectedPack && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Soit {(displayPrice / selectedPack.hours).toFixed(0)}€ par heure
                </p>
              </div>
            )}
          </div>

          {/* Message info pour les packs */}
          {isPack && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>📦 Pack de {selectedPack?.hours}h :</strong> Vous réservez la première session maintenant. 
                Les {(selectedPack?.hours || 1) - 1} autres sessions seront planifiées avec votre coach après le paiement.
              </p>
            </div>
          )}

          {/* Sélection de créneaux disponibles */}
          <div className="space-y-4">
            <Label className="text-base font-semibold mb-3 block">
              Choisissez un créneau disponible
            </Label>
            <CoachAvailabilityCalendar
              coachId={coachId}
              announcementId={announcement.id}
              onSelectSlot={handleSlotSelect}
            />

            {/* Message optionnel */}
            {selectedSlot && (
              <div className="pt-4">
                <Label htmlFor="message">Message pour le coach (optionnel)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez vos objectifs, votre niveau, ou toute information utile..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Informations importantes */}
          {!selectedSlot && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Veuillez sélectionner une date et un créneau horaire parmi les disponibilités du coach.
              </p>
            </div>
          )}

          {selectedSlot && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <strong>✓ Créneau sélectionné :</strong> {new Date(selectedSlot.start).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Important :</strong> Votre réservation sera confirmée immédiatement. {isPack ? 'Les autres sessions du pack seront planifiées avec le coach.' : 'Le paiement sera traité ultérieurement.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !selectedSlot}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Confirmer la réservation
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
