import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui';
import { CheckCircle, Star, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { SignupButton } from '@/components/auth/SignupButton';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<{
    playerEmail?: string;
  }>;
}

async function getCoach(slug: string) {
  return prisma.coach.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });
}

// Métadonnées SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const coach = await getCoach(slug);

  if (!coach) {
    return {
      title: 'Merci pour votre avis | Edgemy',
      robots: { index: false, follow: false },
    };
  }

  const coachName = `${coach.firstName} ${coach.lastName}`;

  return {
    title: `Merci pour votre avis sur ${coachName} | Edgemy`,
    robots: { index: false, follow: false }, // Pas d'indexation pour cette page
  };
}

export default async function ThankYouPage({ params, searchParams }: PageProps) {
  const { slug, locale } = await params;
  const { playerEmail } = await searchParams;

  setRequestLocale(locale);
  const t = await getTranslations('coach.review.thankYou');

  const coach = await getCoach(slug);

  if (!coach) {
    notFound();
  }

  const coachName = `${coach.firstName} ${coach.lastName}`;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Success Card */}
          <GlassCard className="p-8 md:p-12 text-center border-emerald-400/30 bg-emerald-500/10">
            {/* Icon de succès */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <Star className="w-6 h-6 text-yellow-900 fill-yellow-900" />
                </div>
              </div>
            </div>

            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('title')} 🎉
            </h1>

            {/* Message */}
            <p className="text-slate-300 text-lg mb-6">
              {t.rich('message', { 
                coachName,
                highlight: (chunks) => <span className="font-semibold text-emerald-300">{chunks}</span>
              })}
            </p>

            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-8">
              <p className="text-blue-200 text-sm">
                ℹ️ {t('validationNote', { coachName })}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-8" />

            {/* CTA Inscription */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                  <UserPlus className="w-6 h-6 text-emerald-400" />
                  {t('createAccount.title')}
                </h2>
                <p className="text-slate-400 mb-6">
                  {t('createAccount.subtitle')}
                </p>
              </div>

              {/* Avantages */}
              <div className="grid gap-3 text-left max-w-md mx-auto mb-6">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{t('createAccount.benefit1Title')}</p>
                    <p className="text-slate-400 text-sm">{t('createAccount.benefit1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{t('createAccount.benefit2Title')}</p>
                    <p className="text-slate-400 text-sm">{t('createAccount.benefit2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{t('createAccount.benefit3Title')}</p>
                    <p className="text-slate-400 text-sm">{t('createAccount.benefit3Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{t('createAccount.benefit4Title')}</p>
                    <p className="text-slate-400 text-sm">{t('createAccount.benefit4Desc')}</p>
                  </div>
                </div>
              </div>

              {/* Boutons CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <SignupButton prefilledEmail={playerEmail} />
                <Link href={`/${locale}/coach/${coach.slug}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-white bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                  >
                    {t('backToProfile')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Note déjà inscrit */}
              <p className="text-slate-500 text-sm mt-6">
                {t('alreadyAccount')}{' '}
                <Link
                  href={`/${locale}/?auth=signin`}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </GlassCard>

          {/* Informations additionnelles */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              {t('contactUs')}{' '}
              <a
                href="https://discord.gg/edgemy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Discord
              </a>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
