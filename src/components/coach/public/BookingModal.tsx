'use client';

import { useState, useEffect } from 'react';
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
import { Calendar, Clock, Euro, Loader2, AlertCircle, Package, CheckCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  date: string;
  time: string;
}

export function BookingModal({ isOpen, onClose, announcement, coachId, selectedPackId }: BookingModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [bookingType, setBookingType] = useState<'single' | 'pack'>(selectedPackId ? 'pack' : 'single');
  const [selectedPackForBooking, setSelectedPackForBooking] = useState<string | null>(selectedPackId || null);

  // Charger les créneaux disponibles
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        // Passer la durée de l'annonce pour découper les disponibilités en créneaux
        const response = await fetch(`/api/coach/${coachId}/availability?duration=${announcement.duration}`);
        if (response.ok) {
          const availabilities = await response.json();
          // Transformer les créneaux en format affichable
          const slots: TimeSlot[] = (availabilities || [])
            .map((avail: { id: string; start: string; end: string }) => {
              const start = new Date(avail.start);
              const end = new Date(avail.end);
              
              return {
                id: avail.id,
                start,
                end,
                date: start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
                time: `${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
              };
            })
            .filter((slot: TimeSlot) => slot.start > new Date()) // Seulement les créneaux futurs
            .slice(0, 20); // Limiter à 20 créneaux
          
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error('Erreur chargement créneaux:', error);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coachId]);
  
  // Trouver le pack sélectionné
  const selectedPack = bookingType === 'pack' && selectedPackForBooking
    ? announcement.packs?.find(pack => pack.id === selectedPackForBooking)
    : null;
  
  // Calculer le prix et la durée selon si c'est un pack ou une session
  const displayPrice = selectedPack ? selectedPack.totalPrice / 100 : announcement.price;
  const displayDuration = announcement.duration;
  const isPack = bookingType === 'pack' && !!selectedPack;

  const handleSubmit = async () => {
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }

    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau horaire');
      return;
    }

    setIsLoading(true);

    try {
      // Créer la réservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcementId: announcement.id,
          coachId,
          startDate: selectedSlot.start.toISOString(),
          endDate: selectedSlot.end.toISOString(),
          packageId: bookingType === 'pack' && selectedPackForBooking ? selectedPackForBooking : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la réservation');
      }

      const data = await response.json();
      console.log('Réservation créée:', data);
      
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
        setSelectedSlot(null);
        setMessage('');
        // Rediriger vers les sessions du joueur
        router.push('/player/sessions');
      }, 2000);
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Grouper les créneaux par date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 w-[95vw] md:w-full">
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Réservation confirmée !
              </h3>
              <p className="text-gray-600">
                Votre session a été réservée avec succès.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 md:p-5 pb-3 md:pb-4 border-b">
              <DialogTitle className="text-base md:text-xl font-bold mb-1">
                {announcement.title}
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Sélectionnez un créneau et confirmez votre réservation
              </DialogDescription>
            </div>

            {/* Type de réservation */}
            <div className="px-4 md:px-5 pt-3 md:pt-4 pb-2 space-y-2 md:space-y-2.5">
              {/* Session unique */}
              <button
                onClick={() => {
                  setBookingType('single');
                  setSelectedPackForBooking(null);
                }}
                className={`w-full p-2.5 md:p-2.5 rounded-lg border-2 transition-all text-left ${
                  bookingType === 'single'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs md:text-sm text-gray-900">Session unique</p>
                    <p className="text-[10px] md:text-xs text-gray-600">{announcement.price}€ - {announcement.duration} min</p>
                  </div>
                  <div className={`w-4 h-4 md:w-4 md:h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    bookingType === 'single'
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {bookingType === 'single' && (
                      <div className="w-1.5 h-1.5 md:w-1.5 md:h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </button>

              {/* Packs */}
              {announcement.packs && announcement.packs.length > 0 && (
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-[10px] md:text-xs font-semibold text-gray-700">Packs disponibles</Label>
                  <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2">
                    {announcement.packs.map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => {
                          setBookingType('pack');
                          setSelectedPackForBooking(pack.id);
                        }}
                        className={`flex-shrink-0 p-2 md:p-2 rounded-lg border-2 transition-all min-w-[80px] md:min-w-[85px] ${
                          bookingType === 'pack' && selectedPackForBooking === pack.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-bold text-xs md:text-xs text-gray-900">Pack {pack.hours}h</p>
                          <p className="text-[10px] md:text-[11px] text-gray-600">{(pack.totalPrice / 100).toFixed(0)}€</p>
                          {pack.discountPercent && pack.discountPercent > 0 && (
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-[9px] md:text-[9px] px-1 py-0 mt-0.5 md:mt-0.5">
                              -{pack.discountPercent}%
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {bookingType === 'pack' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-900 leading-tight">
                        <strong>📦</strong> 1ère session maintenant, les suivantes avec le coach.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prix et durée */}
            <div className="px-4 md:px-5 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border-y">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="p-1 md:p-1.5 bg-white rounded-lg shadow-sm">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-600">Durée</p>
                    <p className="font-bold text-xs md:text-sm text-gray-900">{displayDuration} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] md:text-xs text-gray-600">Prix</p>
                  <p className="text-lg md:text-lg font-bold text-orange-600">{displayPrice}€</p>
                </div>
              </div>
              {bookingType === 'pack' && selectedPack && (
                <div className="mt-1.5 md:mt-2">
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] md:text-[10px]">
                    Pack {selectedPack.hours}h - Économisez {selectedPack.discountPercent}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Liste des créneaux */}
            <div className="px-4 md:px-5 py-2">
              <h3 className="font-semibold text-xs md:text-sm text-gray-900 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-orange-600" />
                Créneaux disponibles
              </h3>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center py-3 md:py-4">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-orange-600" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-3 md:py-4 text-gray-500">
                  <AlertCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-[10px] md:text-xs">Aucun créneau disponible</p>
                </div>
              ) : (
                <ScrollArea className="h-[140px] md:h-[150px] pr-2 md:pr-4">
                  <div className="space-y-1.5 md:space-y-2">
                    {Object.entries(slotsByDate).map(([date, slots]) => (
                      <div key={date}>
                        <p className="text-[9px] md:text-[10px] font-semibold text-gray-700 mb-1 uppercase">{date}</p>
                        <div className="grid grid-cols-2 gap-1 md:gap-1.5">
                          {slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-1 md:p-1.5 rounded-lg border-2 transition-all text-center ${
                                selectedSlot?.id === slot.id
                                  ? 'border-orange-500 bg-orange-50 shadow-md'
                                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                              }`}
                            >
                              <p className="font-bold text-[9px] md:text-[10px]">{slot.time}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Créneau sélectionné */}
            {selectedSlot && (
              <div className="px-4 md:px-5 py-1.5 bg-green-50 border-y border-green-200">
                <div className="flex items-center gap-1 md:gap-1.5 text-green-800">
                  <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                  <p className="font-semibold text-[10px] md:text-xs truncate">
                    {selectedSlot.date} à {selectedSlot.time}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-3 md:p-3 flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-xs md:text-sm">
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !selectedSlot}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs md:text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    Réserver
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
