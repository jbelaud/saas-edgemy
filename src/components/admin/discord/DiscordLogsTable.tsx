"use client";

import { Card } from "@/components/ui/card";

export function DiscordLogsTable() {
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
