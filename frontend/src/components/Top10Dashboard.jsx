import React from 'react';
import { Crown, Trophy, Medal, Flame, Zap, ArrowRight, Activity, ChevronRight } from 'lucide-react';

export default function Top10Dashboard({ rankings, onSelectCompetitor, formula }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-dew-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-dew-green font-mono">Calculating Global Strongman Rankings...</p>
      </div>
    );
  }

  const first = rankings[0];
  const second = rankings[1];
  const third = rankings[2];
  const rest = rankings.slice(3, 10);

  return (
    <div className="space-y-12">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C160C] via-[#152415] to-[#0C160C] border border-dew-green/30 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-dew-green/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-dew-red/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dew-green/10 border border-dew-green/30 text-dew-green text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-dew-red fill-dew-red animate-bounce" />
            <span>36-Month Active World Rankings • Curve: {formula}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-none">
            TOP 10 CURRENT <span className="dew-gradient-text">STRONGMEN</span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            The ultimate global strongman rankings calculated using <strong className="text-dew-green font-mono">5-Tier show multipliers</strong> (5x, 3x, 2x, 1x, 0.25x), 
            a <strong className="text-dew-yellow font-mono">36-month steep recency decay</strong>, and <strong className="text-dew-green font-mono">diminishing marginal top-result weights</strong>.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs text-gray-400">
            <div className="flex items-center space-x-2 bg-[#080D08] px-3 py-1.5 rounded-lg border border-dew-green/20">
              <span className="w-2.5 h-2.5 rounded-full bg-dew-green"></span>
              <span>Tier 1: WSM, ASC, Rogue, SMOE (5x)</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#080D08] px-3 py-1.5 rounded-lg border border-dew-yellow/20">
              <span className="w-2.5 h-2.5 rounded-full bg-dew-yellow"></span>
              <span>Tier 2: Giants Live & World Series (3x)</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#080D08] px-3 py-1.5 rounded-lg border border-blue-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>36-Month Steep Recency Decay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Section (1st, 2nd, 3rd) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Crown className="w-7 h-7 text-dew-yellow fill-dew-yellow" />
            <span>THE PODIUM OF TITANS</span>
          </h2>
          <span className="text-xs font-mono text-gray-400">CLICK ANY ATHLETE FOR SCORE BREAKDOWN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          {/* 2nd Place */}
          {second && (
            <div 
              onClick={() => onSelectCompetitor(second)}
              className="order-2 md:order-1 dew-podium-2 rounded-3xl p-6 cursor-pointer transform hover:-translate-y-2 transition-all duration-300 relative group"
            >
              <div className="absolute top-4 right-4 bg-dew-yellow text-black font-display text-2xl font-black rounded-xl px-3 py-1 shadow-yellow-glow">
                #2
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-dew-yellow shadow-lg bg-[#1a1f0a] flex items-center justify-center">
                  <span className="font-display text-4xl font-black text-dew-yellow">#2</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white group-hover:text-dew-yellow transition-colors">
                    {second.competitor.name}
                  </h3>
                </div>
                <div className="bg-[#080D08]/90 rounded-2xl p-3 w-full border border-dew-yellow/30 space-y-1">
                  <div className="text-xs text-gray-400 font-mono">TOTAL RANK POINTS</div>
                  <div className="font-display text-3xl font-black text-dew-yellow">{second.totalPoints.toFixed(1)} <span className="text-xs text-gray-400">PTS</span></div>
                </div>
                <div className="flex justify-between w-full text-xs font-mono text-gray-300 pt-2 border-t border-dew-yellow/20">
                  <span>{second.winsCount} WINS</span>
                  <span>{second.podiumsCount} PODIUMS</span>
                  <span>{second.totalShows} SHOWS</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place (Center / Main Hero) */}
          {first && (
            <div 
              onClick={() => onSelectCompetitor(first)}
              className="order-1 md:order-2 dew-podium-1 rounded-3xl p-8 cursor-pointer transform hover:-translate-y-3 transition-all duration-300 relative group md:-mt-6"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-dew-green text-black px-4 py-1 rounded-full font-mono text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-dew-glow">
                <Crown className="w-4 h-4 fill-black" /> WORLD NUMBER 1
              </div>
              <div className="absolute top-4 right-4 bg-dew-green text-black font-display text-3xl font-black rounded-xl px-3 py-1 shadow-dew-glow">
                #1
              </div>
              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-dew-green shadow-dew-glow bg-[#142214] flex items-center justify-center">
                  <span className="font-display text-5xl font-black text-dew-green">#1</span>
                </div>
                <div>
                  <h3 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white group-hover:text-dew-green transition-colors">
                    {first.competitor.name}
                  </h3>
                </div>
                <div className="bg-[#080D08] rounded-2xl p-4 w-full border border-dew-green/40 space-y-1 shadow-dew-glow">
                  <div className="text-xs text-dew-green font-mono font-bold tracking-wider">GLOBAL WORLD SCORE</div>
                  <div className="font-display text-4xl font-black text-white">{first.totalPoints.toFixed(1)} <span className="text-sm text-dew-green">PTS</span></div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-gray-200 pt-2 border-t border-dew-green/30">
                  <span>{first.winsCount} WINS</span>
                  <span>•</span>
                  <span>{first.podiumsCount} PODIUMS</span>
                  <span>•</span>
                  <span>{first.totalShows} SHOWS</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div 
              onClick={() => onSelectCompetitor(third)}
              className="order-3 dew-podium-3 rounded-3xl p-6 cursor-pointer transform hover:-translate-y-2 transition-all duration-300 relative group"
            >
              <div className="absolute top-4 right-4 bg-dew-red text-white font-display text-2xl font-black rounded-xl px-3 py-1 shadow-red-glow">
                #3
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-dew-red shadow-lg bg-[#1a0a0a] flex items-center justify-center">
                  <span className="font-display text-4xl font-black text-dew-red">#3</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white group-hover:text-dew-red transition-colors">
                    {third.competitor.name}
                  </h3>
                </div>
                <div className="bg-[#080D08]/90 rounded-2xl p-3 w-full border border-dew-red/30 space-y-1">
                  <div className="text-xs text-gray-400 font-mono">TOTAL RANK POINTS</div>
                  <div className="font-display text-3xl font-black text-dew-red">{third.totalPoints.toFixed(1)} <span className="text-xs text-gray-400">PTS</span></div>
                </div>
                <div className="flex justify-between w-full text-xs font-mono text-gray-300 pt-2 border-t border-dew-red/20">
                  <span>{third.winsCount} WINS</span>
                  <span>{third.podiumsCount} PODIUMS</span>
                  <span>{third.totalShows} SHOWS</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Ranks 4 to 10 Leaderboard List */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <Trophy className="w-6 h-6 text-dew-green" />
            <span>WORLD RANKINGS #4 THROUGH #10</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {rest.map((item) => (
            <div
              key={item.competitor.id}
              onClick={() => onSelectCompetitor(item)}
              className="dew-glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-dew-card transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="font-display text-2xl font-black text-dew-green w-8 text-center">
                  #{item.globalRank}
                </div>
                <div className="w-12 h-12 rounded-xl border border-dew-green/30 bg-[#0D140D] flex items-center justify-center font-display text-lg font-black text-dew-green shrink-0">
                  #{item.globalRank}
                </div>
                <div>
                  <h4 className="font-display text-xl font-bold text-white group-hover:text-dew-green transition-colors">
                    {item.competitor.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="hidden sm:flex space-x-4 text-xs font-mono text-gray-400">
                  <span>Wins: <strong className="text-dew-green">{item.winsCount}</strong></span>
                  <span>Podiums: <strong className="text-dew-yellow">{item.podiumsCount}</strong></span>
                  <span>Shows: <strong className="text-white">{item.totalShows}</strong></span>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-extrabold text-dew-green">
                    {item.totalPoints.toFixed(1)} <span className="text-xs font-mono text-gray-400">PTS</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-dew-green group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
