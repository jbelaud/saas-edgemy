import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { LogsTable } from "@/components/admin/logs/LogsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

async function getLogs() {
  return await prisma.adminLog.findMany({
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function AdminLogsPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Logs Système</h1>
          <p className="text-sm text-gray-400">
            Surveiller les actions et erreurs du système
          </p>
        </div>
      </div>

      {/* Table des logs */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <LogsTableWrapper />
      </Suspense>
    </div>
  );
}

async function LogsTableWrapper() {
  const logs = await getLogs();
  return <LogsTable logs={logs} />;
}
