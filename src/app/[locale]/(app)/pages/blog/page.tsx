import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogIntroPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <div className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-blue-50 to-purple-100">
        <div className="container mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-purple-600">
            Blog Edgemy
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Apprends. Progresse. Domine.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Le blog Edgemy rassemble des analyses pointues, des retours d&apos;expérience et des conseils pratiques pour t&apos;aider à prendre l&apos;ascendant sur les tables, jour après jour.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-5xl px-6 py-16 space-y-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">Conseils & retours de pros</h2>
              <p className="text-gray-600">
                Entretiens avec nos coachs, témoignages de grinders, préparation mentale et routines de performance pour rester sharp session après session.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">Analyses de mains & stratégie</h2>
              <p className="text-gray-600">
                Décryptage de mains clés, deep dives techniques et approches exploitantes pour MTT, cash game et formats hybrides.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">Mindset & gestion de bankroll</h2>
              <p className="text-gray-600">
                Outils pour gérer la variance, optimiser ta bankroll et maintenir une discipline mentale à toute épreuve.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">Vie de coach & coulisses</h2>
              <p className="text-gray-600">
                Plonge dans le quotidien des coachs Edgemy, découvre nos méthodes pédagogiques et les innovations qui font évoluer le coaching poker.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-gray-50 p-10 text-center">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Inscris-toi à la newsletter</h2>
            <p className="mb-6 text-lg text-gray-600">
              Reçois chaque semaine les meilleures ressources, nos articles à ne pas manquer et des conseils exclusifs pour accélérer ta progression.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Je m&apos;abonne
            </Link>
          </div>

          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Coachs, partagez votre expertise</h2>
            <p className="mb-4 text-gray-600">
              Le blog Edgemy accueille les contributions des coachs de la plateforme. Articles invités, analyses, retours de session : inspirez la communauté et mettez en avant votre vision du jeu.
            </p>
            <p className="text-sm font-medium text-purple-600">Proposez votre article à blog@edgemy.com</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900">
        <div className="container mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <h2 className="mb-4 text-3xl font-semibold">Prêt à monter de niveau ?</h2>
          <p className="mb-8 text-lg text-gray-200">
            Plonge dans nos contenus, teste de nouvelles approches et garde une longueur d&apos;avance sur la concurrence.
          </p>
          <Link
            href="/blog/articles"
            className="inline-flex items-center justify-center rounded-full border border-white px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white hover:text-gray-900"
          >
            Découvre nos derniers articles
          </Link>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
