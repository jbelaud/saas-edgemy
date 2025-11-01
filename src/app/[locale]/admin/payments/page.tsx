import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PaymentsTable } from "@/components/admin/payments/PaymentsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";

export const dynamic = "force-dynamic";

async function getPayments() {
  return await prisma.reservation.findMany({
    where: {
      paymentStatus: { in: ["PAID", "PENDING", "FAILED", "REFUNDED"] },
    },
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Paiements</h1>
          <p className="text-sm text-gray-400">
            Suivre les paiements et transactions Stripe
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        }
      >
        <PaymentStatsWrapper />
      </Suspense>

      {/* Table des paiements */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <PaymentsTableWrapper />
      </Suspense>
    </div>
  );
}

async function PaymentStatsWrapper() {
  const payments = await getPayments();

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.priceCents, 0);

  const pendingAmount = payments
    .filter((p) => p.paymentStatus === "PENDING")
    .reduce((sum, p) => sum + p.priceCents, 0);

  const failedCount = payments.filter((p) => p.paymentStatus === "FAILED").length;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <AdminGlassCard>
        <p className="text-sm text-gray-400">Revenus totaux</p>
        <p className="mt-2 text-3xl font-bold text-white">
          {(totalRevenue / 100).toFixed(2)} €
        </p>
      </AdminGlassCard>
      <AdminGlassCard>
        <p className="text-sm text-gray-400">En attente</p>
        <p className="mt-2 text-3xl font-bold text-yellow-400">
          {(pendingAmount / 100).toFixed(2)} €
        </p>
      </AdminGlassCard>
      <AdminGlassCard>
        <p className="text-sm text-gray-400">Paiements échoués</p>
        <p className="mt-2 text-3xl font-bold text-red-400">{failedCount}</p>
      </AdminGlassCard>
    </div>
  );
}

async function PaymentsTableWrapper() {
  const payments = await getPayments();
  return <PaymentsTable payments={payments} />;
}
