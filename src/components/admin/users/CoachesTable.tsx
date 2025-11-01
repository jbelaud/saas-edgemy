"use client";

import { useState } from "react";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Search,
  ExternalLink,
  RefreshCw,
  Ban,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CoachesTableProps {
  coaches: Array<{
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    avatarUrl: string | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      discordId: string | null;
      createdAt: Date;
    };
    _count: {
      reservations: number;
    };
  }>;
}

const statusConfig = {
  ACTIVE: {
    label: "Actif",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle2,
  },
  INACTIVE: {
    label: "Inactif",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: XCircle,
  },
  PENDING_REVIEW: {
    label: "En révision",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: AlertCircle,
  },
  SUSPENDED: {
    label: "Suspendu",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: Ban,
  },
};

export function CoachesTable({ coaches }: CoachesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGlassCard>
      {/* Barre de recherche */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un coach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20">
          {filteredCoaches.length} coach{filteredCoaches.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Coach
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Email
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Statut
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Discord
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Sessions
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Inscrit le
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCoaches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  Aucun coach trouvé
                </td>
              </tr>
            ) : (
              filteredCoaches.map((coach) => {
                const StatusIcon =
                  statusConfig[coach.status as keyof typeof statusConfig]?.icon ||
                  AlertCircle;
                return (
                  <tr
                    key={coach.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    {/* Coach */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={coach.avatarUrl || coach.user.image || undefined}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            {coach.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">
                            {coach.firstName} {coach.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{coach.user.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 text-sm text-gray-300">
                      {coach.user.email || "-"}
                    </td>

                    {/* Statut */}
                    <td className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          statusConfig[coach.status as keyof typeof statusConfig]
                            ?.className || statusConfig.INACTIVE.className
                        }
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[coach.status as keyof typeof statusConfig]
                          ?.label || coach.status}
                      </Badge>
                    </td>

                    {/* Discord */}
                    <td className="py-4">
                      {coach.user.discordId ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Connecté
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-500/20 text-gray-400 border-gray-500/30"
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Non connecté
                        </Badge>
                      )}
                    </td>

                    {/* Sessions */}
                    <td className="py-4 text-sm text-white">
                      {coach._count.reservations}
                    </td>

                    {/* Date inscription */}
                    <td className="py-4 text-sm text-gray-400">
                      {format(new Date(coach.user.createdAt), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-900 border-white/10"
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/fr/coach/${coach.id}`}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Voir le profil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Actualiser Discord
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="cursor-pointer text-orange-400 focus:text-orange-300">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspendre
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-300">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
