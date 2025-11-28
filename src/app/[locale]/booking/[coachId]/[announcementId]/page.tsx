import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingPageClient } from '@/components/booking/BookingPageClient';

interface BookingPageProps {
  params: Promise<{
    locale: string;
    coachId: string;
    announcementId: string;
  }>;
  searchParams: Promise<{
    packId?: string;
  }>;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { coachId, announcementId } = await params;
  const { packId } = await searchParams;

  // Récupérer le coach
  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      timezone: true,
      user: {
        select: {
          image: true,
        },
      },
    },
  });

  if (!coach) {
    notFound();
  }

  // Récupérer l'annonce avec ses packs
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId, coachId },
    include: {
      packs: {
        where: { isActive: true },
        orderBy: { hours: 'asc' },
      },
    },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <BookingPageClient
      coach={coach}
      announcement={announcement}
      initialPackId={packId}
    />
  );
}
