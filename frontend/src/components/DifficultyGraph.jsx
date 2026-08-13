import React, { useState, useMemo } from 'react';
import { getAllShowsWithDifficulty } from '../services/databaseService';
import { TrendingUp, Search, Filter, Info, ShieldCheck, Award } from 'lucide-react';

export default function DifficultyGraph() {
  const [division, setDivision] = useState('men');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredShow, setHoveredShow] = useState(null);

  const rawShows = useMemo(() => {
    return getAllShowsWithDifficulty(division);
  }, [division]);

  // Filter shows by selected tier and search term
  const filteredShows = useMemo(() => {
    return rawShows.filter(show => {
      const matchesTier = selectedTier === 'ALL' || show.tier === selectedTier;
      const matchesSearch = show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            show.promotion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [rawShows, selectedTier, searchTerm]);

  // SVG Chart dimensions
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 420;
  const PADDING_LEFT = 60;
  const PADDING_RIGHT = 30;
  const PADDING_TOP = 40;
  const PADDING_BOTTOM = 60;
  const GRAPH_WIDTH = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const GRAPH_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const totalCount = rawShows.length;

  // Map show to SVG coordinates (x: rank 1..N, y: difficulty 0..1000)
  const getCoordinates = (show) => {
    const rawIndex = rawShows.findIndex(s => s.name === show.name);
    const xFraction = totalCount > 1 ? rawIndex / (totalCount - 1) : 0;
    const x = PADDING_LEFT + xFraction * GRAPH_WIDTH;

    const yFraction = show.difficulty / 1000;
    const y = PADDING_TOP + GRAPH_HEIGHT - yFraction * GRAPH_HEIGHT;

    return { x, y, rawIndex };
  };

  // Generate smooth power curve line path D(x) = 1000 * (1 - x)^2.5
  const curvePointsPath = useMemo(() => {
    const points = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const normX = i / steps; // 0 to 1
      const x = PADDING_LEFT + normX * GRAPH_WIDTH;
      // Exponential power curve decay from max (1000) to min (~0)
      const diffVal = 1000 * Math.pow(1 - normX * 0.98, 2.5);
      const normY = Math.max(0, Math.min(1000, diffVal)) / 1000;
      const y = PADDING_TOP + GRAPH_HEIGHT - normY * GRAPH_HEIGHT;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, []);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'TIER 1': return '#FFFFFF'; // Rogue Stark White
      case 'TIER 2': return '#D4D4D8'; // Light Platinum Zinc
      case 'TIER 3': return '#A1A1AA'; // Steel Gray
      case 'TIER 4': return '#71717A'; // Gunmetal Slate
      case 'TIER 5': return '#3F3F46'; // Dark Industrial Charcoal
      default: return '#52525B';
    }
  };

  const topShowName = rawShows[0]?.name || 'Benchmark #1';

  return (
    <div className="bg-[#121212] p-6 md:p-8 rounded-none border-2 border-[#262626] space-y-6 shadow-2xl">
      
      {/* Title & Filter Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#262626] pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#181818] border border-[#333] text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider mb-2 rounded-none">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>NON-LINEAR POWER MODEL (p = 2.5) • {division === 'women' ? "WOMEN'S OPEN" : "MEN'S OPEN"}</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-wider">
            {division === 'women' ? "WOMEN'S" : "MEN'S"} DIFFICULTY <span className="text-zinc-400">SCALING GRAPH</span>
          </h2>
          <p className="text-zinc-400 text-xs font-mono mt-1">
            ALL {rawShows.length} {division === 'women' ? "WOMEN'S" : "MEN'S"} COMPETITIONS SCALED RELATIVE TO BENCHMARK ({topShowName} = 1000.0 PTS)
          </p>
        </div>

        {/* Division Switcher & Tier Filter Tabs */}
        <div className="flex flex-col items-start md:items-end gap-2.5">
          {/* Gender / Division Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#080808] p-1.5 border-2 border-[#262626] rounded-none font-mono text-xs">
            <button
              onClick={() => { setDivision('men'); setHoveredShow(null); }}
              className={`px-4 py-1.5 font-display text-base font-black uppercase tracking-wider transition-all rounded-none ${
                division === 'men'
                  ? 'bg-white text-black shadow-rogue-white border border-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              MEN'S OPEN
            </button>
            <button
              onClick={() => { setDivision('women'); setHoveredShow(null); }}
              className={`px-4 py-1.5 font-display text-base font-black uppercase tracking-wider transition-all rounded-none ${
                division === 'women'
                  ? 'bg-white text-black shadow-rogue-white border border-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              WOMEN'S OPEN
            </button>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['ALL', 'TIER 1', 'TIER 2', 'TIER 3', 'TIER 4', 'TIER 5'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-3 py-1 font-bold transition-all border-2 text-[11px] rounded-none uppercase ${
                  selectedTier === t
                    ? 'bg-white text-black border-white shadow-rogue-white font-black'
                    : 'bg-[#181818] text-zinc-300 border-[#262626] hover:border-zinc-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="FILTER COMPETITION ON GRAPH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#181818] text-white font-mono text-xs rounded-none pl-10 pr-3 py-2.5 border-2 border-[#262626] focus:outline-none focus:border-white transition-all placeholder:text-zinc-500 uppercase font-bold"
        />
      </div>

      {/* SVG Interactive Scatter Plot Graph (Rogue Industrial Grid) */}
      <div className="relative bg-[#080808] border-2 border-[#262626] rounded-none p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto select-none min-w-[700px]">
          
          {/* Y-Axis Grid Lines & Labels */}
          {[1000, 750, 500, 250, 0].map((val) => {
            const y = PADDING_TOP + GRAPH_HEIGHT - (val / 1000) * GRAPH_HEIGHT;
            return (
              <g key={val}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={SVG_WIDTH - PADDING_RIGHT}
                  y2={y}
                  stroke="#262626"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  fill="#71717A"
                  fontSize="11"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {/* X Axis Benchmark Labels */}
          <text
            x={PADDING_LEFT}
            y={SVG_HEIGHT - PADDING_BOTTOM + 20}
            textAnchor="start"
            fill="#FFFFFF"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            #1 HARDEST SHOW
          </text>
          <text
            x={SVG_WIDTH - PADDING_RIGHT}
            y={SVG_HEIGHT - PADDING_BOTTOM + 20}
            textAnchor="end"
            fill="#71717A"
            fontSize="11"
            fontFamily="monospace"
          >
            #{totalCount} SHOW
          </text>

          {/* Theoretical Non-Linear Power Curve Line (Stark Monochrome) */}
          <path
            d={curvePointsPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeOpacity="0.8"
            strokeDasharray="6 3"
          />

          {/* Plotted Show Data Points (All Red with Crisp Black Outline) */}
          {filteredShows.map((show) => {
            const { x, y } = getCoordinates(show);
            const isHovered = hoveredShow?.name === show.name;
            const radius = show.tier === 'TIER 1' ? 7 : show.tier === 'TIER 2' ? 6 : 5;

            return (
              <g
                key={show.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredShow(show)}
                onClick={() => setHoveredShow(show)}
              >
                {/* Flat Border Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 4}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
                {/* Main Data Dot (Solid Red - Thin Black Outline) */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="#DC2626"
                  stroke="#000000"
                  strokeWidth="0.75"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredShow && (
          <div className="mt-4 bg-[#181818] border-2 border-white rounded-none p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 inline-block rounded-none bg-red-600"
                ></span>
                <span className="font-display text-2xl font-black text-white uppercase tracking-wider">{hoveredShow.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#080808] text-white border border-[#333] rounded-none font-bold">
                  {hoveredShow.tier}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-mono">
                PROMOTION: <span className="text-white font-bold">{hoveredShow.promotion}</span> • YEAR: <span className="text-white font-bold">{hoveredShow.year}</span> • DATE: <span className="text-white font-bold">{hoveredShow.date}</span>
              </p>
            </div>
            <div className="text-right font-mono bg-[#080808] px-4 py-2 border-2 border-[#262626] rounded-none">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">SHOW DIFFICULTY</div>
              <div className="font-display text-3xl font-black text-white">
                {hoveredShow.difficulty.toFixed(1)} <span className="text-xs font-normal text-zinc-400">/ 1000 PTS</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Show Difficulty Key Benchmark List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
          <span>TOP 5 HARDEST COMPETITIONS IN DATABASE</span>
          <span className="text-white font-black">0 - 1000 PTS BENCHMARK</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          {rawShows.slice(0, 5).map((show, idx) => (
            <div
              key={show.name}
              onClick={() => setHoveredShow(show)}
              className="bg-[#181818] p-3 border-2 border-[#262626] cursor-pointer hover:border-white rounded-none transition-all space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase">
                <span>#{idx + 1} HARDEST</span>
                <span className="text-white font-black">{show.tier}</span>
              </div>
              <div className="font-display text-base font-black text-white truncate uppercase">{show.name}</div>
              <div className="font-display text-3xl font-black text-white">
                {show.difficulty.toFixed(1)} <span className="text-[10px] text-zinc-400 font-normal">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
