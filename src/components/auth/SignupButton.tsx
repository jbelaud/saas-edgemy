'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoginModal } from '@/components/auth/LoginModal';
import { CoachSignUpModal } from '@/components/auth/CoachSignUpModal';

interface SignupButtonProps {
  prefilledEmail?: string;
}

export function SignupButton({ prefilledEmail: _prefilledEmail }: SignupButtonProps) {
  const t = useTranslations('auth.signUp');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCoachSignUpModal, setShowCoachSignUpModal] = useState(false);

  return (
    <>
      <Button
        size="lg"
        onClick={() => setShowLoginModal(true)}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        {t('createFreeAccount')}
      </Button>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        context="player"
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowCoachSignUpModal(true);
        }}
      />

      <CoachSignUpModal
        open={showCoachSignUpModal}
        onOpenChange={setShowCoachSignUpModal}
        onSwitchToLogin={() => {
          setShowCoachSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
