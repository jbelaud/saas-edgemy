import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <div className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="container mx-auto max-w-4xl px-6 py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            Politique de confidentialité
          </p>
          <h1 className="mb-6 text-4xl font-bold text-gray-900">
            La confidentialité de vos données, notre priorité
          </h1>
          <p className="max-w-3xl text-lg text-gray-600">
            Edgemy s&apos;engage à protéger la vie privée de ses utilisateurs et à assurer une transparence totale sur la manière dont les données personnelles sont collectées, utilisées et protégées dans le cadre de notre plateforme de coaching poker.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-4xl px-6 py-16 space-y-12">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Introduction</h2>
            <p className="text-gray-600">
              Cette politique de confidentialité a pour objectif d&apos;expliquer de manière claire et accessible comment Edgemy SAS collecte, utilise et protège les informations personnelles des utilisateurs conformément au Règlement (UE) 2016/679 (RGPD) et à la législation française applicable. Nous mettons tout en œuvre pour garantir la transparence et le respect de votre vie privée.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Données collectées</h2>
            <div className="space-y-3 text-gray-600">
              <p>Les données personnelles que nous pouvons être amenés à collecter comprennent :</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Informations d&apos;inscription : nom, prénom, adresse e-mail, mot de passe, statut (joueur ou coach).</li>
                <li>Données complémentaires fournies par les coachs : expérience, spécialités, disponibilités.</li>
                <li>Données de navigation et cookies : pages consultées, temps passé sur le site, préférences, identifiants de session.</li>
                <li>Données statistiques et analytiques : mesures d&apos;audience, performances des campagnes marketing, interactions avec les contenus.</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Finalité du traitement</h2>
            <p className="text-gray-600">
              Les données collectées sont utilisées pour les finalités suivantes :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-600">
              <li>Gestion des comptes utilisateurs, accès aux services et personnalisation de l&apos;expérience.</li>
              <li>Envoi de communications liées à la plateforme : confirmations, notifications, newsletter et contenus pédagogiques.</li>
              <li>Amélioration continue du service, suivi des performances et sécurité des transactions.</li>
              <li>Gestion des relations avec les coachs et animation de la communauté.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Durée de conservation</h2>
            <p className="text-gray-600">
              Les données personnelles sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées. Les comptes inactifs sont supprimés ou anonymisés après 24 mois d&apos;inactivité, sauf obligation légale nécessitant une conservation plus longue. Les données liées aux facturations ou obligations comptables sont conservées conformément aux durées imposées par la loi française.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Droits des utilisateurs</h2>
            <p className="text-gray-600">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-600">
              <li>Droit d&apos;accès et de rectification : obtenir une copie de vos données et les rectifier si elles sont inexactes.</li>
              <li>Droit d&apos;effacement (droit à l&apos;oubli) : demander la suppression de vos données lorsque leur conservation n&apos;est plus nécessaire.</li>
              <li>Droit d&apos;opposition : vous opposer au traitement de vos données pour des raisons légitimes ou à des fins de prospection.</li>
              <li>Droit à la portabilité : recevoir vos données dans un format structuré et lisible par machine.</li>
            </ul>
            <p className="mt-3 text-gray-600">
              Pour exercer vos droits, contactez-nous à l&apos;adresse suivante : <a href="mailto:privacy@edgemy.com" className="font-semibold text-blue-600">privacy@edgemy.com</a>.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Utilisation des cookies et outils d&apos;analyse</h2>
            <p className="text-gray-600">
              Edgemy utilise des cookies nécessaires au fonctionnement du site ainsi que des cookies analytiques pour mesurer l&apos;audience et améliorer nos services. Nous pouvons recourir à des outils d&apos;analyse tels que Google Analytics ou des solutions équivalentes. Lors de votre première visite, un bandeau vous permet d&apos;accepter ou de refuser les cookies non essentiels. Vous pouvez modifier vos préférences à tout moment via les paramètres de votre navigateur ou notre centre de gestion des cookies.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Sécurité des données</h2>
            <p className="text-gray-600">
              Edgemy met en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre toute perte, accès non autorisé, divulgation, altération ou destruction. L&apos;accès aux données est strictement limité aux membres de l&apos;équipe dont les missions justifient l&apos;utilisation de ces informations.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="text-gray-600">
              Pour toute question relative à cette politique de confidentialité ou à la protection de vos données personnelles, vous pouvez nous écrire à <a href="mailto:privacy@edgemy.com" className="font-semibold text-blue-600">privacy@edgemy.com</a>.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Mise à jour</h2>
            <p className="text-gray-600">
              Cette politique de confidentialité est susceptible d&apos;évoluer afin de refléter nos pratiques ou les évolutions légales. Date de dernière mise à jour : 22 octobre 2025.
            </p>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  );
}
