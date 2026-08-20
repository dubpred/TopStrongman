import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { getAllTimeRankings } from '../services/databaseService';

const PAGE_SIZE = 50;

export default function AllTimeRankings({ onSelectCompetitor }) {
  const [division, setDivision] = useState('men');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const rawData = useMemo(() => {
    return getAllTimeRankings(division);
  }, [division]);

  // Normalize text to remove diacritics/accents for seamless searching
  const normalize = (str) =>
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtered & Sorted Rankings
  const filteredRankings = useMemo(() => {
    if (!rawData) return [];
    const term = normalize(searchTerm);
    return rawData
      .filter((item) => {
        const matchesSearch =
          normalize(item.name).includes(term) ||
          normalize(item.country).includes(term) ||
          normalize(item.activeYears).includes(term);
        return matchesSearch;
      })
      .sort((a, b) => b.goatScore - a.goatScore);
  }, [rawData, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRankings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRankings = useMemo(() => {
    return filteredRankings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredRankings, safePage]);

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
    <div className="space-y-5">
      
      {/* Header Banner (Rogue Hard-Angled Industrial - Identical to Standard Rankings) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] border-2 border-[#262626] rounded-none p-6 md:p-8 shadow-2xl">
        <div>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-wider">
            <span className="text-red-600">{division === 'women' ? "WOMEN'S" : "MEN'S"}</span>{' '}
            <span className="text-white">ALL-TIME GOAT RANKINGS</span>
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

      {/* Primary Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="SEARCH ALL-TIME LEGEND BY NAME OR COUNTRY..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-full h-[52px] bg-[#121212] text-white font-mono text-xs rounded-none pl-10 pr-3 border-2 border-[#262626] focus:outline-none focus:border-white transition-all placeholder:text-zinc-500 uppercase font-bold"
        />
      </div>

      {/* Mobile Card List View (Identical to Standard Rankings) */}
      <div className="block sm:hidden space-y-2">
        {pagedRankings.map((item) => (
          <div
            key={item.name}
            onClick={() => handleAthleteClick(item)}
            className="bg-[#121212] p-4 flex items-center justify-between gap-3 active:scale-[0.98] transition-transform cursor-pointer border-2 border-[#262626] hover:border-white rounded-none"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <span className={`font-display text-2xl font-black px-2 py-0.5 shrink-0 rounded-none ${
                item.rank === 1 ? 'bg-white text-black' :
                item.rank === 2 ? 'bg-zinc-300 text-black' :
                item.rank === 3 ? 'bg-zinc-700 text-white' : 'text-zinc-500'
              }`}>
                #{item.rank}
              </span>
              <div className="min-w-0">
                <div className="font-display font-black text-white text-xl tracking-wide truncate uppercase">
                  {item.name}
                </div>
                <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span>{item.country}</span>
                  <span>•</span>
                  <span>{item.activeYears}</span>
                  <span>•</span>
                  <span>{item.totalShows} SHOWS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="text-right">
                <div className="font-display text-3xl font-black text-white">
                  {item.goatScore.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-zinc-400 uppercase">PTS</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet View — Sticky column header div + spaced row divs (Identical to Standard Rankings) */}
      <div className="hidden sm:block">

        {/* Sticky Column Header */}
        <div className="sticky top-16 md:top-20 z-30 flex items-center bg-[#121212] border-2 border-[#262626] text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-2">
          <div className="w-24 shrink-0 py-3 px-4 text-center">RANK</div>
          <div className="flex-1 py-3 px-4">ATHLETE</div>
          <div className="w-28 shrink-0 py-3 px-4 text-center">CAREER SPAN</div>
          <div className="w-20 shrink-0 py-3 px-4 text-center">SHOWS</div>
          <div className="w-20 shrink-0 py-3 px-4 text-center">WINS</div>
          <div className="w-24 shrink-0 py-3 px-4 text-center">PODIUMS</div>
          <div className="w-44 shrink-0 py-3 px-4 text-right">GOAT SCORE</div>
          <div className="w-10 shrink-0 py-3 px-2"></div>
        </div>

        {/* Data Rows */}
        <div className="space-y-2">
          {pagedRankings.map((item) => (
            <div
              key={item.name}
              onClick={() => handleAthleteClick(item)}
              className="flex items-center bg-[#121212] border-2 border-[#262626] hover:border-white cursor-pointer group transition-colors"
            >
              <div className="w-24 shrink-0 py-4 px-4 text-center">
                <span className={`font-display text-2xl font-black px-2 py-0.5 rounded-none inline-block ${
                  item.rank === 1 ? 'bg-white text-black' :
                  item.rank === 2 ? 'bg-zinc-300 text-black' :
                  item.rank === 3 ? 'bg-zinc-700 text-white' : 'text-zinc-500'
                }`}>
                  #{item.rank}
                </span>
              </div>
              <div className="flex-1 py-4 px-4 min-w-0">
                <div className="font-display text-xl font-black text-white tracking-wider uppercase group-hover:text-zinc-200 truncate">
                  {item.name}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">{item.country}</div>
              </div>
              <div className="w-28 shrink-0 py-4 px-4 text-center font-mono font-bold text-zinc-400 text-xs">
                {item.activeYears}
              </div>
              <div className="w-20 shrink-0 py-4 px-4 text-center font-mono font-bold text-zinc-300">
                {item.totalShows}
              </div>
              <div className="w-20 shrink-0 py-4 px-4 text-center font-mono font-bold text-white">
                {item.totalWins}
              </div>
              <div className="w-24 shrink-0 py-4 px-4 text-center font-mono font-bold text-zinc-300">
                {item.totalPodiums}
              </div>
              <div className="w-44 shrink-0 py-4 px-4 text-right font-display text-3xl font-black text-white">
                {item.goatScore.toLocaleString()} <span className="text-xs font-mono text-zinc-400">PTS</span>
              </div>
              <div className="w-10 shrink-0 py-4 px-2 text-right">
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
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
