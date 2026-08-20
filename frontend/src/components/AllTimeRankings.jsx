import React, { useState, useMemo } from 'react';
import { Trophy, Award, Crown, Search, ChevronRight, Shield, Zap, Info, Calendar } from 'lucide-react';
import { getAllTimeRankings } from '../services/databaseService';

// Flag SVG helper mapping
const countryToFlagCode = {
  'LTU': 'lt', 'USA': 'us', 'POL': 'pl', 'CAN': 'ca', 'ISL': 'is',
  'GBR': 'gb', 'ENG': 'gb-eng', 'SCO': 'gb-sct', 'WAL': 'gb-wls',
  'UKR': 'ua', 'NOR': 'no', 'SWE': 'se', 'FIN': 'fi', 'LAT': 'lv',
  'EST': 'ee', 'GER': 'de', 'DEU': 'de', 'RUS': 'ru', 'GEO': 'ge', 'BUL': 'bg',
  'NED': 'nl', 'NLD': 'nl', 'BEL': 'be', 'FRA': 'fr', 'AUS': 'au', 'NZL': 'nz',
  'RSA': 'za', 'ZAF': 'za', 'BRA': 'br', 'HUN': 'hu', 'CZE': 'cz', 'AUT': 'at',
  'SRB': 'rs', 'SLO': 'si', 'SVN': 'si', 'SVK': 'sk', 'IRL': 'ie', 'ITA': 'it',
  'PUR': 'pr', 'MEX': 'mx', 'GHA': 'gh', 'IRI': 'ir',
  'DEN': 'dk', 'DNK': 'dk', 'DK': 'dk',
  'SUI': 'ch', 'CHE': 'ch', 'ESP': 'es', 'POR': 'pt', 'PRT': 'pt',
  'ROU': 'ro', 'CRO': 'hr', 'HRV': 'hr', 'BIH': 'ba', 'GRE': 'gr', 'GRC': 'gr',
  'CYP': 'cy', 'TUR': 'tr', 'ISR': 'il', 'JPN': 'jp', 'CHN': 'cn', 'KOR': 'kr',
  'IND': 'in', 'EGY': 'eg', 'NGR': 'ng', 'KEN': 'ke', 'ARG': 'ar', 'CHI': 'cl',
  'CHL': 'cl', 'COL': 'co', 'FRO': 'fo', 'SAM': 'ws', 'WSM': 'ws', 'FIJ': 'fj', 'TGA': 'to',
  'MAR': 'ma', 'ALG': 'dz', 'TUN': 'tn', 'BFA': 'bf', 'BUR': 'bf', 'CMR': 'cm'
};

const getCountryFlagUrl = (countryCode) => {
  if (!countryCode) return null;
  const upper = countryCode.toUpperCase().trim();
  const code = countryToFlagCode[upper] || countryCode.toLowerCase().trim();
  return `https://flagcdn.com/w40/${code}.png`;
};

export default function AllTimeRankings({ onSelectCompetitor }) {
  const [division, setDivision] = useState('men');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const rawData = useMemo(() => {
    return getAllTimeRankings(division);
  }, [division]);

  // Filter by search
  const filteredRankings = useMemo(() => {
    let list = [...rawData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.country && item.country.toLowerCase().includes(q)) ||
        item.activeYears.includes(q)
      );
    }

    list.sort((a, b) => b.goatScore - a.goatScore);
    return list;
  }, [rawData, searchQuery]);

  const handleAthleteClick = (athlete) => {
    if (onSelectCompetitor) {
      onSelectCompetitor({
        ...athlete,
        totalPoints: athlete.goatScore,
        globalRank: athlete.rank,
        winsCount: athlete.totalWins,
        podiumsCount: athlete.totalPodiums,
        totalShows: athlete.totalShows,
        evaluatedCount: athlete.topShows ? athlete.topShows.length : 0,
        topShows: athlete.topShows || [],
        isAllTime: true
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 pb-16">
      
      {/* Header Banner (Rogue Steel Industrial Design) */}
      <div className="relative bg-[#080808] border-2 sm:border-4 border-[#262626] p-4 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 font-mono text-[11px] sm:text-xs tracking-widest uppercase font-bold">
              <Crown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-yellow-500 shrink-0" />
              <span>Historical World Rankings (1977 – Present)</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              BEST OF <span className="text-red-600">ALL TIME</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-2xl font-sans leading-relaxed">
              Evaluating the absolute greatest strongman legends in history. Powered by our cross-era normalized field-strength model and exponential placement decay across all career competitions.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-[#141414] hover:bg-[#202020] border-2 border-[#333] text-zinc-300 text-xs font-mono font-bold tracking-wider uppercase transition-all active:scale-95"
            >
              <Info className="w-3.5 h-3.5 text-red-500" />
              <span>{showExplanation ? 'Hide Methodology' : 'How It Works'}</span>
            </button>
          </div>
        </div>

        {/* Methodology Dropdown */}
        {showExplanation && (
          <div className="mt-6 pt-5 border-t-2 border-[#262626] grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs font-sans text-zinc-400">
            <div className="bg-[#121212] p-3.5 sm:p-4 border border-[#222] space-y-1">
              <div className="font-display text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> 1. Cross-Era Normalized Difficulty
              </div>
              <p>Every historical contest from 1977 to present has its difficulty evaluated relative to its era's peak world championship field (0–1000 pts).</p>
            </div>
            <div className="bg-[#121212] p-3.5 sm:p-4 border border-[#222] space-y-1">
              <div className="font-display text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-500" /> 2. Placement Performance + Major Bonus
              </div>
              <p>Athletes earn points from each show based on its difficulty and finishing rank (1st = 100%, 2nd = 77.9%), plus a +1,000 flat bonus for Major World Titles (WSM, Arnold Classic, SMOE, Rogue).</p>
            </div>
          </div>
        )}
      </div>

      {/* Division Switcher */}
      <div className="flex justify-center px-1">
        <div className="grid grid-cols-2 w-full max-w-lg p-1 bg-[#0e0e0e] border-2 border-[#262626] shadow-xl">
          <button
            onClick={() => setDivision('men')}
            className={`py-2.5 sm:py-3 font-display text-sm sm:text-lg font-black tracking-wider uppercase transition-all text-center ${
              division === 'men'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="block sm:hidden">MEN'S OPEN</span>
            <span className="hidden sm:block">MEN'S OPEN (1977–PRESENT)</span>
          </button>
          <button
            onClick={() => setDivision('women')}
            className={`py-2.5 sm:py-3 font-display text-sm sm:text-lg font-black tracking-wider uppercase transition-all text-center ${
              division === 'women'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="block sm:hidden">WOMEN'S OPEN</span>
            <span className="hidden sm:block">WOMEN'S OPEN (1997–PRESENT)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0e0e0e] border-2 border-[#262626] p-3.5 sm:p-5 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all-time legend (e.g. Savickas, Shaw, Kazmaier, Sigmarsson)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#2a2a2a] focus:border-red-600 text-white font-sans text-xs sm:text-sm outline-none transition-colors placeholder:text-zinc-600 rounded-none"
          />
        </div>
      </div>

      {/* Mobile Card List View (Phones & Small Tablets) */}
      <div className="block md:hidden space-y-2.5">
        {filteredRankings.slice(0, 100).map((athlete) => {
          return (
            <div
              key={athlete.name}
              onClick={() => handleAthleteClick(athlete)}
              className="p-3.5 sm:p-4 bg-[#0e0e0e] border-2 border-[#262626] hover:border-zinc-500 transition-all active:scale-[0.98] cursor-pointer space-y-2.5"
            >
              {/* Row 1: Rank, Name, Flag, and Score */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-display text-lg font-black px-2 py-0.5 shrink-0 bg-[#181818] text-zinc-400 border border-[#333]">
                    #{athlete.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-base sm:text-lg font-black text-white uppercase truncate tracking-wide flex items-center gap-1.5">
                      {athlete.country && (
                        <img
                          src={getCountryFlagUrl(athlete.country)}
                          alt={athlete.country}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          className="w-4 h-3 object-cover border border-zinc-700 shrink-0 inline-block"
                        />
                      )}
                      <span className="truncate">{athlete.name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>{athlete.country || 'N/A'}</span>
                      <span>•</span>
                      <span>{athlete.activeYears}</span>
                      <span>•</span>
                      <span>{athlete.totalShows} SHOWS</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display text-xl sm:text-2xl font-black text-white">
                    {athlete.goatScore.toLocaleString()}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase font-bold">GOAT PTS</div>
                </div>
              </div>

              {/* Row 2: Major Titles Badges */}
              {(athlete.wsmWins > 0 || athlete.ascWins > 0 || athlete.smoeWins > 0 || athlete.rogueWins > 0) && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-[#1c1c1c]">
                  {athlete.wsmWins > 0 && (
                    <span className="px-1.5 py-0.5 bg-yellow-950/80 border border-yellow-700/80 text-yellow-400 font-mono text-[10px] font-black">
                      🏆 {athlete.wsmWins}x WSM
                    </span>
                  )}
                  {athlete.ascWins > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-950/80 border border-red-800 text-red-400 font-mono text-[10px] font-bold">
                      🥇 {athlete.ascWins}x ASC
                    </span>
                  )}
                  {athlete.smoeWins > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-950/80 border border-amber-800 text-amber-400 font-mono text-[10px] font-bold">
                      ⚡ {athlete.smoeWins}x SMOE
                    </span>
                  )}
                  {athlete.rogueWins > 0 && (
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-500 text-white font-mono text-[10px] font-bold">
                      ⚔️ {athlete.rogueWins}x ROGUE
                    </span>
                  )}
                </div>
              )}

              {/* Row 3: Career Record Summary */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-[#1c1c1c]">
                <div>
                  <span className="text-white font-bold">{athlete.totalWins} Wins</span> ({athlete.winRate}%) • <span className="text-zinc-300 font-bold">{athlete.totalPodiums} Podiums</span>
                </div>
                <div className="text-red-400 text-[10px] font-bold flex items-center gap-0.5">
                  TOP 10 SHOWS <ChevronRight className="w-3 h-3 inline" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredRankings.length > 100 && (
          <div className="p-4 bg-[#0e0e0e] border border-[#262626] text-center text-xs font-mono text-zinc-500">
            Showing Top 100 of {filteredRankings.length} historical open-class athletes.
          </div>
        )}
      </div>

      {/* Desktop Leaderboard Table (Tablets & Desktops) */}
      <div className="hidden md:block bg-[#0a0a0a] border-2 border-[#262626] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[#121212] border-b-2 border-[#262626] text-zinc-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Legend / Athlete</th>
                <th className="py-3.5 px-4">Career Span</th>
                <th className="py-3.5 px-4 text-center">Major Titles</th>
                <th className="py-3.5 px-4 text-center">Career Record</th>
                <th className="py-3.5 px-4 text-right">GOAT Score</th>
                <th className="py-3.5 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c] text-sm">
              {filteredRankings.slice(0, 100).map((athlete) => {
                return (
                  <tr
                    key={athlete.name}
                    onClick={() => handleAthleteClick(athlete)}
                    className="hover:bg-[#151515] transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-display text-xl font-black text-zinc-400 group-hover:text-white">
                        #{athlete.rank}
                      </span>
                    </td>

                    {/* Athlete Name & Country */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {athlete.country && (
                          <img
                            src={getCountryFlagUrl(athlete.country)}
                            alt={athlete.country}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-6 h-4 object-cover rounded-none border border-zinc-700 shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-display text-lg sm:text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase leading-none">
                            {athlete.name}
                          </div>
                          <div className="text-xs font-mono text-zinc-500 mt-0.5">
                            {athlete.country || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Career Span */}
                    <td className="py-4 px-4 font-mono text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{athlete.activeYears}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">{athlete.totalShows} Contests Recorded</div>
                    </td>

                    {/* Major Titles */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-wrap justify-center gap-1.5 text-xs font-mono">
                        {athlete.wsmWins > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-950/80 border border-yellow-700/80 text-yellow-400 font-black">
                            🏆 {athlete.wsmWins}x WSM
                          </span>
                        )}
                        {athlete.ascWins > 0 && (
                          <span className="px-2 py-0.5 bg-red-950/80 border border-red-800 text-red-400 font-bold">
                            🥇 {athlete.ascWins}x ASC
                          </span>
                        )}
                        {athlete.smoeWins > 0 && (
                          <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-800 text-amber-400 font-bold">
                            ⚡ {athlete.smoeWins}x SMOE
                          </span>
                        )}
                        {athlete.rogueWins > 0 && (
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-500 text-white font-bold">
                            ⚔️ {athlete.rogueWins}x ROGUE
                          </span>
                        )}
                        {athlete.wsmWins === 0 && athlete.ascWins === 0 && athlete.smoeWins === 0 && (!athlete.rogueWins || athlete.rogueWins === 0) && (
                          <span className="text-zinc-600 font-mono text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Career Record */}
                    <td className="py-4 px-4 text-center font-mono text-xs">
                      <div className="text-zinc-200 font-bold">{athlete.totalWins} Wins ({athlete.winRate}%)</div>
                      <div className="text-zinc-500">{athlete.totalPodiums} Podiums ({athlete.podiumRate}%)</div>
                    </td>

                    {/* GOAT Score */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-display text-2xl font-black text-white">
                        {athlete.goatScore.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">{athlete.totalShows} SHOWS</div>
                    </td>

                    {/* Chevron */}
                    <td className="py-4 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRankings.length > 100 && (
          <div className="p-4 bg-[#0e0e0e] border-t border-[#262626] text-center text-xs font-mono text-zinc-500">
            Showing Top 100 of {filteredRankings.length} historical open-class athletes. Use search to find specific legends.
          </div>
        )}
      </div>

    </div>
  );
}
