import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

// GET - Endpoint CRON pour rappeler aux coachs de mettre à jour leurs disponibilités
// À appeler chaque dimanche à 10h (heure locale de chaque coach)
// TODO: Connecter à n8n pour automatisation
export async function GET() {
  try {
    // Récupérer tous les coachs actifs avec leur timezone
    const coaches = await prisma.coach.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        timezone: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const reminders: Array<{
      coachId: string;
      coachName: string;
      email: string;
      timezone: string;
      localTime: string;
    }> = [];

    // Pour chaque coach, calculer l'heure locale
    for (const coach of coaches) {
      const timezone = coach.timezone || 'Europe/Paris';
      const now = new Date();
      const localTime = utcToZonedTime(now, timezone);
      const localTimeStr = format(localTime, 'HH:mm');

      reminders.push({
        coachId: coach.id,
        coachName: `${coach.firstName} ${coach.lastName}`,
        email: coach.user.email || 'N/A',
        timezone,
        localTime: localTimeStr,
      });

      // TODO: Envoyer email via Brevo
      console.log(`[MOCK] Rappel envoyé à ${coach.firstName} ${coach.lastName} (${coach.user.email})`);
      console.log(`  Timezone: ${timezone}`);
      console.log(`  Heure locale: ${localTimeStr}`);
      console.log(`  Message: "N'oubliez pas de mettre à jour vos disponibilités pour la semaine prochaine !"`);
      console.log('---');
    }

    return NextResponse.json({
      success: true,
      message: `${reminders.length} rappels traités (mock)`,
      reminders,
      note: 'Cet endpoint est en mode mock. À connecter à n8n et Brevo pour production.',
    });
  } catch (error) {
    console.error('Erreur lors du traitement des rappels:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
