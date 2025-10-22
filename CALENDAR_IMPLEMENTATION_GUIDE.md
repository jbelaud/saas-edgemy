# 🗓️ Guide d'Implémentation du Calendrier Intelligent

**Objectif**: Implémenter un système de calendrier sans erreurs avec gestion des disponibilités, réservations et packs.

---

## 📐 Architecture du Système

### Relations entre les entités

```
COACH
  └─► AVAILABILITY (Disponibilités)
        └─► Génère → AVAILABLE_SLOTS (Créneaux disponibles calculés)
              └─► Réservés par → RESERVATION
                    └─► Peut appartenir à → ANNOUNCEMENT_PACK

ANNOUNCEMENT (Annonce)
  ├─► ANNOUNCEMENT_PACK (Pack d'heures)
  │     └─► RESERVATION (Sessions du pack)
  └─► RESERVATION (Sessions unitaires)
```

---

## 🔧 Implémentation de l'API `/available-slots`

### Fichier: `src/app/api/coach/[coachId]/available-slots/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const { coachId } = await params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const announcementId = searchParams.get('announcementId');

    if (!startDate || !endDate || !announcementId) {
      return NextResponse.json(
        { error: 'startDate, endDate et announcementId requis' },
        { status: 400 }
      );
    }

    // 1. Récupérer l'annonce pour connaître la durée
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { durationMin: true, coachId: true },
    });

    if (!announcement || announcement.coachId !== coachId) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    const durationMin = announcement.durationMin;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Récupérer les disponibilités
    const [recurringAvailabilities, specificAvailabilities, exceptions] = await Promise.all([
      // Disponibilités récurrentes
      prisma.availability.findMany({
        where: { coachId, type: 'RECURRING', isBlocked: false },
      }),
      // Disponibilités spécifiques dans la période
      prisma.availability.findMany({
        where: {
          coachId,
          type: 'SPECIFIC',
          isBlocked: false,
          specificDate: { gte: start, lte: end },
        },
      }),
      // Exceptions/blocages dans la période
      prisma.availability.findMany({
        where: {
          coachId,
          type: 'EXCEPTION',
          isBlocked: true,
          specificDate: { gte: start, lte: end },
        },
      }),
    ]);

    // 3. Récupérer les réservations existantes
    const reservations = await prisma.reservation.findMany({
      where: {
        coachId,
        startDate: { gte: start },
        endDate: { lte: end },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { startDate: true, endDate: true },
    });

    // 4. Générer les créneaux disponibles
    const slots = generateAvailableSlots(
      start,
      end,
      durationMin,
      recurringAvailabilities,
      specificAvailabilities,
      exceptions,
      reservations
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Erreur calcul créneaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction de génération des créneaux
function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  durationMin: number,
  recurringAvailabilities: any[],
  specificAvailabilities: any[],
  exceptions: any[],
  reservations: any[]
) {
  const slots: { start: string; end: string }[] = [];
  const currentDate = new Date(startDate);
  const SLOT_INTERVAL_MIN = 30; // Créneaux tous les 30 minutes

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];

    // Vérifier si le jour est bloqué
    const isBlocked = exceptions.some(
      (exc) => exc.specificDate?.toISOString().split('T')[0] === dateString
    );

    if (!isBlocked) {
      // Récupérer les disponibilités pour ce jour
      const dayAvailabilities = [
        ...recurringAvailabilities.filter((a) => a.dayOfWeek === dayOfWeek),
        ...specificAvailabilities.filter(
          (a) => a.specificDate?.toISOString().split('T')[0] === dateString
        ),
      ];

      // Générer les créneaux pour chaque disponibilité
      for (const avail of dayAvailabilities) {
        if (!avail.startTime || !avail.endTime) continue;

        const [startHour, startMin] = avail.startTime.split(':').map(Number);
        const [endHour, endMin] = avail.endTime.split(':').map(Number);

        let slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMin, 0, 0);

        const availEnd = new Date(currentDate);
        availEnd.setHours(endHour, endMin, 0, 0);

        // Générer créneaux tous les SLOT_INTERVAL_MIN minutes
        while (slotStart < availEnd) {
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + durationMin);

          // Vérifier que le créneau ne dépasse pas la disponibilité
          if (slotEnd <= availEnd) {
            // Vérifier que le créneau ne chevauche pas une réservation
            const isReserved = reservations.some((res) => {
              const resStart = new Date(res.startDate);
              const resEnd = new Date(res.endDate);
              return (
                (slotStart >= resStart && slotStart < resEnd) ||
                (slotEnd > resStart && slotEnd <= resEnd) ||
                (slotStart <= resStart && slotEnd >= resEnd)
              );
            });

            if (!isReserved) {
              slots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
              });
            }
          }

          // Avancer de SLOT_INTERVAL_MIN minutes
          slotStart.setMinutes(slotStart.getMinutes() + SLOT_INTERVAL_MIN);
        }
      }
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}
```

---

## 🎨 Composant Calendrier Frontend

### Fichier: `src/components/coach/public/CoachAvailabilityCalendar.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Slot {
  start: string;
  end: string;
}

interface CoachAvailabilityCalendarProps {
  coachId: string;
  announcementId: string;
  onSelectSlot: (slot: Slot) => void;
}

export function CoachAvailabilityCalendar({
  coachId,
  announcementId,
  onSelectSlot,
}: CoachAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      // Récupérer les créneaux pour la semaine sélectionnée
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/coach/${coachId}/available-slots?` +
        `startDate=${startDate.toISOString()}&` +
        `endDate=${endDate.toISOString()}&` +
        `announcementId=${announcementId}`
      );

      if (response.ok) {
        const data = await response.json();
        // Filtrer les créneaux pour la date sélectionnée
        const dateString = date.toISOString().split('T')[0];
        const daySlots = data.slots.filter((slot: Slot) => 
          slot.start.startsWith(dateString)
        );
        setSlots(daySlots);
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  return (
    <div className="space-y-6">
      {/* Calendrier */}
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date()}
          locale={fr}
          className="rounded-md border"
        />
      </Card>

      {/* Créneaux disponibles */}
      <div>
        <h3 className="font-semibold mb-3">
          Créneaux disponibles le {selectedDate && format(selectedDate, 'PPP', { locale: fr })}
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun créneau disponible pour cette date
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {slots.map((slot, index) => {
              const startTime = format(new Date(slot.start), 'HH:mm');
              const endTime = format(new Date(slot.end), 'HH:mm');
              const isSelected = selectedSlot?.start === slot.start;

              return (
                <Button
                  key={index}
                  variant={isSelected ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => handleSelectSlot(slot)}
                >
                  <Clock className="h-4 w-4" />
                  {startTime} - {endTime}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 Modification du BookingModal

### Fichier: `src/components/coach/public/BookingModal.tsx`

**Ajouts nécessaires**:

```typescript
// 1. Ajouter un état pour le type de réservation
const [bookingType, setBookingType] = useState<'unit' | 'pack' | null>(null);
const [selectedPack, setSelectedPack] = useState<AnnouncementPack | null>(null);

// 2. Récupérer les packs de l'annonce
useEffect(() => {
  if (announcement) {
    fetchPacks(announcement.id);
  }
}, [announcement]);

const fetchPacks = async (announcementId: string) => {
  const response = await fetch(`/api/coach/announcement/${announcementId}/packs`);
  if (response.ok) {
    const data = await response.json();
    setPacks(data.packs.filter((p: any) => p.isActive));
  }
};

// 3. Étape de sélection du type
{bookingType === null && (
  <div className="space-y-4">
    <h3 className="font-semibold">Choisissez votre formule</h3>
    
    {/* Réservation unitaire */}
    <Card 
      className="p-4 cursor-pointer hover:border-blue-500"
      onClick={() => setBookingType('unit')}
    >
      <h4 className="font-medium">Session unitaire</h4>
      <p className="text-sm text-gray-600">
        {announcement.priceCents / 100}€ - {announcement.durationMin} minutes
      </p>
    </Card>

    {/* Packs */}
    {packs.map((pack) => (
      <Card 
        key={pack.id}
        className="p-4 cursor-pointer hover:border-blue-500"
        onClick={() => {
          setBookingType('pack');
          setSelectedPack(pack);
        }}
      >
        <h4 className="font-medium">Pack {pack.hours}h</h4>
        <p className="text-sm text-gray-600">
          {pack.totalPrice / 100}€
          {pack.discountPercent && (
            <span className="ml-2 text-green-600">
              (-{pack.discountPercent}%)
            </span>
          )}
        </p>
      </Card>
    ))}
  </div>
)}

// 4. Intégrer le calendrier
{bookingType !== null && (
  <CoachAvailabilityCalendar
    coachId={coach.id}
    announcementId={announcement.id}
    onSelectSlot={handleSelectSlot}
  />
)}

// 5. Adapter le paiement Stripe
const handlePayment = async () => {
  const amount = bookingType === 'unit' 
    ? announcement.priceCents 
    : selectedPack!.totalPrice;
  
  // Créer session Stripe avec metadata
  const metadata = {
    bookingType,
    announcementId: announcement.id,
    coachId: coach.id,
    ...(bookingType === 'pack' && { packId: selectedPack!.id }),
    slotStart: selectedSlot!.start,
    slotEnd: selectedSlot!.end,
  };
  
  // ... reste du code Stripe
};
```

---

## 🎯 Checklist d'Implémentation

### Phase 1: API Available Slots
- [ ] Créer `/api/coach/[coachId]/available-slots/route.ts`
- [ ] Implémenter fonction `generateAvailableSlots`
- [ ] Tester avec disponibilités récurrentes uniquement
- [ ] Tester avec disponibilités spécifiques
- [ ] Tester avec exceptions/blocages
- [ ] Tester avec réservations existantes
- [ ] Tester gestion des fuseaux horaires

### Phase 2: Composant Calendrier
- [ ] Créer `CoachAvailabilityCalendar.tsx`
- [ ] Intégrer Calendar de shadcn/ui
- [ ] Afficher créneaux disponibles par jour
- [ ] Gérer sélection d'un créneau
- [ ] Afficher état de chargement
- [ ] Gérer cas "aucun créneau disponible"

### Phase 3: Modification BookingModal
- [ ] Ajouter choix unitaire vs pack
- [ ] Récupérer packs de l'annonce
- [ ] Intégrer `CoachAvailabilityCalendar`
- [ ] Adapter le flux de paiement Stripe
- [ ] Gérer metadata pour webhook Stripe

### Phase 4: API Réservations
- [ ] Créer `/api/reservations/route.ts` (POST)
- [ ] Gérer création réservation unitaire
- [ ] Gérer création 1ère session pack
- [ ] Valider disponibilité du créneau
- [ ] Vérifier absence de conflit
- [ ] Envoyer notifications

### Phase 5: Tests
- [ ] Tester réservation unitaire complète
- [ ] Tester achat pack + 1ère session
- [ ] Tester gestion des conflits
- [ ] Tester avec différents fuseaux horaires
- [ ] Tester cas limites (disponibilités chevauchantes, etc.)

---

## ⚠️ Points d'Attention

### 1. Gestion des Fuseaux Horaires
- Toujours stocker en UTC en base
- Convertir en local uniquement pour affichage
- Utiliser `date-fns-tz` pour conversions

### 2. Performance
- Limiter la période de calcul des créneaux (max 30 jours)
- Mettre en cache les créneaux côté frontend
- Utiliser des index sur `coachId`, `dayOfWeek`, `specificDate`

### 3. Validation
- Vérifier que le créneau est toujours disponible avant paiement
- Utiliser des transactions Prisma pour éviter les race conditions
- Valider côté backend même si validé côté frontend

### 4. UX
- Afficher un loader pendant le calcul des créneaux
- Désactiver les jours sans créneaux disponibles
- Afficher un message clair si aucun créneau disponible
- Permettre de naviguer facilement entre les semaines

---

**📅 Dernière mise à jour**: 22 octobre 2025  
**🎯 Statut**: Guide prêt pour implémentation
