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
import { Calendar, Clock, Euro, Loader2, AlertCircle, Package } from 'lucide-react';

// TODO: Remplacer par de vraies données depuis l'API
const MOCK_AVAILABILITIES = [
  { date: '2025-10-20', slots: ['09:00', '14:00', '16:00'] },
  { date: '2025-10-21', slots: ['10:00', '15:00'] },
  { date: '2025-10-22', slots: ['09:00', '11:00', '14:00', '17:00'] },
  { date: '2025-10-23', slots: ['13:00', '15:00', '18:00'] },
  { date: '2025-10-24', slots: ['09:00', '10:00', '14:00'] },
];

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const selectedAvailability = MOCK_AVAILABILITIES.find((a) => a.date === selectedDate);
  
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

    setIsLoading(true);

    if (!selectedDate || !selectedSlot) {
      alert('Veuillez sélectionner une date et un créneau horaire');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implémenter l'API de réservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcement.id,
          coachId,
          message,
          selectedDate,
          selectedSlot,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réservation');
      }

      // Succès - rediriger vers la page de paiement ou confirmation
      alert('Demande de réservation envoyée ! Le coach vous contactera bientôt.');
      onClose();
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
            {/* Sélection de la date */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                1. Choisissez une date disponible
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {MOCK_AVAILABILITIES.map((availability) => {
                  const date = new Date(availability.date);
                  const isSelected = selectedDate === availability.date;
                  
                  return (
                    <button
                      key={availability.date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(availability.date);
                        setSelectedSlot(null); // Reset slot when changing date
                      }}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {date.toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availability.slots.length} créneaux disponibles
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sélection du créneau horaire */}
            {selectedDate && selectedAvailability && (
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  2. Choisissez un créneau horaire
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedAvailability.slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all
                          ${isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }
                        `}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message optionnel */}
            {selectedSlot && (
              <div>
                <Label htmlFor="message">3. Message pour le coach (optionnel)</Label>
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
                <strong>✓ Créneau sélectionné :</strong> {new Date(selectedDate!).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })} à {selectedSlot}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Important :</strong> Le paiement sera effectué après confirmation du coach.
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
      </DialogContent>
    </Dialog>
  );
}
