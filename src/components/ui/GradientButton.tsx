import { ButtonHTMLAttributes, forwardRef } from 'react';
import { designTokens } from '@/styles/design-tokens';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'amber' | 'emerald' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ variant = 'amber', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseClasses = 'font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
    
    const variantClasses = {
      amber: `bg-gradient-to-r ${designTokens.gradients.amber} hover:${designTokens.gradients.amberHover} text-slate-950 ${designTokens.effects.shadow.amber}`,
      emerald: `bg-gradient-to-r ${designTokens.gradients.emerald} hover:${designTokens.gradients.emeraldHover} text-white ${designTokens.effects.shadow.emerald}`,
      ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 backdrop-blur-sm',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
