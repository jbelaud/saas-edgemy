'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertDialogCustomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const iconMap = {
  success: <CheckCircle2 className="h-12 w-12 text-green-400" />,
  error: <XCircle className="h-12 w-12 text-red-400" />,
  warning: <AlertTriangle className="h-12 w-12 text-amber-400" />,
  info: <Info className="h-12 w-12 text-blue-400" />,
};

const colorMap = {
  success: 'from-green-400 to-emerald-500',
  error: 'from-red-400 to-rose-500',
  warning: 'from-amber-400 to-orange-500',
  info: 'from-blue-400 to-cyan-500',
};

export function AlertDialogCustom({
  open,
  onOpenChange,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Annuler',
  onConfirm,
  showCancel = false,
}: AlertDialogCustomProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-slate-900/98 backdrop-blur-xl border-white/10">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">{iconMap[type]}</div>
          <AlertDialogTitle className={`text-2xl text-center bg-gradient-to-r ${colorMap[type]} bg-clip-text text-transparent`}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-center text-gray-300">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {showCancel && (
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 text-white border-white/20">
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            className={`bg-gradient-to-r ${colorMap[type]} hover:opacity-90 text-white font-semibold`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
