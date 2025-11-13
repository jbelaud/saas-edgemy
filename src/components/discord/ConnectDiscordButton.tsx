'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Unplug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JoinDiscordServerDialog } from '@/components/discord/JoinDiscordServerDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';

interface ConnectDiscordButtonProps {
  className?: string;
}

export function ConnectDiscordButton({ className }: ConnectDiscordButtonProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [showJoinServerDialog, setShowJoinServerDialog] = useState(false);
  const [isMemberOfServer, setIsMemberOfServer] = useState<boolean | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    description: '',
  });
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/2f3tJdJ3Q2';

  // Vérifier si l'utilisateur a déjà connecté Discord
  useEffect(() => {
    const checkDiscordConnection = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          const connected = !!data.discordId;
          setIsConnected(connected);
          
          // Si Discord est connecté, vérifier si membre du serveur
          if (connected) {
            const memberResponse = await fetch('/api/discord/check-member');
            if (memberResponse.ok) {
              const memberData = await memberResponse.json();
              setIsMemberOfServer(memberData.isMember);
            }
          }
        }
      } catch (error) {
        console.error('Erreur vérification Discord:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDiscordConnection();
  }, [session]);

  // Gérer les messages de retour OAuth
  useEffect(() => {
    const discordSuccess = searchParams.get('discord_success');
    const discordError = searchParams.get('discord_error');

    if (discordSuccess === 'true') {
      setShowSuccess(true);
      setIsConnected(true);
      // Afficher la popup d'invitation au serveur
      setShowJoinServerDialog(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    if (discordError) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Vous avez refusé l\'accès à Discord',
        no_code: 'Code d\'autorisation manquant',
        config: 'Configuration Discord incomplète',
        token_exchange: 'Erreur lors de l\'échange du token',
        user_fetch: 'Erreur lors de la récupération des données Discord',
        already_linked: 'Ce compte Discord est déjà lié à un autre compte',
        server: 'Erreur serveur',
      };
      setShowError(errorMessages[discordError] || 'Erreur inconnue');
      setTimeout(() => setShowError(null), 5000);
    }
  }, [searchParams]);

  const handleConnect = () => {
    window.location.href = '/api/discord/oauth/authorize';
  };

  const handleDisconnect = () => {
    setConfirmDisconnect(true);
  };

  const confirmDisconnectAction = async () => {
    try {
      const response = await fetch('/api/discord/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setIsConnected(false);
        setIsMemberOfServer(null);
        setShowSuccess(false);
        // Afficher un message de succès
        setAlertDialog({
          open: true,
          type: 'success',
          title: 'Discord déconnecté',
          description: 'Votre compte Discord a été déconnecté avec succès.',
        });
        // Recharger la page après fermeture de la modal
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setAlertDialog({
          open: true,
          type: 'error',
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la déconnexion.',
        });
      }
    } catch (error) {
      console.error('Erreur déconnexion Discord:', error);
      setAlertDialog({
        open: true,
        type: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion.',
      });
    }
  };

  if (isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Discord connecté avec succès !
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {showError}
          </AlertDescription>
        </Alert>
      )}

      {isConnected ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Discord connecté</span>
            </div>
            {isMemberOfServer !== null && (
              <div className={`flex items-center gap-2 text-sm ${isMemberOfServer ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isMemberOfServer ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Membre du serveur Edgemy ✓</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>Pas encore membre du serveur</span>
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <Unplug className="h-4 w-4" />
            Déconnecter Discord
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          size="sm"
          className={`w-full bg-[#5865F2] hover:bg-[#4752C4] text-white ${className}`}
        >
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Connecter Discord
        </Button>
      )}

      {/* Dialog d'invitation au serveur Discord */}
      <JoinDiscordServerDialog
        open={showJoinServerDialog}
        onOpenChange={setShowJoinServerDialog}
        inviteUrl={DISCORD_INVITE_URL}
      />

      {/* Modal de confirmation de déconnexion */}
      <AlertDialogCustom
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        title="Déconnecter Discord ?"
        description="Êtes-vous sûr de vouloir déconnecter votre compte Discord ? Vous ne pourrez plus recevoir de notifications ni accéder aux salons privés."
        type="warning"
        confirmText="Oui, déconnecter"
        cancelText="Annuler"
        onConfirm={confirmDisconnectAction}
        showCancel={true}
      />

      {/* Modal d'alerte */}
      <AlertDialogCustom
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
      />
    </div>
  );
}
