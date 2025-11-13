import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export function Logo({ className = '', withText = true }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-2 group ${className}`}
      aria-label="Edgemy - Retour à l'accueil"
    >
      {/* Logo E stylisé */}
      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
        <span className="text-slate-950 font-bold text-xl">E</span>
      </div>
      
      {/* Texte du logo */}
      {withText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Edgemy
        </span>
      )}
    </Link>
  );
}
