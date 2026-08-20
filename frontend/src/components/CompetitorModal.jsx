import React from 'react';
import { Activity, ArrowUp, Trophy, Award, Calendar } from 'lucide-react';

export default function CompetitorModal({ athlete, onClose, onSelectCompetition }) {
  if (!athlete) return null;

  const competitorName = athlete.competitor?.name || athlete.name || '';
  const competitorCountry = athlete.competitor?.country || athlete.country || 'N/A';
  const globalRank = athlete.globalRank || athlete.rank || '-';
  const totalPoints = typeof athlete.totalPoints === 'number' ? athlete.totalPoints : (athlete.goatScore || 0);
  const winsCount = athlete.winsCount ?? athlete.totalWins ?? 0;
  const podiumsCount = athlete.podiumsCount ?? athlete.totalPodiums ?? 0;
  const totalShows = athlete.totalShows ?? 0;
  const isAllTime = athlete.isAllTime || false;

  const contributions = athlete.contributions || (athlete.topShows ? athlete.topShows.map(s => ({
    competitionName: s.contest,
    year: s.year,
    rank: s.rank,
    difficulty: s.difficulty,
    placementFactor: Math.exp(-0.25 * (s.rank - 1)),
    recencyMultiplier: 1.0,
    basePoints: s.basePlacementPts || s.points,
    bonus: s.bonus || 0,
    finalPoints: s.points,
  })) : []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full sm:h-auto max-w-4xl sm:max-h-[90vh] flex flex-col bg-[#0E0E0E] border-0 sm:border-2 border-[#333333] rounded-none overflow-hidden my-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Accent Line */}
        <div className={`h-1.5 w-full shrink-0 ${isAllTime ? 'bg-yellow-500' : 'bg-white'}`}></div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#262626] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 truncate pr-2">
            <span className={`font-display text-lg sm:text-xl font-black px-2.5 py-0.5 shrink-0 rounded-none ${
              isAllTime ? 'bg-yellow-500 text-black' : 'bg-white text-black'
            }`}>
              #{globalRank}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wider truncate">
              {competitorName} <span className="text-xs font-mono text-zinc-400 font-normal">({competitorCountry})</span>
            </h3>
          </div>
          {isAllTime && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-950/80 border border-yellow-700/80 text-yellow-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Trophy className="w-3.5 h-3.5" /> ALL-TIME LEGEND
            </span>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-[#141414] border-2 border-[#262626] rounded-none">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                <span>{competitorCountry}</span>
                {isAllTime && <span>• {athlete.era || 'HISTORICAL'}</span>}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wider">
                {competitorName}
              </h2>
              {isAllTime && athlete.activeYears && (
                <div className="text-xs font-mono text-zinc-500 flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Career Span: {athlete.activeYears}
                </div>
              )}
            </div>

            {/* Total Points Card */}
            <div className={`bg-[#080808] border-2 px-6 py-3.5 text-center min-w-[160px] w-full sm:w-auto rounded-none ${
              isAllTime ? 'border-yellow-500' : 'border-white'
            }`}>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                isAllTime ? 'text-yellow-500' : 'text-zinc-400'
              }`}>
                {isAllTime ? 'GOAT SCORE' : 'TOTAL SCORE'}
              </div>
              <div className={`font-display text-4xl sm:text-5xl font-black ${
                isAllTime ? 'text-yellow-400' : 'text-white'
              }`}>
                {Number(totalPoints).toFixed(1)}
              </div>
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
              <span>{isAllTime ? `TOP ${contributions.length} CAREER SHOWS EVALUATED` : '5-YEAR COMPETITION SCORE CONTRIBUTION'}</span>
            </h4>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-3">
              {contributions && contributions.map((c, idx) => (
                <div                  key={idx}
                  onClick={() => onSelectCompetition && onSelectCompetition(c.competitionName, isAllTime)}
                  className={`bg-[#141414] border-2 ${idx === 0 ? 'border-white' : 'border-[#262626]'} p-4 space-y-2 rounded-none cursor-pointer hover:border-red-500 transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-black text-white text-lg uppercase tracking-wide hover:text-red-400 flex items-center flex-wrap gap-1.5">
                        {idx === 0 && <span className="text-xs font-mono font-bold text-white bg-white/10 px-1.5 py-0.5">[BEST]</span>}
                        <span>{c.competitionName}</span>
                        {c.bonus > 0 && (
                          <span className="px-1.5 py-0.5 bg-yellow-950/80 border border-yellow-700 text-yellow-400 font-mono text-[10px] font-bold shrink-0">
                            👑 +1,000 MAJOR WIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>YEAR: {c.year}</span>
                        <span>•</span>
                        <span className="text-white font-bold">RANK: #{c.rank}</span>
                        <span>•</span>
                        <span className="text-red-400 text-[10px]">VIEW MATH ➔</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-3xl font-black text-white">
                        +{Number(c.finalPoints || 0).toFixed(1)}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase">PTS</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t-2 border-[#262626] text-center font-mono text-xs">
                    <div className="bg-[#080808] p-1.5 border border-[#333]">
                      <div className="text-[9px] text-zinc-400 uppercase">Difficulty</div>
                      <div className="text-white font-bold">{c.difficulty !== undefined ? Number(c.difficulty).toFixed(1) : 0}</div>
                    </div>
                    <div className="bg-[#080808] p-1.5 border border-[#333]">
                      <div className="text-[9px] text-zinc-400 uppercase">{isAllTime ? 'Placement %' : 'Placement %'}</div>
                      <div className="text-zinc-200 font-bold">
                        {c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(0)}%` : '100%'}
                      </div>
                    </div>
                    {!isAllTime && (
                      <div className="bg-[#080808] p-1.5 border border-[#333]">
                        <div className="text-[9px] text-zinc-400 uppercase">Recency</div>
                        <div className="text-white font-bold">{`${c.recencyMultiplier}x`}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#141414] overflow-hidden border-2 border-[#262626] rounded-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#1C1C1C] border-b-2 border-[#262626] text-zinc-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">SHOW</th>
                      <th className="py-3.5 px-4 text-center">YEAR</th>
                      <th className="py-3.5 px-4 text-center">RANK</th>
                      <th className="py-3.5 px-4 text-center">DIFFICULTY</th>
                      <th className="py-3.5 px-4 text-center">PLACEMENT %</th>
                      {!isAllTime && <th className="py-3.5 px-4 text-center">RECENCY ×</th>}
                      <th className="py-3.5 px-4 text-right">FINAL SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {contributions && contributions.map((c, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => onSelectCompetition && onSelectCompetition(c.competitionName, isAllTime)}
                        className={`hover:bg-[#1C1C1C] transition-colors cursor-pointer group ${idx === 0 ? 'bg-white/5' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-bold text-white uppercase group-hover:text-red-400">
                          <div className="flex items-center flex-wrap gap-1.5">
                            {idx === 0 && <span className="text-xs font-mono font-bold text-white bg-white/10 px-1.5 py-0.5">[BEST]</span>}
                            <span>{c.competitionName}</span>
                            {c.bonus > 0 && (
                              <span className="px-1.5 py-0.5 bg-yellow-950/80 border border-yellow-700 text-yellow-400 font-mono text-[10px] font-bold shrink-0">
                                👑 +1,000 MAJOR WIN
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500 font-mono group-hover:text-red-400">➔</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-zinc-400 font-bold">
                          {c.year}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">#{c.rank}</td>
                        <td className="py-3.5 px-4 text-center text-white font-bold font-mono">
                          {c.difficulty !== undefined ? Number(c.difficulty).toFixed(1) : (c.basePoints || 0)} <span className="text-[10px] text-zinc-500">/ 1000</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-zinc-200 font-bold font-mono">
                          {c.placementFactor !== undefined ? `${(c.placementFactor * 100).toFixed(1)}%` : `${c.tierMultiplier}x`}
                        </td>
                        {!isAllTime && (
                          <td className="py-3.5 px-4 text-center text-white font-bold font-mono">
                            {c.recencyMultiplier !== undefined ? `${c.recencyMultiplier}x` : '1x'}
                          </td>
                        )}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-display text-2xl font-black text-white">
                            +{Number(c.finalPoints || 0).toFixed(1)}
                          </div>
                          {c.bonus > 0 && (
                            <div className="text-[10px] font-mono text-yellow-400 font-bold">
                              ({Number(c.basePoints || 0).toFixed(1)} + 1,000 bonus)
                            </div>
                          )}
                        </td>
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
            className="px-6 py-2.5 bg-white text-black font-display text-lg font-black tracking-wider hover:bg-zinc-200 transition-all rounded-none uppercase active:scale-95"
          >
            CLOSE ATHLETE PROFILE
          </button>
        </div>

      </div>
    </div>
  );
}
