"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DiscordChannelsTableProps {
  channels: Array<{
    id: string;
    discordChannelId: string;
    discordVoiceId: string | null;
    createdAt: Date;
    lastUsedAt: Date;
    coach: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    player: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
}

export function DiscordChannelsTable({ channels }: DiscordChannelsTableProps) {
  return (
    <AdminGlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Salon
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Coach
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Joueur
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Créé le
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Dernière utilisation
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {channels.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  Aucun salon Discord trouvé
                </td>
              </tr>
            ) : (
              channels.map((channel) => (
                <tr key={channel.id} className="hover:bg-white/5 transition-colors">
                  {/* Salon */}
                  <td className="py-4">
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        💬 Texte
                      </Badge>
                      {channel.discordVoiceId && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          🎙️ Vocal
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Coach */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={channel.coach.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs">
                          {channel.coach.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">
                        {channel.coach.firstName} {channel.coach.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Joueur */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={channel.player.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-xs">
                          {channel.player.name?.[0]?.toUpperCase() || "J"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">
                        {channel.player.name || "Joueur"}
                      </span>
                    </div>
                  </td>

                  {/* Créé le */}
                  <td className="py-4 text-sm text-gray-400">
                    {format(new Date(channel.createdAt), "dd MMM yyyy", { locale: fr })}
                  </td>

                  {/* Dernière utilisation */}
                  <td className="py-4 text-sm text-gray-400">
                    {format(new Date(channel.lastUsedAt), "dd MMM yyyy", { locale: fr })}
                  </td>

                  {/* Actions */}
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        onClick={() => {
                          window.open(
                            `https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${channel.discordChannelId}`,
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminGlassCard>
  );
}
