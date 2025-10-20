'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Euro, Calendar, Bell, Eye, Package, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookingModal } from './BookingModal';

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
}

interface Announcement {
  id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  slug: string;
  packs?: AnnouncementPack[];
  // STRATEGY
  variant?: string;
  format?: string;
  abiRange?: string;
  tags?: string[];
  // REVIEW
  reviewType?: string;
  reviewSupport?: string;
  // TOOL
  toolName?: string;
  toolObjective?: string;
  prerequisites?: string;
  // MENTAL
  mentalFocus?: string;
}

interface CoachAnnouncementsProps {
  announcements: Announcement[];
  coachId: string;
  isInactive?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  STRATEGY: 'Stratégie',
  REVIEW: 'Review',
  TOOL: 'Outil',
  MENTAL: 'Mental',
};

const VARIANT_LABELS: Record<string, string> = {
  MTT: 'MTT',
  CASH_GAME: 'Cash Game',
  SNG: 'Sit & Go',
  SPIN: 'Spin & Go',
  AUTRE: 'Mental',
  MENTAL: 'Mental',
};

const FORMAT_LABELS: Record<string, string> = {
  NLHE: 'NLHE',
  PLO: 'PLO',
  PLO5: 'PLO5',
  MIXED: 'Mixed',
};

export function CoachAnnouncements({ announcements, coachId, isInactive = false }: CoachAnnouncementsProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  // État pour chaque annonce : { announcementId: packId | null }
  const [selectedPacks, setSelectedPacks] = useState<Record<string, string | null>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  const handleBooking = (announcement: Announcement) => {
    if (isInactive) return;
    setSelectedAnnouncement(announcement);
    setIsBookingOpen(true);
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailOpen(true);
  };

  const handleNotifyMe = async (announcementId: string) => {
    if (!notifyEmail) return;
    
    setIsNotifying(true);
    // TODO: Implémenter l'API pour enregistrer l'alerte
    console.log('Notify me when available:', { announcementId, email: notifyEmail });
    
    setTimeout(() => {
      setIsNotifying(false);
      setNotifyEmail('');
      alert('Vous serez notifié(e) quand ce coach sera à nouveau disponible !');
    }, 1000);
  };

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            Ce coach n&apos;a pas encore d&apos;offres disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Offres de coaching</CardTitle>
          <CardDescription>
            Choisissez la formule qui vous convient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {announcement.title}
                    </h3>
                    
                    {/* Badges colorés */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge 
                        className={`font-normal ${
                          announcement.type === 'STRATEGY' ? 'bg-blue-600 hover:bg-blue-700' :
                          announcement.type === 'REVIEW' ? 'bg-green-600 hover:bg-green-700' :
                          announcement.type === 'MENTAL' ? 'bg-pink-600 hover:bg-pink-700' :
                          'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {TYPE_LABELS[announcement.type] || announcement.type}
                      </Badge>
                      
                      {announcement.type === 'STRATEGY' && (
                        <>
                          {announcement.variant && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300">
                              {VARIANT_LABELS[announcement.variant] || announcement.variant}
                            </Badge>
                          )}
                          {announcement.format && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">
                              {FORMAT_LABELS[announcement.format] || announcement.format}
                            </Badge>
                          )}
                          {announcement.abiRange && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300">
                              ABI: {announcement.abiRange}
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {announcement.type === 'REVIEW' && (
                        <>
                          {announcement.reviewType && (
                            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-300">
                              {announcement.reviewType.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {announcement.format && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">
                              {FORMAT_LABELS[announcement.format] || announcement.format}
                            </Badge>
                          )}
                          {announcement.reviewSupport && (
                            <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-300">
                              {announcement.reviewSupport.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {announcement.type === 'TOOL' && (
                        <>
                          {announcement.toolName && (
                            <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-300">
                              {announcement.toolName.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {announcement.toolObjective && (
                            <Badge className="bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 border-fuchsia-300">
                              {announcement.toolObjective.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </>
                      )}
                      
                      {announcement.type === 'MENTAL' && announcement.mentalFocus && (
                        <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300">
                          {announcement.mentalFocus.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Tags pour STRATEGY */}
                    {announcement.type === 'STRATEGY' && announcement.tags && announcement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {announcement.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {announcement.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{announcement.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Session individuelle</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                    {/* Sélection du type de réservation */}
                    {!isInactive && (
                      <div className="w-full space-y-1.5">
                        <p className="text-xs font-medium text-gray-700 mb-1">Choisissez votre formule :</p>
                        
                        {/* Session unitaire */}
                        <button
                          onClick={() => setSelectedPacks({ ...selectedPacks, [announcement.id]: null })}
                          className={`w-full p-2 border-2 rounded-md text-left transition-all ${
                            !selectedPacks[announcement.id]
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                !selectedPacks[announcement.id] ? 'border-primary bg-primary' : 'border-gray-300'
                              }`}>
                                {!selectedPacks[announcement.id] && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium">Session 1h</p>
                                <p className="text-xs text-gray-500">{announcement.duration} min</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-gray-900">{announcement.price}€</p>
                            </div>
                          </div>
                        </button>

                        {/* Packs disponibles */}
                        {announcement.packs && announcement.packs.length > 0 && (
                          <>
                            {announcement.packs.map((pack) => {
                              const discount = pack.discountPercent || 0;
                              const isSelected = selectedPacks[announcement.id] === pack.id;
                              return (
                                <button
                                  key={pack.id}
                                  onClick={() => setSelectedPacks({ ...selectedPacks, [announcement.id]: pack.id })}
                                  className={`w-full p-2 border-2 rounded-md text-left transition-all ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                                      }`}>
                                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Package className="h-3.5 w-3.5 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">Pack {pack.hours}h</p>
                                          {discount > 0 && (
                                            <span className="text-xs text-green-600 font-medium">
                                              -{discount}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-base font-bold text-gray-900">{(pack.totalPrice / 100).toFixed(0)}€</p>
                                      {discount > 0 && (
                                        <p className="text-xs text-gray-500 line-through">
                                          {(announcement.price * pack.hours).toFixed(0)}€
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                    
                    {isInactive ? (
                      <div className="w-full md:w-auto space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Votre email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNotifyMe(announcement.id)}
                            disabled={!notifyEmail || isNotifying}
                            className="whitespace-nowrap"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            {isNotifying ? 'Envoi...' : 'M\'alerter'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                          Soyez notifié quand ce coach sera disponible
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleViewDetails(announcement)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir l'annonce
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => handleBooking(announcement)}
                        >
                          Réserver
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détail de l'annonce */}
      {selectedAnnouncement && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <DialogTitle className="flex-1">{selectedAnnouncement.title}</DialogTitle>
                {selectedAnnouncement.format && (
                  <Badge variant="outline">
                    {FORMAT_LABELS[selectedAnnouncement.format] || selectedAnnouncement.format}
                  </Badge>
                )}
              </div>
              <DialogDescription>Détails de l&apos;offre de coaching</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Prix et durée */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-2xl font-bold">{selectedAnnouncement.price}€</p>
                    <p className="text-sm text-gray-600">par session</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-2xl font-bold">{selectedAnnouncement.duration}</p>
                    <p className="text-sm text-gray-600">minutes</p>
                  </div>
                </div>
              </div>

              {/* Description complète */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedAnnouncement.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleBooking(selectedAnnouncement);
                  }}
                  className="flex-1"
                >
                  Réserver une session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de réservation */}
      {selectedAnnouncement && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          announcement={selectedAnnouncement}
          coachId={coachId}
        />
      )}
    </>
  );
}
