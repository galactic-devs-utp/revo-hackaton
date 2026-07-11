import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { id: 'store', label: 'Tienda', icon: 'storefront' },
    { id: 'cart', label: 'Carrito', icon: 'shopping_cart' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface shadow-[0_-4px_16px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden border-t border-outline-variant/30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        if (tab.id === 'cart') {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5 scale-100 shadow-sm transition-all duration-150 ${
                isActive ? 'ring-2 ring-secondary' : ''
              }`}
            >
              <span 
                className="material-symbols-outlined mb-0.5 text-[24px] notranslate"
                translate="no"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {tab.icon}
              </span>
              <span className="font-label-sm text-[11px] font-bold">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 w-16 ${
              isActive 
                ? 'text-primary font-semibold' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined mb-1 text-[24px] notranslate" translate="no">{tab.icon}</span>
            <span className="font-label-sm text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
