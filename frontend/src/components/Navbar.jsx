import React from 'react';
import { Trophy, Award, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'all', label: 'All Rankings', icon: Award },
    { id: 'shows', label: 'Shows & Tiers', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080D08]/95 backdrop-blur-md border-b border-dew-green/20 shadow-lg pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Title */}
          <div className="cursor-pointer py-2 active:scale-95 transition-transform" onClick={() => setActiveTab('all')}>
            <div className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider font-extrabold uppercase leading-none flex items-center gap-2">
              <span className="text-dew-green">TOP</span>
              <span className="text-dew-red">STRONGMAN</span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-dew-green text-black shadow-dew-glow font-bold scale-105'
                      : 'text-gray-300 hover:text-dew-green hover:bg-dew-card'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-dew-green'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Mobile Tab Navigation (Pixel, iPhone optimized) */}
        <div className="md:hidden flex space-x-2 py-2 overflow-x-auto border-t border-dew-green/10 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-h-[42px] flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-xs font-heading font-bold whitespace-nowrap active:scale-95 transition-all ${
                  isActive ? 'bg-dew-green text-black font-extrabold shadow-dew-glow' : 'text-gray-300 bg-dew-card border border-dew-green/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-dew-green'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
