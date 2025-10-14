'use client';

import { Suspense } from 'react';
import { useCoachRoleSetup } from '@/hooks/useCoachRoleSetup';
import { usePlayerRoleSetup } from '@/hooks/usePlayerRoleSetup';

function RoleSetupContent() {
  useCoachRoleSetup();
  usePlayerRoleSetup();
  return null;
}

export function RoleSetupWrapper() {
  return (
    <Suspense fallback={null}>
      <RoleSetupContent />
    </Suspense>
  );
}
