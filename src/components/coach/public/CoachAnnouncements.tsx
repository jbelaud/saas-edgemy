'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Euro, Calendar } from 'lucide-react';
import { BookingModal } from './BookingModal';

interface Announcement {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  slug: string;
}

interface CoachAnnouncementsProps {
  announcements: Announcement[];
  coachId: string;
}

export function CoachAnnouncements({ announcements, coachId }: CoachAnnouncementsProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBooking = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsBookingOpen(true);
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
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
                    <Button
                      size="lg"
                      onClick={() => handleBooking(announcement)}
                      className="w-full md:w-auto"
                    >
                      Réserver
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
