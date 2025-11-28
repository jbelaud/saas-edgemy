import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, DollarSign, CreditCard, TrendingUp, Receipt } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSessionDetails(id: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
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
      pack: {
        select: {
          id: true,
          hours: true,
        },
      },
    },
  });

  if (!reservation) {
    return null;
  }

  return reservation;
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getSessionDetails(resolvedParams.id);

  if (!session) {
    notFound();
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(resolvedParams.locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(resolvedParams.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(resolvedParams.locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      PAID: "bg-green-100 text-green-700 border-green-200",
      FAILED: "bg-red-100 text-red-700 border-red-200",
      REFUNDED: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const coachFullName = `${session.coach.firstName} ${session.coach.lastName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href={`/${resolvedParams.locale}/admin/sessions`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Détails de la session</h1>
            <p className="text-sm text-gray-400">ID: {session.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusBadge(session.status)}>
            {session.status}
          </Badge>
          <Badge className={getPaymentStatusBadge(session.paymentStatus)}>
            {session.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de la session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations de la session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Offre</p>
              <p className="font-semibold">{session.announcement.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Type</p>
              <Badge className={session.type === 'PACK' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}>
                {session.type === 'PACK' ? 'Pack d\'heures' : 'Session unique'}
              </Badge>
            </div>

            {session.type === 'PACK' && session.sessionsCount && (
              <div>
                <p className="text-sm text-gray-500">Nombre de sessions</p>
                <p className="font-semibold">{session.sessionsCount}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Date et heure</p>
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(session.startDate)}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTime(session.startDate)} - {formatTime(session.endDate)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-semibold">{session.announcement.durationMin} minutes</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date de réservation</p>
              <p className="text-sm">{formatDate(session.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Coach</p>
              <div className="flex items-center gap-3">
                {session.coach.avatarUrl && (
                  <img
                    src={session.coach.avatarUrl}
                    alt={coachFullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{coachFullName}</p>
                  <Link
                    href={`/${resolvedParams.locale}/coach/${session.coach.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Joueur</p>
              <div className="flex items-center gap-3">
                {session.player.image && (
                  <img
                    src={session.player.image}
                    alt={session.player.name || 'Joueur'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{session.player.name}</p>
                  <p className="text-sm text-gray-500">{session.player.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails financiers */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Détails financiers
            </CardTitle>
            <CardDescription>
              Répartition des montants et commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Montant joueur */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Receipt className="h-5 w-5" />
                  <h3 className="font-semibold">Montant joueur</h3>
                </div>
                <div className="space-y-2 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prix total</span>
                    <span className="font-bold text-blue-700">{formatCurrency(session.priceCents)}</span>
                  </div>
                </div>
              </div>

              {/* Frais */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="font-semibold">Frais</h3>
                </div>
                <div className="space-y-2 bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frais Stripe</span>
                    <span className="font-semibold">{formatCurrency(session.stripeFeeCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frais Edgemy</span>
                    <span className="font-semibold">{formatCurrency(session.edgemyFeeCents)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Total frais</span>
                    <span className="font-bold text-orange-700">{formatCurrency(session.serviceFeeCents)}</span>
                  </div>
                </div>
              </div>

              {/* Revenus coach */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-semibold">Revenus coach</h3>
                </div>
                <div className="space-y-2 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Montant net</span>
                    <span className="font-bold text-green-700">{formatCurrency(session.coachNetCents)}</span>
                  </div>
                  {session.type === 'PACK' && session.sessionsCount && (
                    <div className="text-xs text-gray-500">
                      Par session : {formatCurrency(Math.round(session.coachNetCents / session.sessionsCount))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Récapitulatif comptable</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant payé par le joueur</span>
                  <span className="font-semibold">{formatCurrency(session.priceCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versé au coach (net)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(session.coachNetCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenu Edgemy (brut)</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(session.edgemyFeeCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais Stripe</span>
                  <span className="font-semibold text-gray-600">{formatCurrency(session.stripeFeeCents)}</span>
                </div>
                {session.edgemyRevenueHT && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenu Edgemy HT</span>
                    <span className="font-semibold">{formatCurrency(session.edgemyRevenueHT)}</span>
                  </div>
                )}
                {session.edgemyRevenueTVACents && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA Edgemy (20%)</span>
                    <span className="font-semibold">{formatCurrency(session.edgemyRevenueTVACents)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations Stripe */}
            {(session.stripePaymentId || session.stripeSessionId || session.stripeTransferId) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Informations Stripe</h3>
                <div className="space-y-2 text-sm">
                  {session.stripePaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{session.stripePaymentId}</code>
                    </div>
                  )}
                  {session.stripeSessionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session ID</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{session.stripeSessionId}</code>
                    </div>
                  )}
                  {session.stripeTransferId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transfer ID</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{session.stripeTransferId}</code>
                    </div>
                  )}
                  {session.transferredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date du transfert</span>
                      <span>{formatDate(session.transferredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations de remboursement */}
            {session.refundStatus !== 'NONE' && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4 text-red-600">Remboursement</h3>
                <div className="space-y-2 text-sm bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut</span>
                    <Badge className="bg-red-100 text-red-700">{session.refundStatus}</Badge>
                  </div>
                  {session.refundAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant remboursé</span>
                      <span className="font-semibold">{formatCurrency(session.refundAmount)}</span>
                    </div>
                  )}
                  {session.refundReason && (
                    <div>
                      <span className="text-gray-600">Raison</span>
                      <p className="mt-1">{session.refundReason}</p>
                    </div>
                  )}
                  {session.refundedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span>{formatDate(session.refundedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
