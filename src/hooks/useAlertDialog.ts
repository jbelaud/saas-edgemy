import { useState, useCallback } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  open: boolean;
  type: AlertType;
  title: string;
  description: string;
}

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

export function useAlertDialog() {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    type: 'info',
    title: '',
    description: '',
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const showAlert = useCallback((
    title: string,
    description: string,
    type: AlertType = 'info'
  ) => {
    setAlertState({
      open: true,
      type,
      title,
      description,
    });
  }, []);

  const showSuccess = useCallback((title: string, description: string) => {
    showAlert(title, description, 'success');
  }, [showAlert]);

  const showError = useCallback((title: string, description: string) => {
    showAlert(title, description, 'error');
  }, [showAlert]);

  const showWarning = useCallback((title: string, description: string) => {
    showAlert(title, description, 'warning');
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string,
    description: string,
    onConfirm: () => void
  ) => {
    setConfirmState({
      open: true,
      title,
      description,
      onConfirm,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    alertState,
    confirmState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    closeAlert,
    closeConfirm,
  };
}
