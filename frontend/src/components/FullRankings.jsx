import React, { useState, useMemo } from 'react';
import { Search, Award, Globe, ChevronRight, ChevronLeft, Calendar, Trophy, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { computeRankingsFromDatabase } from '../services/databaseService';

const PAGE_SIZE = 50;

export default function FullRankings({ rankings: initialRankings, onSelectCompetitor, formula }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [division, setDivision] = useState('men');
  const [yearsLimit, setYearsLimit] = useState(5);
  const [placementLimit, setPlacementLimit] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [page, setPage] = useState(1);

  const isAdvancedActive = yearsLimit !== 5 || placementLimit !== 'all';

  // Compute active rankings dynamically based on selected Timeframe, Division, and Placements Scope
  const rankings = useMemo(() => {
    return computeRankingsFromDatabase({ yearsLimit, placementLimit, division });
  }, [yearsLimit, placementLimit, division]);

  // Extract unique countries
  const countries = useMemo(() => {
    if (!rankings) return [];
    const set = new Set(rankings.map(r => r.competitor.country));
    return Array.from(set).sort();
  }, [rankings]);

  // Normalize text to remove diacritics/accents for seamless searching
  const normalize = (str) =>
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtered & Sorted Rankings
  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    const term = normalize(searchTerm);
    return rankings
      .filter((item) => {
        const matchesSearch =
          normalize(item.competitor.name).includes(term) ||
          normalize(item.competitor.country).includes(term);
        const matchesCountry = selectedCountry === 'ALL' || item.competitor.country === selectedCountry;
        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => a.globalRank - b.globalRank);
  }, [rankings, searchTerm, selectedCountry]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRankings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRankings = useMemo(() => {
    return filteredRankings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredRankings, safePage]);

  return (
    <div className="space-y-8">
      
      {/* Header Banner (Rogue Hard-Angled Industrial) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] border-2 border-[#262626] rounded-none p-6 md:p-8 shadow-2xl">
        <div>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-wider">
            <span className="text-red-600">{division === 'women' ? "WOMEN'S" : "MEN'S"}</span>{' '}
            <span className="text-white">OPEN RANKINGS</span>
          </h1>
        </div>

        {/* Division Switcher (Rogue Sharp Boxed Buttons) */}
        <div className="flex items-center space-x-2 bg-[#080808] p-1.5 border-2 border-[#262626] rounded-none">
          <button
            onClick={() => { setDivision('men'); setPage(1); }}
            className={`px-5 py-2 font-display text-lg font-black uppercase tracking-wider transition-all rounded-none ${
              division === 'men'
                ? 'bg-white text-black shadow-rogue-white border-2 border-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            MEN'S OPEN
          </button>
          <button
            onClick={() => { setDivision('women'); setPage(1); }}
            className={`px-5 py-2 font-display text-lg font-black uppercase tracking-wider transition-all rounded-none ${
              division === 'women'
                ? 'bg-white text-black shadow-rogue-white border-2 border-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/10 border-2 border-transparent'
            }`}
          >
            WOMEN'S OPEN
          </button>
        </div>
      </div>

      {/* Primary Filter Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="SEARCH ATHLETE BY NAME..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full h-[52px] bg-[#121212] text-white font-mono text-xs rounded-none pl-10 pr-3 border-2 border-[#262626] focus:outline-none focus:border-white transition-all placeholder:text-zinc-500 uppercase font-bold"
            />
          </div>

          {/* Advanced Options Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full h-[52px] flex items-center justify-between px-4 font-display text-base font-bold tracking-wider transition-all rounded-none uppercase border-2 ${
              isAdvancedActive || showAdvanced
                ? 'bg-white text-black border-white font-black'
                : 'bg-[#121212] text-zinc-300 border-[#262626] hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>ADVANCED FILTERS</span>
              {isAdvancedActive && (
                <span className="bg-white text-black px-1.5 py-0.5 text-[10px] font-mono font-black">
                  ACTIVE
                </span>
              )}
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

        </div>

        {/* Collapsible Advanced Options Panel */}
        {showAdvanced && (
          <div className="bg-[#121212] border-2 border-[#262626] rounded-none p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center space-x-2 text-white font-display text-lg font-bold uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-white" />
                <span>SCORING & TIMEFRAME CONTROLS</span>
              </div>
              {isAdvancedActive && (
                <button
                  onClick={() => { setYearsLimit(5); setPlacementLimit('all'); setPage(1); }}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 border border-zinc-500 text-white text-xs font-mono font-bold hover:bg-white hover:text-black transition-all rounded-none uppercase"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Timeframe Filter (1 to 5 Years) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase font-bold flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>COMPETITION TIMEFRAME WINDOW</span>
                </label>
                <div className="relative">
                  <select
                    value={yearsLimit}
                    onChange={(e) => { setYearsLimit(Number(e.target.value)); setPage(1); }}
                    className="w-full bg-[#181818] text-white font-mono text-xs font-bold rounded-none px-3 py-2.5 border-2 border-[#262626] focus:outline-none focus:border-white transition-all appearance-none cursor-pointer"
                  >
                    <option value={5}>5 Years (Full 60-Month Rolling History)</option>
                    <option value={4}>4 Years (Last 48 Months)</option>
                    <option value={3}>3 Years (Last 36 Months)</option>
                    <option value={2}>2 Years (Last 24 Months)</option>
                    <option value={1}>1 Year (Last 12 Months)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Placements Scope Filter (Top 5, Top 10, All) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase font-bold flex items-center space-x-1.5">
                  <Trophy className="w-3.5 h-3.5 text-zinc-300" />
                  <span>ATHLETE EVALUATED PLACEMENTS SCOPE</span>
                </label>
                <div className="relative">
                  <select
                    value={placementLimit}
                    onChange={(e) => { setPlacementLimit(e.target.value); setPage(1); }}
                    className="w-full bg-[#181818] text-white font-mono text-xs font-bold rounded-none px-3 py-2.5 border-2 border-[#262626] focus:outline-none focus:border-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Placements (Accumulate All Shows)</option>
                    <option value="top5">Top 5 Placements (Only Best 5 Shows)</option>
                    <option value="top10">Top 10 Placements (Only Best 10 Shows)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Mobile Card List View (Visible on small screens) */}
      <div className="block sm:hidden space-y-2.5">
        {pagedRankings.map((item) => (
          <div
            key={item.competitor.id}
            onClick={() => onSelectCompetitor(item)}
            className="bg-[#121212] p-4 flex items-center justify-between gap-3 active:scale-[0.98] transition-transform cursor-pointer border-2 border-[#262626] hover:border-white rounded-none"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <span className={`font-display text-2xl font-black px-2 py-0.5 shrink-0 rounded-none ${
                item.globalRank === 1 ? 'bg-white text-black' :
                item.globalRank === 2 ? 'bg-zinc-300 text-black' :
                item.globalRank === 3 ? 'bg-zinc-700 text-white' : 'text-zinc-500'
              }`}>
                #{item.globalRank}
              </span>
              <div className="min-w-0">
                <div className="font-display font-black text-white text-xl tracking-wide truncate uppercase">
                  {item.competitor.name}
                </div>
                <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span>{item.competitor.country}</span>
                  <span>•</span>
                  <span>{item.totalShows} SHOWS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="text-right">
                <div className="font-display text-3xl font-black text-white">
                  {item.totalPoints.toFixed(1)}
                </div>
                <div className="text-[9px] font-mono text-zinc-400 uppercase">PTS</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table List View (Rogue Hard-Angled Table with sticky header) */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-16 md:top-20 z-30">
              <tr className="bg-[#121212] text-xs font-mono text-zinc-400 uppercase tracking-widest">
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 text-center w-20 border-y-2 border-l-2 border-[#262626]">RANK</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 border-y-2 border-[#262626]">ATHLETE</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 text-center border-y-2 border-[#262626]">SHOWS</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 text-center border-y-2 border-[#262626]">WINS</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 text-center border-y-2 border-[#262626]">PODIUMS</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-6 text-right border-y-2 border-[#262626]">TOTAL POINTS</th>
                <th className="sticky top-16 md:top-20 bg-[#121212] z-30 py-3.5 px-4 border-y-2 border-r-2 border-[#262626]"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pagedRankings.map((item) => (
                <tr
                  key={item.competitor.id}
                  onClick={() => onSelectCompetitor(item)}
                  className="bg-[#121212] hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-6 text-center border-y-2 border-l-2 border-[#262626] group-hover:border-white transition-colors">
                    <span className={`font-display text-2xl font-black px-2 py-0.5 rounded-none inline-block ${
                      item.globalRank === 1 ? 'bg-white text-black' :
                      item.globalRank === 2 ? 'bg-zinc-300 text-black' :
                      item.globalRank === 3 ? 'bg-zinc-700 text-white' : 'text-zinc-500'
                    }`}>
                      #{item.globalRank}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 border-y-2 border-[#262626] group-hover:border-white transition-colors">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-display text-xl font-black text-white tracking-wider uppercase flex items-center space-x-2 group-hover:text-zinc-200">
                          <span>{item.competitor.name}</span>
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">
                          {item.competitor.country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-zinc-300 border-y-2 border-[#262626] group-hover:border-white transition-colors">
                    {item.totalShows}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-white border-y-2 border-[#262626] group-hover:border-white transition-colors">
                    {item.winsCount}
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono font-bold text-zinc-300 border-y-2 border-[#262626] group-hover:border-white transition-colors">
                    {item.podiumsCount}
                  </td>
                  <td className="py-3.5 px-6 text-right font-display text-3xl font-black text-white border-y-2 border-[#262626] group-hover:border-white transition-colors">
                    {item.totalPoints.toFixed(1)} <span className="text-xs font-mono text-zinc-400">PTS</span>
                  </td>
                  <td className="py-3.5 px-4 text-right border-y-2 border-r-2 border-[#262626] group-hover:border-white transition-colors">
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-none bg-[#121212] border-2 border-[#262626] text-zinc-300 font-mono text-xs font-bold disabled:opacity-30 hover:border-white hover:text-white transition-all uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <div className="font-mono text-xs text-zinc-400 uppercase font-bold">
            PAGE <span className="text-white font-black">{safePage}</span> OF <span className="text-zinc-200 font-black">{totalPages}</span>
            <span className="ml-3 text-zinc-500">({filteredRankings.length} ATHLETES)</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-none bg-[#121212] border-2 border-[#262626] text-zinc-300 font-mono text-xs font-bold disabled:opacity-30 hover:border-white hover:text-white transition-all uppercase"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
