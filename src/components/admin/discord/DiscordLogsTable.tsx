"use client";

import { Card } from "@/components/ui/card";
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
    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10">
      <div className="py-12 text-center">
        <p className="text-gray-400">
          Aucun log Discord pour le moment. Cette fonctionnalité sera implémentée
          ultérieurement.
        </p>
      </div>
    </Card>
  );
}
