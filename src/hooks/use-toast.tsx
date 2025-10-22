// Simple toast hook for notifications
export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description }: ToastProps) => {
    // Simple alert for now - can be enhanced with a proper toast library later
    if (title || description) {
      alert(`${title ? title + ': ' : ''}${description || ''}`);
    }
  };

  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}
