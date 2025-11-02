// Simple toast hook for notifications
import { useCallback, useMemo } from 'react';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useCallback(({ title, description }: ToastProps) => {
    // Simple alert for now - can be enhanced with a proper toast library later
    if (title || description) {
      alert(`${title ? `${title}: ` : ''}${description || ''}`);
    }
  }, []);

  const dismiss = useCallback(() => {}, []);

  return useMemo(
    () => ({
      toast,
      toasts: [],
      dismiss,
    }),
    [toast, dismiss],
  );
}
