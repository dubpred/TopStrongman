import React from 'react';
import { Trophy, Award, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'all', label: 'ALL RANKINGS', icon: Award },
    { id: 'shows', label: 'SHOWS & TIERS', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080808]/98 backdrop-blur-md border-b-2 border-[#262626] shadow-2xl pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Title (Rogue Industrial Style) */}
          <div className="cursor-pointer py-2 active:scale-95 transition-transform" onClick={() => setActiveTab('all')}>
            <div className="font-display text-3xl sm:text-4xl md:text-5xl tracking-widest font-black uppercase leading-none flex items-center gap-2">
              <span className="text-white">TOP</span>
              <span className="bg-white text-black px-2 py-0.5 font-black text-2xl sm:text-3xl md:text-4xl">STRONGMAN</span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 font-display text-lg font-bold tracking-wider transition-all rounded-none uppercase ${
                    isActive
                      ? 'bg-white text-black font-black shadow-rogue-white border-2 border-white'
                      : 'text-zinc-400 hover:text-white bg-[#121212] border-2 border-[#262626] hover:border-zinc-500'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Mobile Tab Navigation (Pixel, iPhone optimized) */}
        <div className="md:hidden flex space-x-2 py-2 overflow-x-auto border-t border-[#262626] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-h-[44px] flex items-center justify-center space-x-2 py-2 px-4 text-sm font-display font-black tracking-wider whitespace-nowrap rounded-none active:scale-95 transition-all uppercase ${
                  isActive ? 'bg-white text-black font-black border-2 border-white' : 'text-zinc-400 bg-[#121212] border-2 border-[#262626]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
