"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Plus, Trash2, Edit2, Package } from "lucide-react";

interface Availability {
  id: string;
  start: Date;
  end: Date;
}

interface Session {
  id: string;
  sessionId: string;
  title: string;
  start: Date;
  end: Date;
  playerName: string;
}

interface MobileAgendaViewProps {
  availabilities: Availability[];
  sessions: Session[];
  onAddAvailability: () => void;
  onDeleteAvailability: (id: string) => void;
  onSelectSession: (session: Session) => void;
}

export default function MobileAgendaView({
  availabilities,
  sessions,
  onAddAvailability,
  onDeleteAvailability,
  onSelectSession,
}: MobileAgendaViewProps) {
  const [activeTab, setActiveTab] = useState<"availabilities" | "sessions">("availabilities");

  // Grouper les disponibilités par jour
  const groupedAvailabilities = availabilities.reduce((acc, avail) => {
    const dateKey = format(avail.start, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(avail);
    return acc;
  }, {} as Record<string, Availability[]>);

  // Grouper les sessions par jour
  const groupedSessions = sessions.reduce((acc, session) => {
    const dateKey = format(session.start, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Trier les dates
  const sortedAvailDates = Object.keys(groupedAvailabilities).sort();
  const sortedSessionDates = Object.keys(groupedSessions).sort();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg border border-white/10">
        <button
          onClick={() => setActiveTab("availabilities")}
          className={`flex-1 px-4 py-3 rounded-md font-semibold text-sm transition-all ${
            activeTab === "availabilities"
              ? "bg-green-500 text-white shadow-lg"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Disponibilités
          </div>
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex-1 px-4 py-3 rounded-md font-semibold text-sm transition-all ${
            activeTab === "sessions"
              ? "bg-purple-500 text-white shadow-lg"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Sessions
          </div>
        </button>
      </div>

      {/* Bouton Ajouter (seulement pour disponibilités) */}
      {activeTab === "availabilities" && (
        <button
          onClick={onAddAvailability}
          className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Ajouter une disponibilité
        </button>
      )}

      {/* Liste des disponibilités */}
      {activeTab === "availabilities" && (
        <div className="space-y-4">
          {sortedAvailDates.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-white/10">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Aucune disponibilité</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez votre première disponibilité</p>
            </div>
          ) : (
            sortedAvailDates.map((dateKey) => {
              const date = new Date(dateKey);
              const dayAvails = groupedAvailabilities[dateKey];

              return (
                <div key={dateKey} className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
                  {/* Header de la date */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/30 px-4 py-3">
                    <p className="font-bold text-white">
                      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>

                  {/* Liste des créneaux */}
                  <div className="divide-y divide-white/5">
                    {dayAvails.map((avail) => (
                      <div
                        key={avail.id}
                        className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {format(avail.start, "HH:mm")} - {format(avail.end, "HH:mm")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {Math.round((avail.end.getTime() - avail.start.getTime()) / (1000 * 60))} min
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteAvailability(avail.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Liste des sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {sortedSessionDates.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-white/10">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Aucune session planifiée</p>
              <p className="text-sm text-gray-500 mt-1">Les sessions de pack apparaîtront ici</p>
            </div>
          ) : (
            sortedSessionDates.map((dateKey) => {
              const date = new Date(dateKey);
              const daySessions = groupedSessions[dateKey];

              return (
                <div key={dateKey} className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
                  {/* Header de la date */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-b border-purple-500/30 px-4 py-3">
                    <p className="font-bold text-white">
                      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>

                  {/* Liste des sessions */}
                  <div className="divide-y divide-white/5">
                    {daySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onSelectSession(session)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{session.playerName}</p>
                            <p className="text-sm text-gray-400">
                              {format(session.start, "HH:mm")} - {format(session.end, "HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Edit2 className="w-5 h-5 text-purple-400" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
