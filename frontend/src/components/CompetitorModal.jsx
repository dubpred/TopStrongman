import React from 'react';
import { Activity, ArrowUp } from 'lucide-react';

export default function CompetitorModal({ athlete, onClose }) {
  if (!athlete) return null;

  const { competitor, globalRank, totalPoints, winsCount, podiumsCount, totalShows, contributions } = athlete;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full sm:h-auto max-w-4xl sm:max-h-[90vh] flex flex-col bg-white border-0 sm:border border-[#D5E2D9] rounded-none sm:rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Pine Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1B4D3E] via-[#2D6A4F] to-[#40916C] shrink-0"></div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D5E2D9] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 truncate pr-2">
            <span className="bg-dew-green text-white font-display text-sm sm:text-base font-black rounded-md px-2 py-0.5 shrink-0">
              #{globalRank}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-[#0F291E] tracking-wide truncate">
              {competitor.name} <span className="text-xs font-mono text-gray-500 font-normal">({competitor.country})</span>
            </h3>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-lg bg-[#EBF2EE] border border-[#D5E2D9]">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-mono text-dew-green font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                <span>{competitor.flagEmoji || '🌐'}</span>
                <span>{competitor.country}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-[#0F291E] tracking-wide">
                {competitor.name}
              </h2>
            </div>

            {/* Total Points Card */}
            <div className="bg-white border border-[#D5E2D9] rounded-lg px-6 py-3.5 text-center min-w-[150px] w-full sm:w-auto shadow-sm">
              <div className="text-[10px] font-mono text-dew-green font-bold uppercase tracking-wider">TOTAL SCORE</div>
              <div className="font-display text-3xl sm:text-4xl font-black text-[#0F291E]">{totalPoints.toFixed(1)}</div>
            </div>
          </div>

          {/* Quick Stats Summary Strip */}
          <div className="grid grid-cols-3 divide-x divide-[#D5E2D9] bg-[#F1F5F2] rounded-lg border border-[#D5E2D9] text-center py-3.5">
            <div className="px-1">
              <div className="font-display text-xl sm:text-2xl font-black text-dew-green">{winsCount}</div>
              <div className="text-[10px] sm:text-xs font-mono text-gray-500">TITLES WON</div>
            </div>
            <div className="px-1">
              <div className="font-display text-xl sm:text-2xl font-black text-[#2D6A4F]">{podiumsCount}</div>
              <div className="text-[10px] sm:text-xs font-mono text-gray-500 font-bold">PODIUMS</div>
            </div>
            <div className="px-1">
              <div className="font-display text-xl sm:text-2xl font-black text-[#0F291E]">{totalShows}</div>
              <div className="text-[10px] sm:text-xs font-mono text-gray-500">SHOWS</div>
            </div>
          </div>

          {/* Competition Breakdown */}
          <div className="space-y-3">
            <h4 className="font-display text-xl sm:text-2xl font-bold uppercase text-[#0F291E] flex items-center gap-2">
              <Activity className="w-5 h-5 text-dew-green shrink-0" />
              <span>5-YEAR COMPETITION SCORE CONTRIBUTION</span>
            </h4>

            {/* Mobile Card List View (Visible on small screens) */}
            <div className="block md:hidden space-y-3">
              {contributions && contributions.map((c, idx) => (
                <div 
                  key={idx} 
                  className={`bg-[#F1F5F2] border ${idx === 0 ? 'border-dew-green/60 bg-[#EBF2EE]' : 'border-[#D5E2D9]'} rounded-lg p-4 space-y-2`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-[#0F291E] text-base leading-snug">
                        {idx === 0 && <span className="mr-1 text-dew-green">⭐</span>}
                        {c.competitionName}
                      </div>
                      <div className="text-xs font-mono text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>Year: {c.year}</span>
                        <span>•</span>
                        <span className="text-dew-green font-bold">Place: #{c.rank}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-2xl font-black text-dew-green">+{c.finalPoints.toFixed(1)}</div>
                      <div className="text-[10px] font-mono text-gray-500">POINTS</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D5E2D9]/60 text-center font-mono text-xs">
                    <div className="bg-white rounded-md p-1.5 border border-[#D5E2D9]">
                      <div className="text-[9px] text-gray-500 uppercase">Difficulty</div>
                      <div className="text-[#2D6A4F] font-bold">{c.difficulty !== undefined ? c.difficulty.toFixed(1) : 0}</div>
                    </div>
                    <div className="bg-white rounded-md p-1.5 border border-[#D5E2D9]">
                      <div className="text-[9px] text-gray-500 uppercase">Placement %</div>
                      <div className="text-dew-green font-bold">{c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(0)}%` : '100%'}</div>
                    </div>
                    <div className="bg-white rounded-md p-1.5 border border-[#D5E2D9]">
                      <div className="text-[9px] text-gray-500 uppercase">Recency</div>
                      <div className="text-dew-green font-bold">{c.recencyMultiplier}x</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Visible on medium+ screens) */}
            <div className="hidden md:block bg-white overflow-hidden border border-[#D5E2D9] rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#EBF2EE] border-b border-[#D5E2D9] text-gray-600 uppercase">
                      <th className="py-3 px-4">SHOW</th>
                      <th className="py-3 px-4 text-center">YEAR</th>
                      <th className="py-3 px-4 text-center">RANK</th>
                      <th className="py-3 px-4 text-center">SHOW DIFFICULTY</th>
                      <th className="py-3 px-4 text-center">PLACEMENT WEIGHT</th>
                      <th className="py-3 px-4 text-center">RECENCY ×</th>
                      <th className="py-3 px-4 text-right">FINAL SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5E2D9]/60">
                    {contributions && contributions.map((c, idx) => (
                      <tr key={idx} className={`hover:bg-[#F0F5F2] transition-colors ${idx === 0 ? 'bg-[#EBF2EE]/50' : ''}`}>
                        <td className="py-3.5 px-4 font-bold text-[#0F291E]">
                          {idx === 0 && <span className="mr-1.5 text-dew-green">⭐</span>}
                          {c.competitionName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-gray-500 font-bold">
                          {c.year}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#0F291E]">#{c.rank}</td>
                        <td className="py-3.5 px-4 text-center text-[#2D6A4F] font-bold font-mono">
                          {c.difficulty !== undefined ? c.difficulty.toFixed(1) : (c.basePoints || 0)} <span className="text-[10px] text-gray-400">/ 1000</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-dew-green font-bold font-mono">
                          {c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(1)}%` : `${c.tierMultiplier}x`}
                        </td>
                        <td className="py-3.5 px-4 text-center text-dew-green font-bold">{c.recencyMultiplier}x</td>
                        <td className="py-3.5 px-4 text-right font-display text-lg font-black text-dew-green">+{c.finalPoints.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="bg-[#F1F5F2] border-t border-[#D5E2D9] px-4 sm:px-6 py-3 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              const modalBody = document.querySelector('.overflow-y-auto');
              if (modalBody) modalBody.scrollTop = 0;
            }}
            className="flex items-center space-x-1.5 text-xs font-mono text-gray-600 hover:text-dew-green transition-colors py-1"
          >
            <ArrowUp className="w-4 h-4" />
            <span>TOP</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-dew-green text-white font-heading font-bold text-xs hover:bg-[#2D6A4F] transition-all shadow-sm active:scale-95"
          >
            CLOSE ATHLETE PROFILE
          </button>
        </div>

      </div>
    </div>
  );
}
