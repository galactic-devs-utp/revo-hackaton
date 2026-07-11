import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-outline-variant drop-shadow-sm">
      <button 
        aria-label="Menú" 
        className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 active:scale-95 transition-transform flex items-center justify-center"
      >
        <span className="material-symbols-outlined font-headline-md text-headline-md">recycling</span>
      </button>
      <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">RevoLink</h1>
      <button 
        aria-label="Notificaciones" 
        className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 active:scale-95 transition-transform flex items-center justify-center"
      >
        <span className="material-symbols-outlined font-headline-md text-headline-md">notifications</span>
      </button>
    </header>
  );
};
