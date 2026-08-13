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
      case 'TIER 1': return '#F97316'; // Athletic Orange
      case 'TIER 2': return '#3B82F6'; // Sapphire Blue
      case 'TIER 3': return '#EF4444'; // Crimson Bronze
      case 'TIER 4': return '#06B6D4'; // Cyan Blue
      case 'TIER 5': return '#94A3B8'; // Steel Slate
      default: return '#64748B';
    }
  };

  const topShowName = rawShows[0]?.name || 'Benchmark #1';

  return (
    <div className="bg-[#111827] p-6 md:p-8 rounded-xl border border-[#1E293B] space-y-6 shadow-2xl">
      
      {/* Title & Filter Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dew-green/10 border border-dew-green/30 text-dew-green text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>NON-LINEAR POWER CURVE MODEL (p = 2.5) • {division === 'women' ? "WOMEN'S OPEN" : "MEN'S OPEN"}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white tracking-wide">
            {division === 'women' ? "WOMEN'S" : "MEN'S"} DIFFICULTY <span className="dew-gradient-text">SCALING GRAPH</span>
          </h2>
          <p className="text-gray-300 text-xs font-mono mt-1">
            Visual plot of all {rawShows.length} {division === 'women' ? "Women's" : "Men's"} competitions scaled relative to hardest benchmark ({topShowName} = 1000.0 PTS)
          </p>
        </div>

        {/* Division Switcher & Tier Filter Tabs (Stacked vertically) */}
        <div className="flex flex-col items-start md:items-end gap-2.5">
          {/* Gender / Division Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#0A0E17] p-1.5 rounded-lg border border-[#1E293B] font-mono text-xs">
            <button
              onClick={() => { setDivision('men'); setHoveredShow(null); }}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all ${
                division === 'men'
                  ? 'bg-dew-green text-black font-extrabold shadow-dew-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              MEN'S OPEN
            </button>
            <button
              onClick={() => { setDivision('women'); setHoveredShow(null); }}
              className={`px-3.5 py-1.5 rounded-md font-bold uppercase transition-all ${
                division === 'women'
                  ? 'bg-dew-green text-black font-extrabold shadow-dew-glow'
                  : 'text-gray-400 hover:text-white'
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
                    ? 'bg-dew-green text-black border-dew-green font-extrabold shadow-dew-glow'
                    : 'bg-[#0A0E17] text-gray-300 border-[#1E293B] hover:border-dew-green/50'
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
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter show on graph (e.g. Rogue, WSM, Giants, ESM)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0A0E17] text-white font-mono text-xs rounded-lg pl-10 pr-3 py-2.5 border border-[#1E293B] focus:outline-none focus:border-dew-green transition-all shadow-inner"
        />
      </div>

      {/* SVG Interactive Scatter Plot Graph */}
      <div className="relative bg-[#0A0E17] border border-[#1E293B] rounded-lg p-4 overflow-x-auto shadow-inner">
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
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={PADDING_LEFT - 10}
                  y={y + 4}
                  fill="#94A3B8"
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
          <text x={PADDING_LEFT} y={SVG_HEIGHT - 20} fill="#F97316" fontSize="11" fontFamily="monospace" fontWeight="bold">
            #1 HARDEST SHOW
          </text>
          <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 20} fill="#94A3B8" fontSize="11" fontFamily="monospace" textAnchor="middle">
            COMPETITIONS RANKED BY FIELD STRENGTH (1 TO {totalCount})
          </text>
          <text x={SVG_WIDTH - PADDING_RIGHT} y={SVG_HEIGHT - 20} fill="#94A3B8" fontSize="11" fontFamily="monospace" textAnchor="end">
            #{totalCount} SHOW
          </text>

          {/* Theoretical Non-Linear Power Curve Line */}
          <path
            d={curvePointsPath}
            fill="none"
            stroke="#F97316"
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
                  stroke="#0A0E17"
                  strokeWidth="1.5"
                  className="transition-transform duration-150 hover:scale-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredShow && (
          <div className="mt-4 bg-[#162036] border border-dew-green/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: getTierColor(hoveredShow.tier) }}
                ></span>
                <span className="font-display text-xl font-bold text-white uppercase">{hoveredShow.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0A0E17] text-dew-green border border-[#1E293B]">
                  {hoveredShow.tier}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono">
                PROMOTION: <span className="text-white font-semibold">{hoveredShow.promotion}</span> • YEAR: <span className="text-white font-semibold">{hoveredShow.year}</span> • DATE: <span className="text-white font-semibold">{hoveredShow.date}</span>
              </p>
            </div>
            <div className="text-right font-mono bg-[#0A0E17] px-4 py-2 rounded-md border border-[#1E293B]">
              <div className="text-[10px] text-gray-400">SHOW DIFFICULTY</div>
              <div className="font-display text-3xl font-extrabold text-dew-green">
                {hoveredShow.difficulty.toFixed(1)} <span className="text-xs font-normal text-gray-400">/ 1000 PTS</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Show Difficulty Key Benchmark List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-gray-300 font-bold uppercase">
          <span>TOP 5 HARDEST COMPETITIONS IN DATABASE</span>
          <span className="text-dew-green">SCALED 0 - 1000 PTS</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          {rawShows.slice(0, 5).map((show, idx) => (
            <div
              key={show.name}
              onClick={() => setHoveredShow(show)}
              className="bg-[#162036] p-3 rounded-lg border border-[#1E293B] cursor-pointer hover:border-dew-green/60 shadow-md transition-all space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>#{idx + 1} HARDEST</span>
                <span className="text-dew-green font-bold">{show.tier}</span>
              </div>
              <div className="font-bold text-white truncate text-xs">{show.name}</div>
              <div className="font-display text-2xl font-black text-dew-green">
                {show.difficulty.toFixed(1)} <span className="text-[10px] text-gray-400 font-normal">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
