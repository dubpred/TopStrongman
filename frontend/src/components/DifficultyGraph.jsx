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
      case 'TIER 1': return '#F59E0B'; // Championship Amber Gold
      case 'TIER 2': return '#E2E8F0'; // Sterling Silver/Platinum
      case 'TIER 3': return '#D97706'; // Bronze/Copper
      case 'TIER 4': return '#64748B'; // Steel Slate
      case 'TIER 5': return '#475569'; // Muted Charcoal
      default: return '#64748B';
    }
  };

  const topShowName = rawShows[0]?.name || 'Benchmark #1';

  return (
    <div className="bg-[#131720] p-6 md:p-8 rounded-xl border border-[#1E2535] space-y-6 shadow-2xl">
      
      {/* Title & Filter Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2535] pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>NON-LINEAR POWER CURVE MODEL (p = 2.5) • {division === 'women' ? "WOMEN'S OPEN" : "MEN'S OPEN"}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-slate-100 tracking-wide">
            {division === 'women' ? "WOMEN'S" : "MEN'S"} DIFFICULTY <span className="dew-gradient-text">SCALING GRAPH</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Visual plot of all {rawShows.length} {division === 'women' ? "Women's" : "Men's"} competitions scaled relative to hardest benchmark ({topShowName} = 1000.0 PTS)
          </p>
        </div>

        {/* Division Switcher & Tier Filter Tabs (Stacked vertically) */}
        <div className="flex flex-col items-start md:items-end gap-2.5">
          {/* Gender / Division Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#0B0D11] p-1.5 rounded-lg border border-[#1E2535] font-mono text-xs">
            <button
              onClick={() => { setDivision('men'); setHoveredShow(null); }}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all ${
                division === 'men'
                  ? 'bg-amber-500 text-black font-extrabold shadow-dew-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MEN'S OPEN
            </button>
            <button
              onClick={() => { setDivision('women'); setHoveredShow(null); }}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all ${
                division === 'women'
                  ? 'bg-amber-500 text-black font-extrabold shadow-dew-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WOMEN'S OPEN
            </button>
          </div>

          {/* Tier Filter Tabs (Positioned directly under Gender Picker) */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {['ALL', 'TIER 1', 'TIER 2', 'TIER 3', 'TIER 4', 'TIER 5'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all border text-[11px] ${
                  selectedTier === t
                    ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-dew-glow'
                    : 'bg-[#0B0D11] text-slate-300 border-[#1E2535] hover:border-amber-500/50'
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
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter show on graph (e.g. Rogue, WSM, Giants, ESM)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0B0D11] text-slate-100 font-mono text-xs rounded-lg pl-10 pr-3 py-2.5 border border-[#1E2535] focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500 shadow-inner"
        />
      </div>

      {/* SVG Interactive Scatter Plot Graph */}
      <div className="relative bg-[#0B0D11] border border-[#1E2535] rounded-lg p-4 overflow-x-auto shadow-inner">
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
                  stroke="#1E2535"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  fill="#64748B"
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
          <text x={PADDING_LEFT} y={SVG_HEIGHT - 20} fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">
            #1 HARDEST SHOW
          </text>
          <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 20} fill="#64748B" fontSize="11" fontFamily="monospace" textAnchor="middle">
            COMPETITIONS RANKED BY FIELD STRENGTH (1 TO {totalCount})
          </text>
          <text x={SVG_WIDTH - PADDING_RIGHT} y={SVG_HEIGHT - 20} fill="#64748B" fontSize="11" fontFamily="monospace" textAnchor="end">
            #{totalCount} SHOW
          </text>

          {/* Theoretical Non-Linear Power Curve Line */}
          <path
            d={curvePointsPath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeOpacity="0.5"
            strokeDasharray="6 3"
          />

          {/* Plotted Show Data Points */}
          {filteredShows.map((show) => {
            const { x, y } = getCoordinates(show);
            const color = getTierColor(show.tier);
            const isHovered = hoveredShow?.name === show.name;
            const radius = show.tier === 'TIER 1' ? 7 : show.tier === 'TIER 2' ? 6 : 5;

            return (
              <g
                key={show.name}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredShow(show)}
                onClick={() => setHoveredShow(show)}
              >
                {/* Glow Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + 6}
                    fill={color}
                    fillOpacity="0.30"
                    stroke={color}
                    strokeWidth="1.5"
                  />
                )}
                {/* Main Data Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  stroke="#0B0D11"
                  strokeWidth="1.5"
                  className="transition-transform duration-150 hover:scale-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredShow && (
          <div className="mt-4 bg-[#181E2B] border border-amber-500/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: getTierColor(hoveredShow.tier) }}
                ></span>
                <span className="font-display text-xl font-bold text-slate-100 uppercase">{hoveredShow.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0B0D11] text-amber-400 border border-[#1E2535]">
                  {hoveredShow.tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                PROMOTION: <span className="text-slate-100 font-semibold">{hoveredShow.promotion}</span> • YEAR: <span className="text-slate-100 font-semibold">{hoveredShow.year}</span> • DATE: <span className="text-slate-100 font-semibold">{hoveredShow.date}</span>
              </p>
            </div>
            <div className="text-right font-mono bg-[#0B0D11] px-4 py-2 rounded-md border border-[#1E2535]">
              <div className="text-[10px] text-slate-400">SHOW DIFFICULTY</div>
              <div className="font-display text-3xl font-extrabold text-amber-400">
                {hoveredShow.difficulty.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 1000 PTS</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Show Difficulty Key Benchmark List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold uppercase">
          <span>TOP 5 HARDEST COMPETITIONS IN DATABASE</span>
          <span className="text-amber-400">SCALED 0 - 1000 PTS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          {rawShows.slice(0, 5).map((show, idx) => (
            <div
              key={show.name}
              onClick={() => setHoveredShow(show)}
              className="bg-[#181E2B] p-3 rounded-lg border border-[#1E2535] cursor-pointer hover:border-amber-500/60 shadow-md transition-all space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>#{idx + 1} HARDEST</span>
                <span className="text-amber-400 font-bold">{show.tier}</span>
              </div>
              <div className="font-bold text-slate-100 truncate text-xs">{show.name}</div>
              <div className="font-display text-2xl font-black text-amber-400">
                {show.difficulty.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
