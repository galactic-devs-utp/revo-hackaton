import React from 'react';

interface HeaderProps {
  onLogout?: () => void;
  userRole?: 'user' | 'admin' | null;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, userRole }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-outline-variant drop-shadow-sm">
      <div className="flex items-center gap-2">
        <button 
          aria-label="Menú" 
          className="text-[#123524] hover:bg-slate-100 rounded-full p-2 active:scale-95 transition-transform flex items-center justify-center"
        >
          <span className="material-symbols-outlined font-headline-md text-headline-md notranslate" translate="no">recycling</span>
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-[#123524] tracking-tight">RevoLink</h1>
        {userRole && (
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
            userRole === 'admin' ? 'bg-[#9EB93A] text-[#123524]' : 'bg-[#E4F5E7] text-[#123524]'
          }`}>
            {userRole === 'admin' ? 'Admin' : 'Cliente'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {onLogout && (
          <button 
            onClick={onLogout}
            title="Cerrar Sesión" 
            className="text-red-600 hover:bg-red-50 rounded-full p-2 active:scale-95 transition-transform flex items-center justify-center"
          >
            <span className="material-symbols-outlined font-headline-md text-headline-md notranslate" translate="no">logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
