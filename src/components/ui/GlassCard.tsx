import { HTMLAttributes, ReactNode } from 'react';
import { designTokens } from '@/styles/design-tokens';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ 
  children, 
  hover = true, 
  padding = 'md', 
  className = '', 
  ...props 
}: GlassCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? designTokens.effects.cardBorderHover : '';

  return (
    <div
      className={`${designTokens.effects.glass} ${designTokens.radius.lg} ${paddingClasses[padding]} ${designTokens.transitions.default} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
