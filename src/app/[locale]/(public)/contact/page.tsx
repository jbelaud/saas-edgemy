import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <div className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-indigo-50 to-blue-100">
        <div className="container mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
            Contact
          </p>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Une question, une idée, une collaboration ? Contacte-nous.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            L&apos;équipe Edgemy est disponible pour t&apos;aider à tirer le meilleur de la plateforme, que tu sois joueur, coach ou partenaire.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-5xl px-6 py-16 space-y-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Pour les joueurs</h2>
              <p className="mb-4 text-gray-600">
                Besoin d&apos;aide pour trouver ton coach idéal ou optimiser ton plan de progression ? Notre équipe te guide vers les profils adaptés à ton style de jeu et à tes objectifs.
              </p>
              <p className="text-sm font-medium text-indigo-600">support-joueurs@edgemy.com</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Pour les coachs</h2>
              <p className="mb-4 text-gray-600">
                Tu veux rejoindre la plateforme, proposer tes packs ou développer ton activité ? Parlons de ton expertise et de la manière dont Edgemy peut amplifier ton impact.
              </p>
              <p className="text-sm font-medium text-indigo-600">coachs@edgemy.com</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Presse & partenaires</h2>
              <p className="mb-4 text-gray-600">
                Envie d&apos;une interview, d&apos;un partenariat ou d&apos;un événement commun ? Nous sommes ouverts aux initiatives qui font rayonner le poker francophone.
              </p>
              <p className="text-sm font-medium text-indigo-600">partenariats@edgemy.com</p>
            </div>
          </div>

          <div className="rounded-3xl bg-gray-50 p-10">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Informations de contact</h2>
            <p className="mb-2 text-lg text-gray-600">
              Tu peux également nous écrire directement à <a href="mailto:contact@edgemy.com" className="font-semibold text-indigo-600">contact@edgemy.com</a>.
            </p>
            <p className="text-sm text-gray-500">
              Nos bureaux sont basés à Paris, France. Nous répondons généralement sous 48 heures ouvrées.
            </p>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">FAQ</h2>
            <div className="space-y-4">
              <details className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer text-lg font-medium text-gray-900">
                  Quel est le délai moyen de réponse ?
                </summary>
                <p className="mt-3 text-gray-600">
                  Nous répondons à la majorité des demandes sous 24 à 48 heures ouvrées. En période de forte activité, cela peut exceptionnellement prendre un peu plus de temps.
                </p>
              </details>
              <details className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer text-lg font-medium text-gray-900">
                  Comment devenir coach sur Edgemy ?
                </summary>
                <p className="mt-3 text-gray-600">
                  Remplis le formulaire de candidature ou contacte directement notre équipe coaching à <a href="mailto:coachs@edgemy.com" className="font-semibold text-indigo-600">coachs@edgemy.com</a>. Nous organisons ensuite un échange pour comprendre ton expertise et vérifier ton expérience.
                </p>
              </details>
              <details className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer text-lg font-medium text-gray-900">
                  Que faire en cas de problème de paiement ?
                </summary>
                <p className="mt-3 text-gray-600">
                  Contacte notre support à <a href="mailto:support@edgemy.com" className="font-semibold text-indigo-600">support@edgemy.com</a>. Nous vérifions rapidement ta situation et te guidons vers la meilleure solution.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900">
        <div className="container mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <h2 className="mb-4 text-3xl font-semibold">On reste en contact ?</h2>
          <p className="mb-8 text-lg text-gray-200">
            Dis-nous comment on peut t&apos;aider et nous reviendrons vers toi avec une solution personnalisée.
          </p>
          <p className="text-xl font-semibold">
            contact@edgemy.com
          </p>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
