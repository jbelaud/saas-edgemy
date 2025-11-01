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

interface PlayersTableProps {
  players: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    abi: number | null;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      discordId: string | null;
      createdAt: Date;
      _count: {
        reservations: number;
      };
    };
  }>;
}

export function PlayersTable({ players }: PlayersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = players.filter(
    (player) =>
      player.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGlassCard>
      {/* Barre de recherche */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20">
          {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? "s" : ""}
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
                Email
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                ABI
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
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  Aucun joueur trouvé
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => {
                const displayName =
                  player.firstName && player.lastName
                    ? `${player.firstName} ${player.lastName}`
                    : player.user.name || "Joueur";

                return (
                  <tr
                    key={player.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    {/* Joueur */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={player.user.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">
                            {displayName[0]?.toUpperCase() || "J"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{displayName}</p>
                          {player.user.name && (
                            <p className="text-xs text-gray-400">{player.user.name}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 text-sm text-gray-300">
                      {player.user.email || "-"}
                    </td>

                    {/* ABI */}
                    <td className="py-4">
                      {player.abi !== null ? (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        >
                          {player.abi.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>

                    {/* Discord */}
                    <td className="py-4">
                      {player.user.discordId ? (
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
                      {player.user._count.reservations}
                    </td>

                    {/* Date inscription */}
                    <td className="py-4 text-sm text-gray-400">
                      {format(new Date(player.user.createdAt), "dd MMM yyyy", {
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
                              href={`/fr/player/${player.id}`}
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
