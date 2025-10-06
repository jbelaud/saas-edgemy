import { useTranslations } from 'next-intl';
import { Link } from 'next-intl/navigation';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Accéder au Dashboard
            </Link>
            <Link
              href="/profile"
              className="px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-200 transition-all duration-300 hover:border-gray-300 hover:shadow-lg"
            >
              Mon Profil
            </Link>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-amber-100 text-amber-800 rounded-full font-semibold">
            🚧 Application en cours de développement
          </div>
        </div>
      </div>
    </div>
  );
}
