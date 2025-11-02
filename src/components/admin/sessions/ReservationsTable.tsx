"use client";

import { useState, useMemo } from "react";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReservationDetailsDrawer } from "./ReservationDetailsDrawer";

interface ReservationsTableProps {
  reservations: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
    paymentStatus: string;
    priceCents: number;
    discordChannelId: string | null;
    stripePaymentId: string | null;
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
      avatarUrl: string | null;
    };
    announcement: {
      title: string;
      durationMin: number;
    };
  }>;
}

const statusColors = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const paymentColors = {
  PENDING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<string | null>(
    null
  );

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      // Filtre de recherche
      const matchesSearch =
        reservation.player.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.coach.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.coach.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reservation.announcement.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtre de statut
      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      // Filtre de paiement
      const matchesPayment =
        paymentFilter === "all" || reservation.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [reservations, searchTerm, statusFilter, paymentFilter]);

  const selectedReservationData = reservations.find(
    (r) => r.id === selectedReservation
  );

  return (
    <>
      <AdminGlassCard>
        {/* Filtres */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par joueur, coach ou session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filtre Statut */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmé</SelectItem>
              <SelectItem value="COMPLETED">Complété</SelectItem>
              <SelectItem value="CANCELLED">Annulé</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre Paiement */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all">Tous les paiements</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="PAID">Payé</SelectItem>
              <SelectItem value="FAILED">Échoué</SelectItem>
              <SelectItem value="REFUNDED">Remboursé</SelectItem>
            </SelectContent>
          </Select>

          {/* Compteur */}
          <Badge
            variant="outline"
            className="bg-white/5 text-gray-300 border-white/20"
          >
            {filteredReservations.length} résultat
            {filteredReservations.length > 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Table */}
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
                  Session
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Date
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Statut
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Paiement
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Montant
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="group cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSelectedReservation(reservation.id)}
                  >
                    {/* Joueur */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={reservation.player.image || undefined}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-xs">
                            {reservation.player.name?.[0]?.toUpperCase() || "J"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">
                          {reservation.player.name || "Joueur"}
                        </span>
                      </div>
                    </td>

                    {/* Coach */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={reservation.coach.avatarUrl || undefined}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs">
                            {reservation.coach.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">
                          {reservation.coach.firstName}{" "}
                          {reservation.coach.lastName}
                        </span>
                      </div>
                    </td>

                    {/* Session */}
                    <td className="py-4 text-sm text-gray-300 max-w-[200px] truncate">
                      {reservation.announcement.title}
                    </td>

                    {/* Date */}
                    <td className="py-4 text-sm text-gray-300">
                      {format(
                        new Date(reservation.startDate),
                        "dd MMM yyyy HH:mm",
                        { locale: fr }
                      )}
                    </td>

                    {/* Statut */}
                    <td className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          statusColors[
                            reservation.status as keyof typeof statusColors
                          ] || statusColors.PENDING
                        }
                      >
                        {reservation.status}
                      </Badge>
                    </td>

                    {/* Paiement */}
                    <td className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          paymentColors[
                            reservation.paymentStatus as keyof typeof paymentColors
                          ] || paymentColors.PENDING
                        }
                      >
                        {reservation.paymentStatus}
                      </Badge>
                    </td>

                    {/* Montant */}
                    <td className="py-4 text-sm font-medium text-white">
                      {(reservation.priceCents / 100).toFixed(2)} €
                    </td>

                    {/* Actions */}
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {reservation.discordChannelId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${reservation.discordChannelId}`,
                                "_blank"
                              );
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>

      {/* Drawer de détails */}
      {selectedReservationData && (
        <ReservationDetailsDrawer
          reservation={selectedReservationData}
          open={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  );
}
