import React from 'react';
import { Layers, ShieldCheck, Flame, Trophy, Activity, ArrowUp, X, Calculator, Zap, Users, Info } from 'lucide-react';

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

export default function CompetitionModal({ competition, onClose }) {
  if (!competition) return null;

  const [selectedAthleteMath, setSelectedAthleteMath] = React.useState(null);

  const {
    name,
    contest_name,
    details,
    tier,
    tier_multiplier,
    recency_multiplier,
    difficulty,
    difficulty_score,
    raw_difficulty,
    top_5_finishers,
    results,
    promotion,
    division
  } = competition;

  const showTitle = contest_name || name || 'Competition Breakdown';
  const diffScore = typeof difficulty_score === 'number' ? difficulty_score : (typeof difficulty === 'number' ? difficulty : 0);
  const recMult = typeof recency_multiplier === 'number' ? recency_multiplier : 1.0;
  const tierName = (tier || 'TIER 4').replace('_', ' ');

  // Calculate placement points breakdown for top 5
  const placementPercentages = [
    { rank: 1, label: '1st Place (100.0%)', factor: 1.0 },
    { rank: 2, label: '2nd Place (77.9%)', factor: 0.7788 },
    { rank: 3, label: '3rd Place (60.7%)', factor: 0.6065 },
    { rank: 4, label: '4th Place (47.2%)', factor: 0.4724 },
    { rank: 5, label: '5th Place (36.8%)', factor: 0.3679 },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full sm:h-auto max-w-4xl sm:max-h-[92vh] flex flex-col bg-[#0E0E0E] border-0 sm:border-2 border-[#333333] rounded-none overflow-hidden my-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Accent Line */}
        <div className="h-1.5 w-full bg-red-600 shrink-0"></div>

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#262626] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 truncate pr-2">
            <span className="bg-red-600 text-white font-display text-lg sm:text-xl font-black px-2.5 py-0.5 shrink-0 rounded-none uppercase">
              {tierName}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wider truncate">
              {showTitle}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-[#181818] border border-[#333] hover:border-zinc-500 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-8 font-sans">
          
          {/* Hero Overview Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-[#141414] border-2 border-[#262626]">
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-xs text-zinc-400 uppercase font-bold">
                {promotion && <span className="px-2 py-0.5 bg-[#1c1c1c] border border-[#333] text-zinc-300">{promotion}</span>}
                {division && <span className="px-2 py-0.5 bg-[#1c1c1c] border border-[#333] text-zinc-300">{division.toUpperCase()} OPEN</span>}
                {details && <span className="text-zinc-500">{details}</span>}
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-wider leading-none">
                {showTitle}
              </h2>
            </div>

            {/* Difficulty Score Card */}
            <div className="bg-[#080808] border-2 border-red-600 px-6 py-4 text-center min-w-[180px] w-full sm:w-auto shadow-xl">
              <div className="text-[10px] font-mono text-red-500 font-black uppercase tracking-widest">DIFFICULTY RATING</div>
              <div className="font-display text-4xl sm:text-5xl font-black text-white">
                {diffScore.toFixed(1)} <span className="text-sm font-mono text-zinc-500 font-normal">/ 1000</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Recency Weight: {recMult}x</div>
            </div>
          </div>

          {/* Mathematical Decisioning Steps Grid */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Calculator className="w-5 h-5 text-red-500" />
              <h3 className="font-display text-2xl font-black uppercase tracking-wider">
                DECISIONING MATH & FORMULA BREAKDOWN
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
              
                {/* Step 1: Field Power */}
                <div className="bg-[#121212] p-5 border-2 border-[#262626] space-y-3">
                  <div className="font-display text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-500" /> STEP 1: TOP 5 FIELD POWER
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Difficulty is calculated by measuring the field strength of the <strong>Top 5 athletes</strong> who finished on the podium:
                  </p>
                  
                  {(() => {
                    const top5List = (top_5_finishers && top_5_finishers.length > 0)
                      ? top_5_finishers.map((f, idx) => {
                          if (typeof f === 'object' && f.person_name) return f;
                          const str = String(f);
                          const nameMatch = str.match(/^([^(\[—]+)/);
                          const name = nameMatch ? nameMatch[1].trim() : str;
                          const countryMatch = str.match(/\(([A-Z]{2,3})\)/i);
                          const country = countryMatch ? countryMatch[1].toUpperCase() : '';
                          const powerMatch = str.match(/Power:\s*([\d,.]+)/i);
                          const power = powerMatch ? parseFloat(powerMatch[1].replace(/,/g, '')) : null;
                          const rankMatch = str.match(/#(\d+)/);
                          const rank = rankMatch ? rankMatch[1] : (idx + 1);
                          return { rank, person_name: name, country, power };
                        })
                      : (results || []).filter(r => {
                          const rNum = parseInt(r.rank, 10);
                          return !isNaN(rNum) && rNum >= 1 && rNum <= 5;
                        }).slice(0, 5);

                    if (!top5List || top5List.length === 0) {
                      return <div className="text-zinc-500 font-mono text-[11px]">Top 5 finishers determine the raw field power sum.</div>;
                    }

                    return (
                      <div className="space-y-2 pt-1">
                        {top5List.map((finisher, idx) => {
                          const rNum = parseInt(finisher.rank, 10) || (idx + 1);
                          const powerVal = typeof finisher.power === 'number' ? finisher.power : null;
                          const pctVal = typeof finisher.percent === 'number' ? finisher.percent : (
                            powerVal && typeof raw_difficulty === 'number' && raw_difficulty > 0
                              ? Math.round((powerVal / raw_difficulty) * 1000) / 10
                              : null
                          );

                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedAthleteMath({
                                ...finisher,
                                rNum,
                                powerVal,
                                pctVal,
                                contestName: showTitle
                              })}
                              className="bg-[#0a0a0a] p-3 border border-[#222] hover:border-red-500 hover:bg-[#141414] transition-all cursor-pointer group"
                            >
                              {/* Row 1: Rank Badge & Full Athlete Name */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-1.5 py-0.5 text-[10px] font-black shrink-0 ${
                                  rNum === 1 ? 'bg-yellow-500 text-black' :
                                  rNum === 2 ? 'bg-zinc-300 text-black' :
                                  rNum === 3 ? 'bg-amber-600 text-white' :
                                  'bg-zinc-800 text-zinc-300'
                                }`}>
                                  #{rNum}
                                </span>
                                <span className="font-bold text-white text-xs tracking-wide group-hover:text-red-400 transition-colors">
                                  {finisher.person_name}
                                </span>
                              </div>

                              {/* Row 2: Power Points Contribution */}
                              <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                                <span className="text-zinc-500">Power Contribution:</span>
                                <span className="font-bold text-emerald-400">
                                  +{powerVal !== null ? powerVal.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'} pts
                                </span>
                              </div>

                              {/* Row 3: Progress Bar & Field Percentage */}
                              {pctVal !== null && (
                                <div>
                                  <div className="w-full bg-[#181818] h-1 overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        rNum === 1 ? 'bg-yellow-500' :
                                        rNum === 2 ? 'bg-zinc-300' :
                                        rNum === 3 ? 'bg-amber-500' :
                                        'bg-emerald-500'
                                      }`}
                                      style={{ width: `${Math.min(pctVal, 100)}%` }}
                                    />
                                  </div>
                                  <div className="text-right text-[10px] font-mono text-zinc-400 font-bold mt-1">
                                    {pctVal}% of Field Power
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {typeof raw_difficulty === 'number' && (
                    <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-[#222] flex items-center justify-between">
                      <span>Total Raw Field Power (D_raw):</span>
                      <span className="text-white font-bold">{raw_difficulty.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                    </div>
                  )}
                </div>

              {/* Step 2: Non-Linear Scaling */}
              <div className="bg-[#121212] p-5 border-2 border-[#262626] space-y-3">
                <div className="font-display text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  {competition.isAllTime ? 'STEP 2: ERA-AWARE BENCHMARKING' : 'STEP 2: 5-YEAR POWER-LAW NORMALIZATION'}
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {competition.isAllTime 
                    ? 'Raw field strength is normalized against the peak world championship field of this specific historical era:'
                    : 'Raw field strength is normalized against the active 5-year global 1000-point benchmark:'}
                </p>
                <div className="bg-[#080808] p-3 border border-[#333] font-mono text-[11px] text-white text-center font-bold">
                  Difficulty = 1000 • ( {typeof raw_difficulty === 'number' ? raw_difficulty.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 'D_raw'} / {typeof competition.max_raw_difficulty === 'number' ? competition.max_raw_difficulty.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 'D_max'} )^{competition.isAllTime ? '1.3' : '1.5'}
                </div>
                <div className="text-center font-mono text-xs font-bold text-yellow-400">
                  = {diffScore.toFixed(1)} / 1000 PTS
                </div>
                <p className="text-zinc-500 text-[11px] leading-normal">
                  {competition.isAllTime 
                    ? 'All-Time Model: Evaluates performance relative to the competitive era, ensuring Tier 1 Majors scale authentically across all 45 years.' 
                    : 'Active Model: Guarantees active Tier 1 World Championships scale to 1000 pts with recent 5-year field density.'}
                </p>
              </div>

              {/* Step 3: Points Awarded */}
              <div className="bg-[#121212] p-5 border-2 border-[#262626] space-y-3">
                <div className="font-display text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  {competition.isAllTime ? 'STEP 3: CAREER PLACEMENT POINTS' : 'STEP 3: ACTIVE PLACEMENT POINTS'}
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {competition.isAllTime
                    ? 'In the All-Time GOAT system, points reflect pure career placement without active time-decay (Recency: 1.0x):'
                    : `Athletes earn rolling points based on placement decay multiplied by active recency weight (${recMult}x):`}
                </p>
                <div className="space-y-1 font-mono text-[11px]">
                  {placementPercentages.map(p => (
                    <div key={p.rank} className="flex items-center justify-between text-zinc-300">
                      <span>{p.label}:</span>
                      <span className="text-emerald-400 font-bold">
                        +{(diffScore * p.factor * (competition.isAllTime ? 1.0 : recMult)).toFixed(1)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Full Results Table */}
          {results && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#262626] pb-3">
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-500" /> OFFICIAL CONTEST STANDINGS
                </h3>
                <span className="text-xs font-mono text-zinc-500 font-bold uppercase">
                  {results.length} Competitors
                </span>
              </div>

              <div className="bg-[#121212] border-2 border-[#262626] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#262626] bg-[#181818] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-16">Rank</th>
                        <th className="py-3 px-4">Athlete</th>
                        <th className="py-3 px-4 text-center">Country</th>
                        <th className="py-3 px-4 text-center">Score / Pts</th>
                        <th className="py-3 px-4 text-right">Earned Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F] font-mono text-xs">
                      {results.map((r, idx) => {
                        const rankNum = parseInt(r.rank, 10);
                        const isRanked = !isNaN(rankNum) && rankNum >= 1;
                        const placementFactor = isRanked ? Math.exp(-0.25 * (rankNum - 1)) : 0;
                        const earnedPts = isRanked ? (diffScore * placementFactor * recMult) : 0;

                        return (
                          <tr key={idx} className={`hover:bg-[#1C1C1C] transition-colors ${idx === 0 ? 'bg-yellow-950/10' : ''}`}>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`font-display text-lg font-black ${
                                r.rank === '1' ? 'text-yellow-400' :
                                r.rank === '2' ? 'text-zinc-300' :
                                r.rank === '3' ? 'text-amber-500' : 'text-zinc-500'
                              }`}>
                                #{r.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white uppercase text-sm">
                              {r.person_name}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {r.country && (
                                  <img src={getCountryFlagUrl(r.country)} alt={r.country} className="w-5 h-3.5 object-cover rounded-none border border-zinc-700" />
                                )}
                                <span className="text-zinc-400 font-bold">{r.country || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center text-zinc-300 font-bold">
                              {r.score !== undefined ? `${r.score} pts` : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-display text-xl font-black text-white">
                              {isRanked ? `+${earnedPts.toFixed(1)}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Sticky Footer */}
        <div className="bg-[#0E0E0E] border-t-2 border-[#262626] px-4 sm:px-6 py-3.5 flex justify-between items-center shrink-0">
          <div className="text-xs font-mono text-zinc-500">
            Click anywhere outside or press Close to dismiss.
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-display text-lg font-black tracking-wider hover:bg-zinc-200 transition-all rounded-none uppercase active:scale-95"
          >
            CLOSE BREAKDOWN
          </button>
        </div>

      </div>

      {/* Dedicated Athlete Power Breakdown Modal */}
      {selectedAthleteMath && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAthleteMath(null);
          }}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0E0E0E] border-2 border-red-600 shadow-2xl rounded-none overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent Bar */}
            <div className="h-1.5 w-full bg-red-600 shrink-0"></div>

            {/* Header */}
            <div className="bg-[#121212] border-b border-[#262626] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs font-black shrink-0 ${
                  selectedAthleteMath.rNum === 1 ? 'bg-yellow-500 text-black' :
                  selectedAthleteMath.rNum === 2 ? 'bg-zinc-300 text-black' :
                  selectedAthleteMath.rNum === 3 ? 'bg-amber-600 text-white' :
                  'bg-zinc-800 text-zinc-300'
                }`}>
                  #{selectedAthleteMath.rNum}
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wider">
                    {selectedAthleteMath.person_name}
                  </h3>
                  <p className="font-mono text-xs text-zinc-400">
                    Field Strength Math for <span className="text-white font-bold">{selectedAthleteMath.contestName}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAthleteMath(null)}
                className="p-1.5 text-zinc-400 hover:text-white bg-[#1a1a1a] border border-[#333] hover:border-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
              
              {/* Total Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#141414] border border-[#262626] text-center font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Contest Finish</div>
                  <div className="font-display text-lg font-black text-yellow-400 mt-0.5">Rank #{selectedAthleteMath.rNum}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Individual Power</div>
                  <div className="font-display text-lg font-black text-emerald-400 mt-0.5">
                    +{selectedAthleteMath.powerVal ? selectedAthleteMath.powerVal.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 0} PTS
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Share of Field (D_raw)</div>
                  <div className="font-display text-lg font-black text-white mt-0.5">
                    {selectedAthleteMath.pctVal}% of Field
                  </div>
                </div>
              </div>

              {/* Top 5 Contributing Shows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                  <h4 className="font-display text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Top Contributing Performances (Step-by-Step)
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Placing Base × Tier × Recency × Slot Weight
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedAthleteMath.top_shows && selectedAthleteMath.top_shows.length > 0 ? (
                    selectedAthleteMath.top_shows.map((show, sIdx) => {
                      const baseP = show.basePoints !== undefined ? Number(show.basePoints) : (show.rank === 1 ? 100.0 : Math.round(100.0 * Math.exp(-0.25 * (show.rank - 1)) * 10) / 10);
                      const tierM = show.tierMultiplier !== undefined ? Number(show.tierMultiplier) : 5.0;
                      const recM = show.recencyMultiplier !== undefined ? Number(show.recencyMultiplier) : 5.0;
                      const rawP = show.rawPoints !== undefined ? Number(show.rawPoints) : (show.points || (baseP * tierM * recM));
                      const slotW = show.weight !== undefined ? Number(show.weight) : (1.0 - sIdx * 0.1);
                      const finalWeighted = show.weightedPoints !== undefined ? Number(show.weightedPoints) : (rawP * slotW);

                      return (
                        <div key={sIdx} className="bg-[#121212] p-4 border-2 border-[#262626] space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-[#202020] pb-2">
                            <span className="font-bold text-white text-sm sm:text-base truncate">
                              {sIdx + 1}. {show.contest}
                            </span>
                            <span className="text-yellow-400 font-mono text-xs font-black shrink-0 bg-yellow-950/50 px-2 py-0.5 border border-yellow-800/80">
                              Rank #{show.rank}
                            </span>
                          </div>

                          {/* 4-Step Arithmetic Grid */}
                          <div className="grid grid-cols-4 gap-2 text-center bg-[#0a0a0a] p-2 border border-[#1e1e1e] font-mono text-xs">
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold">1. PLACING</div>
                              <div className="text-white font-bold mt-0.5">{baseP.toFixed(1)} pts</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold">2. TIER</div>
                              <div className="text-white font-bold mt-0.5">× {tierM.toFixed(1)}x</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold">3. RECENCY</div>
                              <div className="text-white font-bold mt-0.5">× {recM.toFixed(1)}x</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-bold">4. SLOT WT</div>
                              <div className="text-amber-400 font-bold mt-0.5">× {(slotW * 100).toFixed(0)}%</div>
                            </div>
                          </div>

                          {/* Step-by-Step Multiplication Equation Line */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono pt-1 text-zinc-300 gap-1 border-t border-[#1a1a1a]">
                            <span className="text-zinc-400">
                              {baseP.toFixed(1)} (Rank #{show.rank}) × {tierM.toFixed(1)}x × {recM.toFixed(1)}x = <strong className="text-white">{rawP.toLocaleString(undefined, { maximumFractionDigits: 1 })} raw pts</strong> × {(slotW * 100).toFixed(0)}%
                            </span>
                            <span className="text-emerald-400 font-black font-mono text-sm shrink-0">
                              = +{finalWeighted.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-500 font-mono text-xs p-4 bg-[#141414] border border-[#222]">
                      Career performances are weighted using a diminishing returns curve [1.00 down to 0.10].
                    </div>
                  )}
                </div>
              </div>

              {/* Step-by-Step Educational Box */}
              <div className="bg-[#141414] p-4 border border-[#262626] text-xs font-sans text-zinc-300 space-y-2">
                <div className="font-mono font-bold text-white uppercase text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span>How Individual Power Points Are Calculated:</span>
                </div>
                <p className="leading-relaxed text-zinc-400">
                  • <strong>Placing Base Points:</strong> Points earned directly from the athlete's finishing rank in that contest (<strong>1st Place = 100.0 pts</strong>, <strong>2nd Place = 77.9 pts</strong>, <strong>3rd Place = 60.7 pts</strong>, etc.).
                </p>
                <p className="leading-relaxed text-zinc-400">
                  • <strong>Tier & Recency Multipliers:</strong> Multiplied by the contest's caliber (<strong>5.0x</strong> for Tier 1 World Majors like WSM, Rogue, ASC) and how recently it occurred (<strong>5.0x</strong> down to 1.0x over 5 years).
                </p>
                <p className="leading-relaxed text-zinc-400">
                  • <strong>Diminishing Slot Weights:</strong> An athlete's top performances are sorted and combined using diminishing weights (<strong>100%</strong> for their #1 best win, <strong>90%</strong> for #2, <strong>80%</strong> for #3, etc.).
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#121212] border-t border-[#262626] px-5 py-3 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedAthleteMath(null)}
                className="px-5 py-2 bg-white text-black font-display text-sm font-black tracking-wider hover:bg-zinc-200 transition-all uppercase"
              >
                CLOSE BREAKDOWN
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
