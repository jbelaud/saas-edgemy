"use client";

import { useState } from "react";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LogsTableProps {
  logs: Array<{
    id: string;
    action: string;
    details: string | null;
    severity: string;
    source: string | null;
    createdAt: Date;
    admin: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  }>;
}

const severityColors = {
  INFO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function LogsTable({ logs }: LogsTableProps) {
  return (
    <AdminGlassCard>
      {/* Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20">
          {logs.length} log{logs.length > 1 ? "s" : ""}
        </Badge>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer tout
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Date/Heure
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Source
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Action
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Détails
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Sévérité
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  Aucun log disponible
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  {/* Date/Heure */}
                  <td className="py-4 text-sm text-gray-300">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", {
                      locale: fr,
                    })}
                  </td>

                  {/* Source */}
                  <td className="py-4">
                    <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/20">
                      {log.source || "System"}
                    </Badge>
                  </td>

                  {/* Action */}
                  <td className="py-4 text-sm font-medium text-white">
                    {log.action}
                  </td>

                  {/* Détails */}
                  <td className="py-4 text-sm text-gray-400 max-w-md truncate">
                    {log.details || "-"}
                  </td>

                  {/* Sévérité */}
                  <td className="py-4">
                    <Badge
                      variant="outline"
                      className={
                        severityColors[log.severity as keyof typeof severityColors] ||
                        severityColors.INFO
                      }
                    >
                      {log.severity}
                    </Badge>
                  </td>

                  {/* Admin */}
                  <td className="py-4 text-sm text-gray-300">
                    {log.admin?.name || log.admin?.email || "Système"}
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
