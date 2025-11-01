"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CommissionsTableProps {
  data: {
    paidReservations: Array<{
      id: string;
      priceCents: number;
      createdAt: Date;
      pack: {
        hours: number;
      } | null;
      player: {
        name: string | null;
        email: string | null;
      };
      coach: {
        firstName: string;
        lastName: string;
      };
    }>;
    coachingPackages: Array<{
      id: string;
      priceCents: number;
      totalHours: number;
      createdAt: Date;
      player: {
        name: string | null;
        email: string | null;
      };
      coach: {
        firstName: string;
        lastName: string;
      };
    }>;
  };
}

export function CommissionsTable({ data }: CommissionsTableProps) {
  // Calculer les commissions pour chaque réservation
  const sessionsWithCommissions = data.paidReservations
    .filter((r) => !r.pack)
    .map((reservation) => {
      const commission = (reservation.priceCents * 0.05) / 100; // 5%
      return {
        ...reservation,
        commission,
        type: "Session unique",
      };
    });

  const packsWithCommissions = [
    ...data.paidReservations
      .filter((r) => r.pack)
      .map((reservation) => {
        const commission = (300 + reservation.priceCents * 0.02) / 100; // 3€ + 2%
        return {
          id: reservation.id,
          priceCents: reservation.priceCents,
          createdAt: reservation.createdAt,
          player: reservation.player,
          coach: reservation.coach,
          commission,
          type: "Pack (réservation)",
          hours: reservation.pack?.hours || 0,
        };
      }),
    ...data.coachingPackages.map((pack) => {
      const commission = (300 + pack.priceCents * 0.02) / 100; // 3€ + 2%
      return {
        id: pack.id,
        priceCents: pack.priceCents,
        createdAt: pack.createdAt,
        player: pack.player,
        coach: pack.coach,
        commission,
        type: "Pack de coaching",
        hours: pack.totalHours,
      };
    }),
  ];

  return (
    <AdminGlassCard title="Détail des Commissions" description="Phase 1 - Stripe non intégré">
      <Tabs defaultValue="sessions" className="mt-4">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger
            value="sessions"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-white"
          >
            Sessions (5%)
          </TabsTrigger>
          <TabsTrigger
            value="packs"
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-white"
          >
            Packs (3€ + 2%)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Date
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Coach
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Joueur
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Montant
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Commission (5%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sessionsWithCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                      Aucune session unique payée
                    </td>
                  </tr>
                ) : (
                  sessionsWithCommissions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-sm text-gray-300">
                        {format(new Date(session.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-4 text-sm text-white">
                        {session.coach.firstName} {session.coach.lastName}
                      </td>
                      <td className="py-4 text-sm text-gray-300">
                        {session.player.name || session.player.email || "Joueur"}
                      </td>
                      <td className="py-4 text-sm font-medium text-white">
                        {(session.priceCents / 100).toFixed(2)} €
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-300 border-green-500/30"
                        >
                          {session.commission.toFixed(2)} €
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="packs" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Date
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Coach
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Joueur
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Type
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Montant
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                    Commission (3€ + 2%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {packsWithCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                      Aucun pack payé
                    </td>
                  </tr>
                ) : (
                  packsWithCommissions.map((pack) => (
                    <tr key={pack.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-sm text-gray-300">
                        {format(new Date(pack.createdAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-4 text-sm text-white">
                        {pack.coach.firstName} {pack.coach.lastName}
                      </td>
                      <td className="py-4 text-sm text-gray-300">
                        {pack.player.name || pack.player.email || "Joueur"}
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        >
                          {pack.type}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm font-medium text-white">
                        {(pack.priceCents / 100).toFixed(2)} €
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className="bg-orange-500/20 text-orange-300 border-orange-500/30"
                        >
                          {pack.commission.toFixed(2)} €
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Légende des commissions */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Règles de Commissions Phase 1</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 shrink-0">
              5%
            </Badge>
            <p className="text-gray-400">
              <span className="font-medium text-white">Sessions uniques :</span> Commission de 5% sur le montant total
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30 shrink-0">
              3€ + 2%
            </Badge>
            <p className="text-gray-400">
              <span className="font-medium text-white">Packs horaires :</span> Commission fixe de 3€ + 2% sur le montant total
            </p>
          </div>
          <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
            <p className="text-xs text-yellow-300">
              ⚠️ <span className="font-semibold">Note :</span> Stripe n&apos;est pas encore intégré. Ces chiffres sont basés sur les données
              de réservations avec statut &quot;PAID&quot; dans la base de données.
            </p>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
}
