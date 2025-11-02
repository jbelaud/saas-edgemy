import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscordChannelsTable } from "@/components/admin/discord/DiscordChannelsTable";
import { DiscordLogsTable } from "@/components/admin/discord/DiscordLogsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDiscordChannels() {
  return await prisma.coachPlayerChannel.findMany({
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminDiscordPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion Discord</h1>
          <p className="text-sm text-gray-400">
            Gérer les salons et surveiller les erreurs Discord
          </p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger
            value="channels"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Salons
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <DiscordChannelsTableWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="logs">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <DiscordLogsTableWrapper />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function DiscordChannelsTableWrapper() {
  const channels = await getDiscordChannels();
  return <DiscordChannelsTable channels={channels} />;
}

async function DiscordLogsTableWrapper() {
  return <DiscordLogsTable />;
}
