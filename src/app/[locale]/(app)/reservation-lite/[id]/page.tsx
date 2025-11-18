import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CheckCircle, Calendar, Clock, AlertTriangle, MessageSquare, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Réservation confirmée - Plan Lite | Edgemy',
  description: 'Votre réservation a été créée avec succès',
};

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function ReservationLitePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;

  // Vérifier l'authentification
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/reservation-lite/${id}`);
  }

  // Récupérer la réservation
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      coach: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          paymentPreferences: true,
          planKey: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      player: {
        select: {
          name: true,
          email: true,
        },
      },
      announcement: {
        select: {
          title: true,
          description: true,
        },
      },
    },
  });

  if (!reservation) {
    notFound();
  }

  // Vérifier que l'utilisateur est bien le joueur de cette réservation
  if (reservation.playerId !== session.user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous n&apos;avez pas accès à cette réservation.
          </p>
          <Link href={`/${locale}/player/dashboard`}>
            <Button className="w-full">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier que c'est bien une réservation LITE
  if (reservation.coach.planKey !== 'LITE') {
    redirect(`/${locale}/player/sessions`);
  }

  const isPaid = reservation.paymentStatus === 'EXTERNAL_PAID';
  const isPending = reservation.paymentStatus === 'EXTERNAL_PENDING';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header de confirmation */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Votre réservation avec <strong>{reservation.coach.firstName} {reservation.coach.lastName}</strong> a été créée avec succès.
          </p>

          {/* Statut du paiement */}
          {isPaid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Paiement confirmé</p>
                  <p className="text-sm text-green-800">
                    Le coach a confirmé la réception de votre paiement. Votre session est confirmée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">En attente de paiement</p>
                  <p className="text-sm text-orange-800">
                    Rendez-vous sur le salon Discord pour effectuer le paiement selon les instructions du coach.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Détails de la session */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Détails de la session
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              {reservation.coach.avatarUrl && (
                <img
                  src={reservation.coach.avatarUrl}
                  alt={`${reservation.coach.firstName} ${reservation.coach.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm text-gray-600">Coach</p>
                <p className="font-semibold text-gray-900">
                  {reservation.coach.firstName} {reservation.coach.lastName}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Session</p>
              <p className="font-semibold text-gray-900">{reservation.announcement.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                {new Date(reservation.startDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Horaire</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                {new Date(reservation.startDate).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(reservation.endDate).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Prix</p>
              <p className="font-semibold text-gray-900">
                {(reservation.priceCents / 100).toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        {/* Instructions de paiement - Plan LITE */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement - Plan Lite
          </h2>

          <div className="space-y-4 text-blue-900">
            <p className="font-semibold">
              📱 Rendez-vous sur votre salon Discord privé pour communiquer avec le coach.
            </p>

            {reservation.coach.paymentPreferences.length > 0 && (
              <div className="bg-white/50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">Moyens de paiement préférés du coach :</p>
                <ul className="list-disc list-inside space-y-1">
                  {reservation.coach.paymentPreferences.map((pref, idx) => (
                    <li key={idx} className="text-sm">{pref}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm">
              Le coach vous communiquera ses instructions de paiement (IBAN, adresse crypto, Wise, Revolut, etc.) directement sur Discord.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                ⚠️ Important - Clause de non-responsabilité
              </p>
              <p className="text-sm text-orange-800">
                Edgemy n&apos;est <strong>pas impliqué</strong> dans la transaction de paiement entre vous et le coach.
                Vous effectuez le paiement <strong>directement</strong> au coach selon ses instructions.
                Edgemy ne peut être tenu responsable en cas de litige.
              </p>
            </div>
          </div>
        </div>

        {/* Salon Discord */}
        {reservation.discordChannelId && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Votre salon Discord privé
            </h2>

            <p className="text-indigo-900 mb-4">
              Un salon Discord privé a été créé pour vous et votre coach.
              C&apos;est ici que vous pourrez discuter, recevoir les instructions de paiement, et préparer votre session.
            </p>

            <a
              href={`https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${reservation.discordChannelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ouvrir le salon Discord
              </Button>
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link href={`/${locale}/player/sessions`} className="flex-1">
            <Button variant="outline" className="w-full">
              Voir mes sessions
            </Button>
          </Link>
          <Link href={`/${locale}/player/dashboard`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
