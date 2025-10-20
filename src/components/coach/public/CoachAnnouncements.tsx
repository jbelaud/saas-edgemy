'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Euro, Calendar, Bell, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookingModal } from './BookingModal';

interface Announcement {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  format?: string;
  slug: string;
}

interface CoachAnnouncementsProps {
  announcements: Announcement[];
  coachId: string;
  isInactive?: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  MTT: 'MTT',
  CASH_GAME: 'Cash Game',
  SNG: 'Sit & Go',
  SPIN: 'Spin & Go',
  AUTRE: 'Autre',
};

export function CoachAnnouncements({ announcements, coachId, isInactive = false }: CoachAnnouncementsProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
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
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {announcement.title}
                      </h3>
                      {announcement.format && (
                        <Badge variant="outline">
                          {FORMAT_LABELS[announcement.format] || announcement.format}
                        </Badge>
                      )}
                    </div>
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

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {announcement.price}
                        </span>
                        <Euro className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-500">par session</p>
                    </div>
                    
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
