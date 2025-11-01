import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ReservationsTable } from "@/components/admin/sessions/ReservationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReservations() {
  return await prisma.reservation.findMany({
    include: {
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      announcement: {
        select: {
          title: true,
          durationMin: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Réservations</h1>
          <p className="text-sm text-gray-400">
            Gérer toutes les sessions de coaching
          </p>
        </div>
      </div>

      {/* Table des réservations */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <ReservationsTableWrapper />
      </Suspense>
    </div>
  );
}

async function ReservationsTableWrapper() {
  const reservations = await getReservations();
  return <ReservationsTable reservations={reservations} />;
}
