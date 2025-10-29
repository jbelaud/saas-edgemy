import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer tous les élèves du coach
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les notes du coach
    const notes = await prisma.coachNote.findMany({
      where: {
        coachId: coach.id,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Récupérer tous les joueurs qui ont réservé au moins une session
    const reservations = await prisma.reservation.findMany({
      where: {
        coachId: coach.id,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par joueur
    const studentsMap = new Map();
    
    reservations.forEach(reservation => {
      const playerId = reservation.player.id;
      
      if (!studentsMap.has(playerId)) {
        // Récupérer les notes pour ce joueur
        const playerNotes = notes.filter(note => note.playerId === playerId);
        
        studentsMap.set(playerId, {
          id: playerId,
          name: reservation.player.name,
          email: reservation.player.email,
          image: reservation.player.image,
          totalSessions: 0,
          upcomingSessions: 0,
          completedSessions: 0,
          sessions: [],
          notes: playerNotes.map(note => ({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          })),
          totalNotes: playerNotes.length,
        });
      }
      
      const student = studentsMap.get(playerId);
      student.totalSessions++;
      
      const now = new Date();
      const sessionDate = new Date(reservation.startDate);
      
      if (sessionDate > now && reservation.status === 'CONFIRMED') {
        student.upcomingSessions++;
      } else if (reservation.status === 'COMPLETED' || sessionDate <= now) {
        student.completedSessions++;
      }
      
      student.sessions.push({
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status,
        title: reservation.announcement.title,
      });
    });

    // Convertir en array et trier par nombre total de sessions
    const students = Array.from(studentsMap.values()).sort(
      (a, b) => b.totalSessions - a.totalSessions
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
