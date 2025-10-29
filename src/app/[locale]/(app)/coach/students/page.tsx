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

interface Student {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  sessions: {
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
    title: string;
  }[];
}

export default function CoachStudentsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session) {
      fetchStudents();
    }
  }, [session, isPending, router]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/coach/students');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des élèves');
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async (playerId: string) => {
    try {
      const response = await fetch(`/api/coach/students/${playerId}/notes`);
      if (response.ok) {
        const data = await response.json();
        if (data.notes && data.notes.length > 0) {
          setNotes(data.notes[0].content);
        } else {
          setNotes('');
        }
      }
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  };

  const saveNotes = async () => {
    if (!selectedStudent) return;

    setIsSavingNotes(true);
    try {
      const response = await fetch(`/api/coach/students/${selectedStudent.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: notes }),
      });

      if (response.ok) {
        alert('✅ Notes sauvegardées avec succès');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
      alert('❌ Erreur lors de la sauvegarde des notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchNotes(student.id);
  };

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </CoachLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <CoachLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-600" />
            Mes Élèves
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos élèves et suivez leur progression
          </p>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun élève pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Vos élèves apparaîtront ici dès qu&apos;ils auront réservé une session avec vous
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des élèves */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Liste des élèves ({students.length})
              </h2>
              <div className="space-y-3">
                {students.map((student) => (
                  <Card
                    key={student.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStudent?.id === student.id
                        ? 'ring-2 ring-orange-500 bg-orange-50'
                        : ''
                    }`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {student.image ? (
                          <Image
                            src={student.image}
                            alt={student.name || student.email}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {student.name || student.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {student.totalSessions} session{student.totalSessions > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Détails de l'élève sélectionné */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {selectedStudent.image ? (
                        <Image
                          src={selectedStudent.image}
                          alt={selectedStudent.name || selectedStudent.email}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{selectedStudent.name || selectedStudent.email}</CardTitle>
                        <CardDescription>{selectedStudent.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="stats" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="stats">Statistiques</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="stats" className="space-y-4 mt-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedStudent.totalSessions}</p>
                              <p className="text-sm text-gray-600">Total</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedStudent.upcomingSessions}</p>
                              <p className="text-sm text-gray-600">À venir</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedStudent.completedSessions}</p>
                              <p className="text-sm text-gray-600">Terminées</p>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="sessions" className="space-y-3 mt-4">
                        {selectedStudent.sessions.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">Aucune session</p>
                        ) : (
                          selectedStudent.sessions.map((session) => (
                            <Card key={session.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">{session.title}</p>
                                    <p className="text-sm text-gray-600">
                                      {format(new Date(session.startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}
                                  >
                                    {session.status === 'COMPLETED' ? 'Terminée' : 'Confirmée'}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="notes" className="space-y-4 mt-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <StickyNote className="h-4 w-4" />
                            Notes personnelles
                          </label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ajoutez des notes sur cet élève (objectifs, points à travailler, etc.)"
                            rows={8}
                            className="resize-none"
                          />
                          <Button
                            onClick={saveNotes}
                            disabled={isSavingNotes}
                            className="mt-3 bg-orange-600 hover:bg-orange-700"
                          >
                            {isSavingNotes ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sauvegarde...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Sauvegarder les notes
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Sélectionnez un élève pour voir ses détails
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </CoachLayout>
  );
}
