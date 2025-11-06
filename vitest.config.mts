import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Configuration des alias pour les imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Configuration spécifique pour les tests
  test: {
    // Utiliser le fichier de configuration TypeScript pour les tests
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    
    // Environnement de test (simulation de navigateur)
    environment: 'happy-dom',
    
    // Fichiers de setup
    setupFiles: ['./tests/setup.ts'],
    
    // Activer les variables globales (describe, it, expect, etc.)
    globals: true,
    
    // Configuration MSW
    server: {
      deps: {
        // Activer l'inline deps pour MSW
        inline: ['msw', '@mswjs/interceptors'],
      },
    },
    
    // Configuration de la couverture de code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/dist/**',
        '**/.next/**',
      ],
    },
    
    // Inclure ces fichiers de test
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
});
