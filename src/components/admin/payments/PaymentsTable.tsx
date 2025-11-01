"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PaymentsTableProps {
  payments: Array<{
    id: string;
    priceCents: number;
    paymentStatus: string;
    stripePaymentId: string | null;
    createdAt: Date;
    player: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    coach: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

const paymentColors = {
  PENDING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <AdminGlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Joueur
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Coach
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Montant
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Commission (15%)
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Statut
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Date
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Stripe ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  Aucun paiement trouvé
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const commission = (payment.priceCents * 0.15) / 100;
                return (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    {/* Joueur */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={payment.player.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-xs">
                            {payment.player.name?.[0]?.toUpperCase() || "J"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">
                          {payment.player.name || "Joueur"}
                        </span>
                      </div>
                    </td>

                    {/* Coach */}
                    <td className="py-4 text-sm text-white">
                      {payment.coach.firstName} {payment.coach.lastName}
                    </td>

                    {/* Montant */}
                    <td className="py-4 text-sm font-semibold text-white">
                      {(payment.priceCents / 100).toFixed(2)} €
                    </td>

                    {/* Commission */}
                    <td className="py-4 text-sm font-medium text-purple-400">
                      {commission.toFixed(2)} €
                    </td>

                    {/* Statut */}
                    <td className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          paymentColors[
                            payment.paymentStatus as keyof typeof paymentColors
                          ] || paymentColors.PENDING
                        }
                      >
                        {payment.paymentStatus}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-4 text-sm text-gray-400">
                      {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm", {
                        locale: fr,
                      })}
                    </td>

                    {/* Stripe ID */}
                    <td className="py-4">
                      {payment.stripePaymentId ? (
                        <span className="font-mono text-xs text-gray-400">
                          {payment.stripePaymentId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminGlassCard>
  );
}
