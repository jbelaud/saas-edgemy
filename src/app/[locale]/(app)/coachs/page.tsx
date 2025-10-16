import { setRequestLocale } from 'next-intl/server';

export default async function CoachsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trouver un coach</h1>
        <p className="text-muted-foreground">
          Découvrez nos coachs de poker professionnels
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Liste des coachs à venir */}
        <div className="p-6 border rounded-lg">
          <p className="text-center text-muted-foreground">
            La liste des coachs sera bientôt disponible
          </p>
        </div>
      </div>
    </div>
  );
}
