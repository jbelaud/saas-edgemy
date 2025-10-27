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

  // Charger les créneaux disponibles
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await fetch(`/api/coach/${coachId}/availability`);
        if (response.ok) {
          const availabilities = await response.json();
          // Transformer les disponibilités en créneaux de 30min
          const slots: TimeSlot[] = (availabilities || [])
            .flatMap((avail: { start: string; end: string }) => {
              const start = new Date(avail.start);
              const end = new Date(avail.end);
              const slots: TimeSlot[] = [];
              
              let current = new Date(start);
              while (current < end) {
                const slotEnd = new Date(current.getTime() + announcement.duration * 60000);
                if (slotEnd <= end) {
                  slots.push({
                    id: current.toISOString(),
                    start: new Date(current),
                    end: slotEnd,
                    date: current.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
                    time: current.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  });
                }
                current = new Date(current.getTime() + 30 * 60000); // Incrément de 30min
              }
              return slots;
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
  }, [isOpen, coachId, announcement.duration]);
  
  // Trouver le pack sélectionné
  const selectedPack = selectedPackId 
    ? announcement.packs?.find(pack => pack.id === selectedPackId)
    : null;
  
  // Calculer le prix et la durée selon si c'est un pack ou une session
  const displayPrice = selectedPack ? selectedPack.totalPrice / 100 : announcement.price;
  const displayDuration = announcement.duration;
  const isPack = !!selectedPack;

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
      // Mock success pour l'instant (pas de Stripe)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
        setSelectedSlot(null);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
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
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
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
            <div className="p-6 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold mb-1">
                {announcement.title}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Sélectionnez un créneau et confirmez votre réservation
              </DialogDescription>
            </div>

            {/* Tabs: Session unique vs Pack */}
            {announcement.packs && announcement.packs.length > 0 && (
              <div className="px-6 pt-4">
                <Tabs value={bookingType} onValueChange={(v) => setBookingType(v as 'single' | 'pack')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Session unique</TabsTrigger>
                    <TabsTrigger value="pack">Pack</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Prix et durée */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-y">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-bold text-gray-900">{displayDuration} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Prix</p>
                  <p className="text-2xl font-bold text-orange-600">{displayPrice}€</p>
                </div>
              </div>
              {bookingType === 'pack' && selectedPack && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    Pack {selectedPack.hours}h - Économisez {selectedPack.discountPercent}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Liste des créneaux */}
            <div className="px-6 py-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Créneaux disponibles
              </h3>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun créneau disponible pour le moment</p>
                </div>
              ) : (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(slotsByDate).map(([date, slots]) => (
                      <div key={date}>
                        <p className="text-sm font-semibold text-gray-700 mb-2 uppercase">{date}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                selectedSlot?.id === slot.id
                                  ? 'border-orange-500 bg-orange-50 shadow-md'
                                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                              }`}
                            >
                              <p className="font-bold text-sm">{slot.time}</p>
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
              <div className="px-6 py-3 bg-green-50 border-y border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-semibold">
                    {selectedSlot.date} à {selectedSlot.time}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !selectedSlot}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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
