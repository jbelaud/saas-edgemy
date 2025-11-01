"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RecentReservationsProps {
  reservations: Array<{
    id: string;
    startDate: Date;
    status: string;
    paymentStatus: string;
    discordChannelId: string | null;
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

export function RecentReservations({ reservations }: RecentReservationsProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <AdminGlassCard
      title="Réservations Récentes"
      description="Les 10 dernières réservations effectuées"
      icon={<Clock className="h-6 w-6" />}
    >
      <div className="mt-4 space-y-4">
        {reservations.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Aucune réservation récente
          </p>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
            >
              {/* Joueur */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reservation.player.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">
                    {reservation.player.name?.[0]?.toUpperCase() || "J"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-[120px]">
                  <p className="text-sm font-medium text-white">
                    {reservation.player.name || "Joueur"}
                  </p>
                  <p className="text-xs text-gray-400">Joueur</p>
                </div>
              </div>

              {/* Flèche */}
              <div className="text-gray-500">→</div>

              {/* Coach */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reservation.coach.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                    {reservation.coach.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-[120px]">
                  <p className="text-sm font-medium text-white">
                    {reservation.coach.firstName} {reservation.coach.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Coach</p>
                </div>
              </div>

              {/* Info session */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-white">
                  {reservation.announcement.title}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(reservation.startDate), "dd MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>

              {/* Badges Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    statusColors[reservation.status as keyof typeof statusColors] ||
                    statusColors.PENDING
                  }
                >
                  {reservation.status}
                </Badge>
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

              {/* Lien Discord */}
              {reservation.discordChannelId && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  asChild
                >
                  <a
                    href={`https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${reservation.discordChannelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bouton voir tout */}
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          asChild
        >
          <Link href={`/${locale}/admin/sessions`}>Voir toutes les réservations →</Link>
        </Button>
      </div>
    </AdminGlassCard>
  );
}
