import { HTMLAttributes, ReactNode } from 'react';
import { designTokens } from '@/styles/design-tokens';

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'white' | 'amber' | 'emerald';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export function GradientText({ 
  children, 
  variant = 'white', 
  as: Component = 'span',
  className = '', 
  ...props 
}: GradientTextProps) {
  const gradientClasses = {
    white: `bg-gradient-to-r ${designTokens.gradients.text.white}`,
    amber: `bg-gradient-to-r ${designTokens.gradients.text.amber}`,
    emerald: `bg-gradient-to-r ${designTokens.gradients.text.emerald}`,
  };

  return (
    <Component
      className={`${gradientClasses[variant]} bg-clip-text text-transparent ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
