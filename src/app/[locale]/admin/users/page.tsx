import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoachesTable } from "@/components/admin/users/CoachesTable";
import { PlayersTable } from "@/components/admin/users/PlayersTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCoaches() {
  return await prisma.coach.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          discordId: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          reservations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getPlayers() {
  return await prisma.player.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          discordId: true,
          createdAt: true,
          _count: {
            select: {
              reservations: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-sm text-gray-400">
            Gérer les coachs et les joueurs de la plateforme
          </p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="coaches" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger
            value="coaches"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Coachs
          </TabsTrigger>
          <TabsTrigger
            value="players"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white"
          >
            Joueurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coaches">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <CoachesTableWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="players">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <PlayersTableWrapper />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function CoachesTableWrapper() {
  const coaches = await getCoaches();
  return <CoachesTable coaches={coaches} />;
}

async function PlayersTableWrapper() {
  const players = await getPlayers();
  return <PlayersTable players={players} />;
}
