'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Gift, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ActivateFreeTrial() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const t = useTranslations('coach.activate');
  const { data: session, isPending } = useSession();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setMessage({ type: 'error', text: t('emptyCode') });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'activation');
      }

      setMessage({
        type: 'success',
        text: t('success')
      });

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push(`/${locale}/coach/dashboard`);
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </CoachLayout>
    );
  }

  if (!session?.user) {
    router.push(`/${locale}/sign-in`);
    return null;
  }

  return (
    <CoachLayout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <GradientText className="text-4xl font-bold mb-3" variant="emerald">
            {t('title')}
          </GradientText>
          <p className="text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
                {t('codeLabel')}
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('codePlaceholder')}
                className="text-center text-lg font-semibold tracking-wider uppercase"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                {t('codeHint')}
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <p className={`text-sm font-semibold ${
                    message.type === 'success' ? 'text-emerald-300' : 'text-red-300'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('activating')}
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-5 w-5" />
                  {t('activateButton')}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">
              {t('benefits.title')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('benefits.fullAccess')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('benefits.unlimitedAnnouncements')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('benefits.agendaManagement')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('benefits.stripeIntegration')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('benefits.discordChannels')}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 <strong>Note :</strong> {t('note')}
            </p>
          </div>
        </GlassCard>
      </div>
    </CoachLayout>
  );
}
