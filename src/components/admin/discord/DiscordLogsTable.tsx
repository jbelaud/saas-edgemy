"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Badge } from "@/components/ui/badge";

interface DiscordLog {
  id: string;
  action: string;
  details?: string;
  severity: string;
  createdAt: Date;
}

interface DiscordLogsTableProps {
  logs: Array<DiscordLog>;
}

export function DiscordLogsTable({ logs }: DiscordLogsTableProps) {
  return (
    <AdminGlassCard>
      <div className="py-12 text-center">
        <p className="text-gray-400">
          Aucun log Discord pour le moment. Cette fonctionnalité sera implémentée
          ultérieurement.
        </p>
      </div>
    </AdminGlassCard>
  );
}
