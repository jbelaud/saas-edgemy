"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationDetailsDrawerProps {
  reservation: {
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
  };
  open: boolean;
  onClose: () => void;
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

export function ReservationDetailsDrawer({
  reservation,
  open,
  onClose,
}: ReservationDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-950 border-white/10 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Détails de la réservation</SheetTitle>
          <SheetDescription className="text-gray-400">
            ID: {reservation.id.slice(0, 8)}...
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Session Info */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Informations de session
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-semibold text-white">
                  {reservation.announcement.title}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(reservation.startDate), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(reservation.startDate), "HH:mm")} -{" "}
                    {format(new Date(reservation.endDate), "HH:mm")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Joueur */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Joueur
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={reservation.player.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">
                  {reservation.player.name?.[0]?.toUpperCase() || "J"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  {reservation.player.name || "Joueur"}
                </p>
                <p className="text-sm text-gray-400">{reservation.player.email}</p>
              </div>
            </div>
          </div>

          {/* Coach */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Coach
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={reservation.coach.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                  {reservation.coach.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  {reservation.coach.firstName} {reservation.coach.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Statuts */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Statuts
            </h3>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="mb-1 text-xs text-gray-500">Session</p>
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
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">Paiement</p>
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
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Informations de paiement
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Montant</span>
                <span className="font-semibold text-white">
                  {(reservation.priceCents / 100).toFixed(2)} €
                </span>
              </div>
              {reservation.stripePaymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Stripe ID</span>
                  <span className="font-mono text-xs text-gray-300">
                    {reservation.stripePaymentId.slice(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Discord */}
          {reservation.discordChannelId && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">
                Salon Discord
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Salon créé</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                  onClick={() => {
                    window.open(
                      `https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${reservation.discordChannelId}`,
                      "_blank"
                    );
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir dans Discord
                </Button>
              </div>
            </div>
          )}

          <Separator className="bg-white/10" />

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-gray-400">
              Actions
            </h3>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full justify-start border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme complété
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler la session
              </Button>
              {!reservation.discordChannelId && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Créer le salon Discord
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
