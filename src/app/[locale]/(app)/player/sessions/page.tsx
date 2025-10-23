import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';

export default async function PlayerSessionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Récupérer les réservations du joueur
  const reservations = await prisma.reservation.findMany({
    where: { 
      playerId: session.user.id,
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          slug: true,
        },
      },
      announcement: {
        select: {
          title: true,
          durationMin: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  });

  // Séparer les sessions futures et passées
  const now = new Date();
  const upcomingSessions = reservations.filter(r => new Date(r.startDate) >= now);
  const pastSessions = reservations.filter(r => new Date(r.startDate) < now);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Sessions</h1>
        <p className="text-gray-600 mt-2">
          Consultez vos sessions de coaching réservées
        </p>
      </div>

      <div className="space-y-8">
        {/* Prochaines sessions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Prochaines sessions ({upcomingSessions.length})
          </h2>
          
          {upcomingSessions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Aucune session à venir</p>
              <p className="text-sm text-gray-400 mt-2">
                Explorez les coachs disponibles pour réserver une session
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {reservation.coach.avatarUrl && (
                          <Image
                            src={reservation.coach.avatarUrl}
                            alt={`${reservation.coach.firstName} ${reservation.coach.lastName}`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {reservation.announcement.title}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            avec {reservation.coach.firstName} {reservation.coach.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "HH:mm", { locale: fr })}
                          {' - '}
                          {format(new Date(reservation.endDate), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {reservation.status === 'CONFIRMED' ? 'Confirmée' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions passées */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Sessions passées ({pastSessions.length})
            </h2>
            
            <div className="grid gap-4">
              {pastSessions.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-gray-50 shadow-sm rounded-lg p-6 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {reservation.coach.avatarUrl && (
                          <Image
                            src={reservation.coach.avatarUrl}
                            alt={`${reservation.coach.firstName} ${reservation.coach.lastName}`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full grayscale"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {reservation.announcement.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            avec {reservation.coach.firstName} {reservation.coach.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "d MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
