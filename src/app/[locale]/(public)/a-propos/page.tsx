import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <div className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="container mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            À propos d&apos;Edgemy
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Accélérer la progression des joueurs de poker francophones
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Nous connectons les passionnés de poker à des coachs triés sur le volet pour transformer chaque session en un avantage mesurable sur les tables.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-6 py-16 space-y-16">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Mission</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Edgemy a pour mission de créer le lien idéal entre joueurs ambitieux et coachs qualifiés. Grâce à une plateforme centralisée, nous facilitons l&apos;accès à une expertise à haute valeur ajoutée, pour que chaque minute de coaching se traduise par des progrès rapides, structurés et mesurables.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Vision</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Nous imaginons un coaching poker accessible, rentable et parfaitement orchestré. Une expérience où les joueurs disposent d&apos;un accompagnement stratégique, mental et technique centralisé, capable de s&apos;adapter à leur rythme et à leurs objectifs pour les amener durablement au niveau supérieur.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Valeurs</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Pédagogie</h3>
                <p className="text-sm text-gray-600">
                  Des contenus clairs, progressifs et adaptés à chaque joueur pour transformer la complexité du poker en leviers d&apos;action.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Transparence</h3>
                <p className="text-sm text-gray-600">
                  Une relation de confiance fondée sur des retours honnêtes, des métriques objectivées et une communication ouverte.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Performance</h3>
                <p className="text-sm text-gray-600">
                  Un suivi précis, des plans d&apos;action ciblés et des outils d&apos;analyse pour maximiser chaque prise de décision sur les tables.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Entraide</h3>
                <p className="text-sm text-gray-600">
                  Une communauté soudée qui partage ses expériences, ses réussites et ses défis pour grandir ensemble.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Histoire & équipe fondatrice</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Edgemy est né de la rencontre entre des grinders MTT, des spécialistes du coaching mental et des entrepreneurs du digital. Passionnés par l&apos;innovation et animés par la volonté d&apos;élever le niveau du coaching francophone, nous avons uni nos expertises pour créer une plateforme qui reflète notre vision du poker moderne : exigeant, structuré et profondément humain.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900">
        <div className="container mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <h2 className="mb-4 text-3xl font-semibold">Rejoins la communauté</h2>
          <p className="mb-8 text-lg text-gray-200">
            Que tu sois grinder confirmé ou joueur en pleine ascension, nous sommes là pour t&apos;offrir le meilleur accompagnement possible.
          </p>
          <p className="text-xl font-semibold">
            Rejoins l&apos;aventure Edgemy et prends une longueur d&apos;avance sur tes adversaires.
          </p>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
