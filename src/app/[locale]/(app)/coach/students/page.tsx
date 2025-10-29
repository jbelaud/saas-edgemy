'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Loader2, StickyNote, Save, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  notes: Note[];
  totalNotes: number;
  sessions: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    title: string;
  }[];
}

export default function CoachStudentsPage() {
  const { data: session, isPending } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchStudents();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/coach/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedStudent || !newNote.trim()) return;

    setIsSavingNote(true);
    try {
      const response = await fetch('/api/coach/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedStudent.id,
          content: newNote,
        }),
      });

      if (response.ok) {
        setNewNote('');
        fetchStudents();
        // Mettre à jour l'élève sélectionné
        const updatedStudent = students.find(s => s.id === selectedStudent.id);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      } else {
        alert('Erreur lors de l\'enregistrement de la note');
      }
    } catch (error) {
      console.error('Erreur sauvegarde note:', error);
      alert('Erreur lors de l\'enregistrement de la note');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <GradientText className="text-4xl font-bold mb-2">
            Mes Élèves
          </GradientText>
          <p className="text-gray-400">
            Gérez vos élèves et suivez leur progression
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total élèves</p>
                <p className="text-2xl font-bold text-white">{students.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Sessions complétées</p>
                <p className="text-2xl font-bold text-white">
                  {students.reduce((acc, s) => acc + s.completedSessions, 0)}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <StickyNote className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Notes enregistrées</p>
                <p className="text-2xl font-bold text-white">
                  {students.reduce((acc, s) => acc + s.totalNotes, 0)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {students.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">Aucun élève</p>
            <p className="text-gray-400">
              Les joueurs qui réservent des sessions avec vous apparaîtront ici
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des élèves */}
            <div className="lg:col-span-1 space-y-3">
              {students.map((student) => {
                const initials = student.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U';

                return (
                  <GlassCard
                    key={student.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedStudent?.id === student.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.image || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {student.name || 'Joueur'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {student.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {student.totalSessions} sessions
                          </Badge>
                          {student.totalNotes > 0 && (
                            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                              {student.totalNotes} notes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Détails de l'élève */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Informations */}
                  <GlassCard className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedStudent.image || undefined} />
                        <AvatarFallback>
                          {selectedStudent.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {selectedStudent.name || 'Joueur'}
                        </h2>
                        <p className="text-gray-400">{selectedStudent.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">
                          {selectedStudent.totalSessions}
                        </p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Clock className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">
                          {selectedStudent.upcomingSessions}
                        </p>
                        <p className="text-xs text-gray-400">À venir</p>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">
                          {selectedStudent.completedSessions}
                        </p>
                        <p className="text-xs text-gray-400">Complétées</p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Notes */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <StickyNote className="h-5 w-5 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">Notes</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {selectedStudent.totalNotes} note{selectedStudent.totalNotes > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Nouvelle note */}
                    <div className="mb-6">
                      <Textarea
                        placeholder="Ajouter une note sur cet élève..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="mb-3 min-h-[100px]"
                      />
                      <Button
                        onClick={handleSaveNote}
                        disabled={!newNote.trim() || isSavingNote}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isSavingNote ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer la note
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Liste des notes */}
                    <div className="space-y-3">
                      {selectedStudent.notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucune note enregistrée</p>
                        </div>
                      ) : (
                        selectedStudent.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <p className="text-white whitespace-pre-wrap mb-2">
                              {note.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(note.createdAt), 'PPP à HH:mm', { locale: fr })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassCard>

                  {/* Sessions récentes */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Sessions récentes</h3>
                    </div>

                    <div className="space-y-2">
                      {selectedStudent.sessions.slice(0, 5).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div>
                            <p className="font-medium text-white">{session.title}</p>
                            <p className="text-sm text-gray-400">
                              {format(new Date(session.startDate), 'PPP à HH:mm', { locale: fr })}
                            </p>
                          </div>
                          <Badge
                            variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}
                            className={
                              session.status === 'COMPLETED'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }
                          >
                            {session.status === 'COMPLETED' ? 'Complétée' : 'Planifiée'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-white mb-2">
                    Sélectionnez un élève
                  </p>
                  <p className="text-gray-400">
                    Cliquez sur un élève pour voir ses détails et notes
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </CoachLayout>
  );
}
