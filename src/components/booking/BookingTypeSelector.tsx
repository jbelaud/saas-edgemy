'use client';

import { Package, Zap, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
}

interface Announcement {
  priceCents: number;
  packs: AnnouncementPack[];
}

interface BookingTypeSelectorProps {
  announcement: Announcement;
  bookingType: 'single' | 'pack';
  selectedPackId: string | null;
  onBookingTypeChange: (type: 'single' | 'pack') => void;
  onPackSelect: (packId: string | null) => void;
}

export function BookingTypeSelector({
  announcement,
  bookingType,
  selectedPackId,
  onBookingTypeChange,
  onPackSelect,
}: BookingTypeSelectorProps) {
  const hasPacks = announcement.packs && announcement.packs.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de réservation</h3>

      <div className="space-y-3">
        {/* Single Session */}
        <button
          onClick={() => {
            onBookingTypeChange('single');
            onPackSelect(null);
          }}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            bookingType === 'single'
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${bookingType === 'single' ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Zap className={`h-5 w-5 ${bookingType === 'single' ? 'text-amber-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Session unique</div>
              <div className="text-sm text-gray-600 mt-1">
                Réservez une session ponctuelle
              </div>
              <div className="text-lg font-bold text-amber-600 mt-2">
                {(announcement.priceCents / 100).toFixed(2)}€
              </div>
            </div>
          </div>
        </button>

        {/* Pack Sessions */}
        {hasPacks && (
          <>
            <button
              onClick={() => {
                onBookingTypeChange('pack');
                if (!selectedPackId && announcement.packs.length > 0) {
                  onPackSelect(announcement.packs[0].id);
                }
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                bookingType === 'pack'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${bookingType === 'pack' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <Package className={`h-5 w-5 ${bookingType === 'pack' ? 'text-amber-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Pack de sessions</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Percent className="h-3 w-3 mr-1" />
                      Économies
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Achetez plusieurs sessions et économisez
                  </div>
                </div>
              </div>
            </button>

            {/* Pack Options */}
            {bookingType === 'pack' && (
              <div className="ml-4 pl-4 border-l-2 border-amber-200 space-y-2">
                {announcement.packs.map((pack) => {
                  const pricePerSession = pack.totalPrice / pack.hours;
                  const savings = ((announcement.priceCents / 100 - pricePerSession) / (announcement.priceCents / 100)) * 100;

                  return (
                    <button
                      key={pack.id}
                      onClick={() => onPackSelect(pack.id)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        selectedPackId === pack.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            Pack {pack.hours}h
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {pricePerSession.toFixed(2)}€ / session
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {(pack.totalPrice / 100).toFixed(2)}€
                          </div>
                          {pack.discountPercent && (
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 text-xs">
                              -{pack.discountPercent}%
                            </Badge>
                          )}
                          {!pack.discountPercent && savings > 0 && (
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 text-xs">
                              -{savings.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
