import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegalMentionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <div className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="container mx-auto max-w-4xl px-6 py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            Mentions légales
          </p>
          <h1 className="mb-6 text-4xl font-bold text-gray-900">
            Informations légales de la plateforme Edgemy
          </h1>
          <p className="max-w-3xl text-lg text-gray-600">
            Conformément à la législation française, cette page présente les informations relatives à la société éditrice, à l&apos;hébergement du site ainsi qu&apos;aux conditions d&apos;utilisation des contenus disponibles sur la plateforme Edgemy.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-6 py-16 space-y-12">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Éditeur du site</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-semibold text-gray-900">Dénomination sociale :</span> Edgemy SAS</p>
              <p><span className="font-semibold text-gray-900">Forme juridique :</span> Société par actions simplifiée (SAS)</p>
              <p><span className="font-semibold text-gray-900">Siège social :</span> 123 rue du Jeu, 75000 Paris, France</p>
              <p><span className="font-semibold text-gray-900">Capital social :</span> 50 000 €</p>
              <p><span className="font-semibold text-gray-900">Immatriculation :</span> RCS Paris 000 000 000</p>
              <p><span className="font-semibold text-gray-900">Responsable de la publication :</span> Jérémy Belaud</p>
              <p><span className="font-semibold text-gray-900">Contact :</span> contact@edgemy.com</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Hébergement</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-semibold text-gray-900">Hébergeur :</span> Vercel Inc.</p>
              <p><span className="font-semibold text-gray-900">Adresse :</span> 340 S Lemon Ave, Walnut, CA 91789, USA</p>
              <p><span className="font-semibold text-gray-900">Site web :</span> https://vercel.com</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L&apos;ensemble des éléments composant le site Edgemy, notamment les textes, visuels, illustrations, vidéos, logos et éléments graphiques, sont la propriété exclusive de Edgemy SAS, sauf mention contraire. Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Edgemy SAS.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Edgemy SAS met en œuvre tous les moyens raisonnables pour assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site. Toutefois, Edgemy SAS ne saurait être tenue responsable des oublis, inexactitudes ou carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait de tiers partenaires. Les informations fournies le sont à titre indicatif et ne dispensent pas l&apos;utilisateur d&apos;une vérification complémentaire. Edgemy SAS ne pourra être tenue responsable de dommages matériels ou immatériels résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Cookies & données personnelles</h2>
            <p className="text-gray-600">
              Le site peut utiliser des cookies internes et tiers pour améliorer l&apos;expérience utilisateur, mesurer l&apos;audience et proposer des contenus adaptés. Lors de votre première visite, un bandeau d&apos;information vous permet d&apos;accepter ou de refuser l&apos;utilisation des cookies non essentiels. Vous pouvez modifier vos préférences à tout moment via les paramètres de votre navigateur ou le centre de gestion des cookies. Pour plus d&apos;informations sur la collecte et le traitement de vos données, consultez notre politique de confidentialité.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Liens externes</h2>
            <p className="text-gray-600">
              Le site Edgemy peut contenir des liens hypertextes redirigeant vers d&apos;autres sites internet. Edgemy SAS ne dispose d&apos;aucun contrôle sur ces ressources externes et ne peut être tenue responsable de leur contenu ou de leur disponibilité.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="text-gray-600">
              Pour toute question relative aux mentions légales ou à l&apos;utilisation du site, vous pouvez contacter Edgemy SAS à l&apos;adresse suivante : contact@edgemy.com.
            </p>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
