/**
 * Design Tokens - Edgemy
 * Centralise toutes les valeurs de design pour garantir la cohérence
 */

export const designTokens = {
  // Couleurs principales
  colors: {
    primary: {
      amber: {
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
      },
      emerald: {
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
      },
    },
    background: {
      dark: {
        900: '#0f172a', // slate-900
        950: '#020617', // slate-950
      },
    },
    text: {
      white: '#ffffff',
      gray: {
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
      },
    },
  },

  // Gradients
  gradients: {
    amber: 'from-amber-500 to-amber-600',
    amberHover: 'from-amber-600 to-amber-700',
    emerald: 'from-emerald-500 to-teal-600',
    emeraldHover: 'from-emerald-600 to-teal-700',
    text: {
      white: 'from-white to-gray-300',
      amber: 'from-amber-400 to-amber-600',
      emerald: 'from-amber-400 via-amber-500 to-emerald-400',
    },
  },

  // Espacements
  spacing: {
    section: 'py-24',
    container: 'container mx-auto px-6',
  },

  // Bordures et effets
  effects: {
    glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
    glassHover: 'hover:bg-white/10 hover:border-white/20',
    cardBorder: 'border border-white/5',
    cardBorderHover: 'hover:border-white/10',
    shadow: {
      amber: 'shadow-2xl shadow-amber-500/25',
      emerald: 'shadow-2xl shadow-emerald-500/25',
    },
  },

  // Typographie
  typography: {
    title: {
      xl: 'text-4xl md:text-6xl font-bold',
      lg: 'text-4xl md:text-5xl font-bold',
      md: 'text-3xl md:text-4xl font-bold',
      sm: 'text-2xl md:text-3xl font-bold',
    },
    subtitle: 'text-xl md:text-2xl text-gray-400',
    body: 'text-base text-gray-400',
  },

  // Animations
  transitions: {
    default: 'transition-all duration-300',
    fast: 'transition-all duration-150',
    slow: 'transition-all duration-500',
    scale: 'transform hover:scale-105 transition-all',
  },

  // Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
} as const;
