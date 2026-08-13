import React from 'react';
import { Activity, ArrowUp } from 'lucide-react';

export default function CompetitorModal({ athlete, onClose }) {
  if (!athlete) return null;

  const { competitor, globalRank, totalPoints, winsCount, podiumsCount, totalShows, contributions } = athlete;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full sm:h-auto max-w-4xl sm:max-h-[90vh] flex flex-col bg-[#0E0E0E] border-0 sm:border-2 border-[#333333] rounded-none shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header White Accent Line */}
        <div className="h-1.5 w-full bg-white shrink-0"></div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#262626] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 truncate pr-2">
            <span className="bg-white text-black font-display text-lg sm:text-xl font-black px-2.5 py-0.5 shrink-0 rounded-none shadow-rogue-white">
              #{globalRank}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wider truncate">
              {competitor.name} <span className="text-xs font-mono text-zinc-400 font-normal">({competitor.country})</span>
            </h3>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-[#141414] border-2 border-[#262626] rounded-none">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-mono text-white font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                <span>{competitor.flagEmoji || '🌐'}</span>
                <span>{competitor.country}</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wider">
                {competitor.name}
              </h2>
            </div>

            {/* Total Points Card */}
            <div className="bg-[#080808] border-2 border-white px-6 py-3.5 text-center min-w-[160px] w-full sm:w-auto shadow-rogue-white rounded-none">
              <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">TOTAL SCORE</div>
              <div className="font-display text-4xl sm:text-5xl font-black text-white">{totalPoints.toFixed(1)}</div>
            </div>
          </div>

          {/* Quick Stats Summary Strip */}
          <div className="grid grid-cols-3 divide-x-2 divide-[#262626] bg-[#141414] border-2 border-[#262626] text-center py-4 rounded-none">
            <div className="px-1">
              <div className="font-display text-3xl font-black text-white">{winsCount}</div>
              <div className="text-[10px] sm:text-xs font-mono text-zinc-400 font-bold uppercase">TITLES WON</div>
            </div>
            <div className="px-1">
              <div className="font-display text-3xl font-black text-zinc-300">{podiumsCount}</div>
              <div className="text-[10px] sm:text-xs font-mono text-zinc-400 font-bold uppercase">PODIUMS</div>
            </div>
            <div className="px-1">
              <div className="font-display text-3xl font-black text-zinc-400">{totalShows}</div>
              <div className="text-[10px] sm:text-xs font-mono text-zinc-400 font-bold uppercase">SHOWS</div>
            </div>
          </div>

          {/* Competition Breakdown */}
          <div className="space-y-3">
            <h4 className="font-display text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-white shrink-0" />
              <span>5-YEAR COMPETITION SCORE CONTRIBUTION</span>
            </h4>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-3">
              {contributions && contributions.map((c, idx) => (
                <div 
                  key={idx} 
                  className={`bg-[#141414] border-2 ${idx === 0 ? 'border-white' : 'border-[#262626]'} p-4 space-y-2 rounded-none`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-black text-white text-lg uppercase tracking-wide">
                        {idx === 0 && <span className="mr-1 text-white">⭐</span>}
                        {c.competitionName}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>YEAR: {c.year}</span>
                        <span>•</span>
                        <span className="text-white font-bold">RANK: #{c.rank}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-3xl font-black text-white">+{c.finalPoints.toFixed(1)}</div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase">PTS</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-[#262626] text-center font-mono text-xs">
                    <div className="bg-[#080808] p-1.5 border border-[#333]">
                      <div className="text-[9px] text-zinc-400 uppercase">Difficulty</div>
                      <div className="text-white font-bold">{c.difficulty !== undefined ? c.difficulty.toFixed(1) : 0}</div>
                    </div>
                    <div className="bg-[#080808] p-1.5 border border-[#333]">
                      <div className="text-[9px] text-zinc-400 uppercase">Placement %</div>
                      <div className="text-zinc-200 font-bold">{c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(0)}%` : '100%'}</div>
                    </div>
                    <div className="bg-[#080808] p-1.5 border border-[#333]">
                      <div className="text-[9px] text-zinc-400 uppercase">Recency</div>
                      <div className="text-white font-bold">{c.recencyMultiplier}x</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Rogue Industrial Table) */}
            <div className="hidden md:block bg-[#141414] overflow-hidden border-2 border-[#262626] rounded-none shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#1C1C1C] border-b-2 border-[#262626] text-zinc-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">SHOW</th>
                      <th className="py-3.5 px-4 text-center">YEAR</th>
                      <th className="py-3.5 px-4 text-center">RANK</th>
                      <th className="py-3.5 px-4 text-center">DIFFICULTY</th>
                      <th className="py-3.5 px-4 text-center">PLACEMENT %</th>
                      <th className="py-3.5 px-4 text-center">RECENCY ×</th>
                      <th className="py-3.5 px-4 text-right">FINAL SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {contributions && contributions.map((c, idx) => (
                      <tr key={idx} className={`hover:bg-[#1C1C1C] transition-colors ${idx === 0 ? 'bg-white/5' : ''}`}>
                        <td className="py-3.5 px-4 font-bold text-white uppercase">
                          {idx === 0 && <span className="mr-1.5 text-white">⭐</span>}
                          {c.competitionName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-zinc-400 font-bold">
                          {c.year}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">#{c.rank}</td>
                        <td className="py-3.5 px-4 text-center text-white font-bold font-mono">
                          {c.difficulty !== undefined ? c.difficulty.toFixed(1) : (c.basePoints || 0)} <span className="text-[10px] text-zinc-500">/ 1000</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-zinc-200 font-bold font-mono">
                          {c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(1)}%` : `${c.tierMultiplier}x`}
                        </td>
                        <td className="py-3.5 px-4 text-center text-white font-bold">{c.recencyMultiplier}x</td>
                        <td className="py-3.5 px-4 text-right font-display text-2xl font-black text-white">+{c.finalPoints.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="bg-[#0E0E0E] border-t-2 border-[#262626] px-4 sm:px-6 py-3.5 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              const modalBody = document.querySelector('.overflow-y-auto');
              if (modalBody) modalBody.scrollTop = 0;
            }}
            className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors py-1 uppercase font-bold"
          >
            <ArrowUp className="w-4 h-4" />
            <span>TOP</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-display text-lg font-black tracking-wider hover:bg-zinc-200 transition-all rounded-none uppercase shadow-rogue-white active:scale-95"
          >
            CLOSE ATHLETE PROFILE
          </button>
        </div>

      </div>
    </div>
  );
}
