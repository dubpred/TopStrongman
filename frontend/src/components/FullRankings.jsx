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

  // Filtered & Sorted Rankings
  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    return rankings
      .filter((item) => {
        const matchesSearch =
          item.competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.competitor.country.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCountry = selectedCountry === 'ALL' || item.competitor.country === selectedCountry;
        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [rankings, searchTerm, selectedCountry]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRankings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRankings = useMemo(() => {
    return filteredRankings
      .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
      .map((item, idx) => ({ ...item, globalRank: (safePage - 1) * PAGE_SIZE + idx + 1 }));
  }, [filteredRankings, safePage]);

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dew-card border border-dew-green/30 rounded-3xl p-6 md:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dew-green/10 border border-dew-green/30 text-dew-green text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>GLOBAL ATHLETE MATRIX • {division === 'women' ? "WOMEN'S OPEN" : "MEN'S OPEN"} DIVISION • {yearsLimit}-YEAR WINDOW</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white">
            {division === 'women' ? "WOMEN'S OPEN" : "MEN'S OPEN"} <span className="dew-gradient-text">RANKINGS</span>
          </h1>
        </div>

        {/* Division Switcher */}
        <div className="flex items-center space-x-2 bg-[#080D08] p-1.5 rounded-2xl border border-dew-green/30 shadow-inner">
          <button
            onClick={() => { setDivision('men'); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
              division === 'men'
                ? 'bg-dew-green text-black shadow-dew-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>MEN'S OPEN</span>
          </button>
          <button
            onClick={() => { setDivision('women'); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
              division === 'women'
                ? 'bg-dew-green text-black shadow-dew-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>WOMEN'S OPEN</span>
          </button>
        </div>
      </div>

      {/* Primary Filter Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search athlete..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-dew-card text-white font-sans text-xs rounded-xl pl-10 pr-3 py-3 border border-dew-green/30 focus:outline-none focus:border-dew-green transition-all"
            />
          </div>

          {/* Advanced Options Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all border ${
              isAdvancedActive || showAdvanced
                ? 'bg-dew-green text-black border-dew-green shadow-dew-glow font-extrabold'
                : 'bg-dew-card text-dew-green border-dew-green/30 hover:bg-dew-green/10'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>ADVANCED OPTIONS</span>
              {isAdvancedActive && (
                <span className="bg-black text-dew-green px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  ACTIVE
                </span>
              )}
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

        </div>

        {/* Collapsible Advanced Options Panel */}
        {showAdvanced && (
          <div className="bg-[#0A120A] border border-dew-green/40 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dew-green/20 pb-3">
              <div className="flex items-center space-x-2 text-dew-green font-mono text-xs font-bold uppercase">
                <SlidersHorizontal className="w-4 h-4" />
                <span>ADVANCED RANKING SCORING FILTERS</span>
              </div>
              {isAdvancedActive && (
                <button
                  onClick={() => { setYearsLimit(5); setPlacementLimit('all'); setPage(1); }}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-dew-card border border-dew-red/40 text-dew-red text-[11px] font-mono font-bold hover:bg-dew-red hover:text-white transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET ADVANCED</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Timeframe Filter (1 to 5 Years) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase font-bold flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-dew-green" />
                  <span>COMPETITION TIMEFRAME WINDOW</span>
                </label>
                <div className="relative">
                  <select
                    value={yearsLimit}
                    onChange={(e) => { setYearsLimit(Number(e.target.value)); setPage(1); }}
                    className="w-full bg-dew-card text-dew-green font-mono text-xs font-bold rounded-xl px-3 py-2.5 border border-dew-green/30 focus:outline-none focus:border-dew-green transition-all appearance-none cursor-pointer"
                  >
                    <option value={5}>5 Years (Full 60-Month Rolling History)</option>
                    <option value={4}>4 Years (Last 48 Months)</option>
                    <option value={3}>3 Years (Last 36 Months)</option>
                    <option value={2}>2 Years (Last 24 Months)</option>
                    <option value={1}>1 Year (Last 12 Months)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dew-green pointer-events-none" />
                </div>
              </div>

              {/* Placements Scope Filter (Top 5, Top 10, All) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase font-bold flex items-center space-x-1.5">
                  <Trophy className="w-3.5 h-3.5 text-dew-yellow" />
                  <span>ATHLETE EVALUATED PLACEMENTS SCOPE</span>
                </label>
                <div className="relative">
                  <select
                    value={placementLimit}
                    onChange={(e) => { setPlacementLimit(e.target.value); setPage(1); }}
                    className="w-full bg-dew-card text-dew-yellow font-mono text-xs font-bold rounded-xl px-3 py-2.5 border border-dew-yellow/30 focus:outline-none focus:border-dew-yellow transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Placements (Accumulate All Shows)</option>
                    <option value="top5">Top 5 Placements (Only Best 5 Shows)</option>
                    <option value="top10">Top 10 Placements (Only Best 10 Shows)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-dew-yellow pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Mobile Card List View (Visible on small screens: Pixel, iPhone) */}
      <div className="block sm:hidden space-y-3">
        {pagedRankings.map((item) => (
          <div
            key={item.competitor.id}
            onClick={() => onSelectCompetitor(item)}
            className="dew-glass-card p-4 flex items-center justify-between gap-3 active:scale-[0.98] transition-transform cursor-pointer border border-dew-green/30"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <span className={`font-display text-2xl font-black shrink-0 ${
                item.globalRank === 1 ? 'text-dew-green' :
                item.globalRank === 2 ? 'text-dew-yellow' :
                item.globalRank === 3 ? 'text-dew-red' : 'text-gray-400'
              }`}>
                #{item.globalRank}
              </span>
              <div className="min-w-0">
                <div className="font-heading font-bold text-white text-base truncate">
                  {item.competitor.name}
                </div>
                <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span>{item.competitor.flagEmoji || '🌐'} {item.competitor.country}</span>
                  <span>•</span>
                  <span>{item.totalShows} shows</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="text-right">
                <div className="font-display text-2xl font-black text-dew-green">
                  {item.totalPoints.toFixed(1)}
                </div>
                <div className="text-[9px] font-mono text-gray-400 uppercase">PTS</div>
              </div>
              <ChevronRight className="w-5 h-5 text-dew-green shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table List View (Visible on sm+ screens) */}
      <div className="hidden sm:block dew-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#080D08] border-b border-dew-green/20 text-xs font-mono text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">RANK</th>
                <th className="py-4 px-6">COMPETITOR</th>
                <th className="py-4 px-6 text-center">SHOWS</th>
                <th className="py-4 px-6 text-center">WINS</th>
                <th className="py-4 px-6 text-center">PODIUMS</th>
                <th className="py-4 px-6 text-right">TOTAL POINTS</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dew-green/10 text-sm">
              {pagedRankings.map((item) => (
                <tr
                  key={item.competitor.id}
                  onClick={() => onSelectCompetitor(item)}
                  className="hover:bg-dew-card/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 text-center">
                    <span className={`font-display text-xl font-black ${
                      item.globalRank === 1 ? 'text-dew-green' :
                      item.globalRank === 2 ? 'text-dew-yellow' :
                      item.globalRank === 3 ? 'text-dew-red' : 'text-gray-400'
                    }`}>
                      #{item.globalRank}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-heading text-lg font-bold text-gray-100 flex items-center space-x-2">
                          <span>{item.competitor.name}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-gray-300">
                    {item.totalShows}
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-dew-green">
                    {item.winsCount}
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-dew-yellow">
                    {item.podiumsCount}
                  </td>
                  <td className="py-4 px-6 text-right font-display text-2xl font-black text-dew-green">
                    {item.totalPoints.toFixed(1)} <span className="text-xs font-mono text-gray-400">PTS</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-dew-green group-hover:translate-x-1 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dew-card border border-dew-green/30 text-dew-green font-mono text-sm font-bold disabled:opacity-30 hover:bg-dew-green hover:text-black transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          <div className="font-mono text-sm text-gray-400">
            Page <span className="text-dew-green font-bold">{safePage}</span> of <span className="text-white font-bold">{totalPages}</span>
            <span className="ml-3 text-gray-600">({filteredRankings.length} athletes)</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dew-card border border-dew-green/30 text-dew-green font-mono text-sm font-bold disabled:opacity-30 hover:bg-dew-green hover:text-black transition-all"
          >
            <span>NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
