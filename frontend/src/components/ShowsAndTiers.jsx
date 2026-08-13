import React from 'react';
import { Layers, ShieldCheck, Flame, Trophy, HelpCircle, Calculator } from 'lucide-react';
import DifficultyGraph from './DifficultyGraph';

export default function ShowsAndTiers({ showsData }) {
  const tiers = [
    {
      tier: 'TIER 1',
      name: 'WORLD CHAMPIONSHIP LEVEL',
      multiplier: '5x Multiplier',
      color: 'border-dew-green text-dew-green bg-dew-green/10',
      badge: 'bg-dew-green text-black',
      description: 'The pinnacle of strongman competitions worldwide. Highest prestige, elite global lineups.',
      shows: [
        "World's Strongest Man (WSM Finals)",
        "Arnold Strongman Classic (ASC Columbus)",
        "Strongest Man on Earth (SMOE / Shaw Classic)",
        "The Rogue Invitational (Rogue Strongman)"
      ]
    },
    {
      tier: 'TIER 2',
      name: 'GIANTS LIVE & WORLD SERIES',
      multiplier: '3x Multiplier',
      color: 'border-dew-yellow text-dew-yellow bg-dew-yellow/10',
      badge: 'bg-dew-yellow text-black',
      description: 'Premier international qualifiers with full cross-continental North American & European fields.',
      shows: [
        "Giants Live World Tour Finals (Glasgow)",
        "Giants Live Strongman Classic (Royal Albert Hall)",
        "Giants Live World Open & Deadlift Championship (Birmingham)",
        "Arnold World Series (Arnold UK, Arnold Europe, Arnold South America, Arnold Australia)"
      ]
    },
    {
      tier: 'TIER 3',
      name: 'CONTINENTAL CHAMPIONSHIPS',
      multiplier: '2x Multiplier',
      color: 'border-dew-red text-dew-red bg-dew-red/10',
      badge: 'bg-dew-red text-white',
      description: 'Prestigious continental championships determining top regional titles.',
      shows: [
        "Europe's Strongest Man (ESM)",
        "North America's Strongest Man (NASM)",
        "Britain's Strongest Man",
        "Official Strongman Games (OSG World Finals)"
      ]
    },
    {
      tier: 'TIER 4',
      name: 'NATIONAL & SCL CIRCUIT / WSM HEATS',
      multiplier: '1x Multiplier',
      color: 'border-blue-500 text-blue-400 bg-blue-950/40',
      badge: 'bg-blue-600 text-white',
      description: 'WSM group heats, SCL main circuit stages, and national championship finals.',
      shows: [
        "WSM Group Stage Heats (Groups 1–5)",
        "Strongman Champions League (SCL) Main Circuit Stages",
        "America's Strongest Man & Major National Titles",
        "Australia's Strongest Man, England's Strongest Man"
      ]
    },
    {
      tier: 'TIER 5',
      name: 'LOW-DIFFICULTY & LOCAL SPECTACLES',
      multiplier: '0.25x Multiplier',
      color: 'border-gray-600 text-gray-400 bg-gray-900/50',
      badge: 'bg-gray-700 text-white',
      description: 'Local town cups, amateur/novice invitationals, regional challenges, and single-lift record events.',
      shows: [
        "Local Town Cups & Regional Spectacles (Achlum, Pehar, Festif, Hero of Baikal)",
        "Amateur & Novice Open Invitationals",
        "Single-Lift Record Championships (World Log Lift & World Deadlift Championships)"
      ]
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* Header Banner */}
      <div className="bg-dew-card border border-dew-green/30 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dew-green/10 border border-dew-green/30 text-dew-green text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>SHOW TIER SYSTEM</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white">
          COMPETITION <span className="dew-gradient-text">TIERS & MULTIPLIERS</span>
        </h1>
        <p className="text-gray-300 text-base max-w-3xl mt-2">
          Every competition in the 2,000+ open-class show dataset is classified into 5 distinct tiers based on prestige, international lineup quality, and field depth.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((t) => (
          <div key={t.tier} className={`dew-glass-card p-6 border-2 ${t.color} space-y-4 rounded-3xl`}>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-xl font-display text-lg font-black ${t.badge}`}>
                {t.tier}
              </span>
              <span className="font-mono text-xs font-bold uppercase px-3 py-1 bg-[#080D08] rounded-xl border border-current">
                {t.multiplier}
              </span>
            </div>

            <div>
              <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                {t.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-1">
                {t.description}
              </p>
            </div>

            <div className="pt-3 border-t border-dew-green/10 space-y-2">
              <div className="text-xs font-mono text-gray-400 font-bold">QUALIFYING EVENTS:</div>
              <ul className="space-y-1.5 font-mono text-xs text-gray-200">
                {t.shows.map((s, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dew-green"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Competition Difficulty Interactive Power Curve Graph */}
      <DifficultyGraph />

      {/* Math & Dynamic Difficulty Formula Section */}
      <div className="dew-glass-card p-8 rounded-3xl border border-dew-green/40 bg-gradient-to-br from-[#0D180D] via-[#142214] to-[#080D08] space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 text-dew-green">
          <Trophy className="w-8 h-8 text-dew-green fill-dew-green/20" />
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white tracking-wide">
              MATH OF DYNAMIC COMPETITION DIFFICULTY
            </h2>
            <p className="text-xs font-mono text-gray-400">
              NON-LINEAR POWER CURVE MODELING (EXPONENT 1.5) • 0 TO 1000 POINTS BENCHMARK
            </p>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          Instead of relying solely on static subjective tier multipliers, every competition’s difficulty is dynamically calculated from the actual strength of its top 5 competing athletes, then scaled using a non-linear power curve.
        </p>

        {/* 3-Step Competition Difficulty Calculation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Step 1 */}
          <div className="bg-[#080D08]/90 rounded-2xl p-5 border border-dew-green/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dew-green font-bold uppercase">STEP 1 • PURE RANKINGS</span>
              <span className="text-xs font-mono text-gray-500">P_pure</span>
            </div>
            <h4 className="font-display text-lg font-bold text-white uppercase">Pure Athlete Base Points</h4>
            <p className="text-xs text-gray-400 font-mono">
              Every competitor is first assigned a baseline "Pure Rank" score based on raw exponential placement decay, show tier, and recency multiplier:
            </p>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-green/20 font-mono text-xs text-dew-green text-center font-bold">
              P_pure = 100 • e^(-0.25 • (Rank - 1)) • Tier_Mult • Recency_Mult
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#080D08]/90 rounded-2xl p-5 border border-dew-yellow/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dew-yellow font-bold uppercase">STEP 2 • RAW FIELD STRENGTH</span>
              <span className="text-xs font-mono text-gray-500">D_raw</span>
            </div>
            <h4 className="font-display text-lg font-bold text-white uppercase">Top 5 Placements Sum</h4>
            <p className="text-xs text-gray-400 font-mono">
              For each competition, we sum the Pure Ranking points of the top 5 finishing competitors to measure lineup depth:
            </p>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-yellow/20 font-mono text-xs text-dew-yellow text-center font-bold">
              D_raw(Show) = Σ (P_pure of Top 5 Competitors)
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#080D08]/90 rounded-2xl p-5 border border-dew-red/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dew-red font-bold uppercase">STEP 3 • POWER CURVE NORMALIZATION</span>
              <span className="text-xs font-mono text-gray-500">Exponent = 1.5</span>
            </div>
            <h4 className="font-display text-lg font-bold text-white uppercase">Non-Linear Difficulty (0 - 1000)</h4>
            <p className="text-xs text-gray-400 font-mono">
              The hardest show (D_max) is benchmarked to 1000 PTS. All other shows scale non-linearly using power exponent 1.5:
            </p>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-red/20 font-mono text-xs text-dew-red text-center font-bold">
              Difficulty(Show) = 1000 • ( D_raw / D_max )^1.5
            </div>
          </div>

        </div>

        {/* Difficulty Scale Impact Examples */}
        <div className="bg-[#080D08] p-5 rounded-2xl border border-dew-green/20 space-y-3 font-mono text-xs">
          <div className="text-dew-green font-bold uppercase tracking-wider flex items-center justify-between">
            <span>SHOW DIFFICULTY SCALING EXAMPLES (EXPONENT 1.5)</span>
            <span className="text-gray-500 font-normal">BENCHMARK MAX = 1000 PTS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-green/30">
              <div className="text-gray-400 text-[10px]">PREMIER CHAMPIONSHIPS</div>
              <div className="font-display text-xl font-bold text-dew-green">750 - 1000 PTS</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Rogue, WSM, SMOE, ASC</div>
            </div>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-yellow/30">
              <div className="text-gray-400 text-[10px]">GIANTS LIVE & SERIES</div>
              <div className="font-display text-xl font-bold text-dew-yellow">450 - 620 PTS</div>
              <div className="text-[10px] text-gray-500 mt-0.5">World Finals, Strongman Classic</div>
            </div>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-dew-red/30">
              <div className="text-gray-400 text-[10px]">CONTINENTAL SHOWS</div>
              <div className="font-display text-xl font-bold text-dew-red">150 - 300 PTS</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Europe's & North America's</div>
            </div>
            <div className="bg-[#0D140D] p-3 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-[10px]">REGIONAL / LOW TIER</div>
              <div className="font-display text-xl font-bold text-gray-300">1 - 50 PTS</div>
              <div className="text-[10px] text-gray-500 mt-0.5">SCL Circuit & Local Spectacles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Total Score Formula Card */}
      <div className="dew-glass-card p-8 rounded-3xl border border-dew-green/40 bg-gradient-to-br from-[#0B150B] via-[#101C10] to-[#060A06] space-y-4 shadow-2xl">
        <div className="flex items-center space-x-3 text-dew-green">
          <Calculator className="w-7 h-7 text-dew-green" />
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white tracking-wide">
              ATHLETE TOTAL RANKING SCORE FORMULA
            </h2>
            <p className="text-xs font-mono text-gray-400">
              DIMINISHING MARGINAL TOP-10 RESULTS VECTOR (W_1 to W_10)
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-300">
          For each event entered, an athlete earns points determined by the show's Dynamic Difficulty, placement rank decay, and event recency multiplier:
        </p>

        <div className="bg-[#080D08] p-4 rounded-2xl border border-dew-green/30 font-mono text-xs text-dew-green text-center font-bold">
          Earned Points = Difficulty(Show) • e^(-0.25 • (Rank - 1)) • Recency_Mult
        </div>

        <p className="text-xs text-gray-400 font-mono">
          An athlete's total ranking score is computed by sorting all their earned show points in descending order and applying the Top 10 diminishing marginal weights vector:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center text-xs">
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-green/30">
            <div className="text-[10px] text-gray-400">1ST BEST</div>
            <div className="font-bold text-dew-green">100% (1.0)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-green/30">
            <div className="text-[10px] text-gray-400">2ND BEST</div>
            <div className="font-bold text-dew-green">85% (0.85)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-green/30">
            <div className="text-[10px] text-gray-400">3RD BEST</div>
            <div className="font-bold text-dew-green">70% (0.70)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-yellow/30">
            <div className="text-[10px] text-gray-400">4TH BEST</div>
            <div className="font-bold text-dew-yellow">55% (0.55)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-yellow/30">
            <div className="text-[10px] text-gray-400">5TH BEST</div>
            <div className="font-bold text-dew-yellow">40% (0.40)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-red/30">
            <div className="text-[10px] text-gray-400">6TH BEST</div>
            <div className="font-bold text-dew-red">30% (0.30)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-dew-red/30">
            <div className="text-[10px] text-gray-400">7TH BEST</div>
            <div className="font-bold text-dew-red">20% (0.20)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-orange-500/30">
            <div className="text-[10px] text-gray-400">8TH BEST</div>
            <div className="font-bold text-orange-400">15% (0.15)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-gray-700">
            <div className="text-[10px] text-gray-400">9TH BEST</div>
            <div className="font-bold text-gray-300">10% (0.10)</div>
          </div>
          <div className="bg-[#080D08] p-2.5 rounded-xl border border-gray-700">
            <div className="text-[10px] text-gray-400">10TH BEST</div>
            <div className="font-bold text-gray-400">5% (0.05)</div>
          </div>
        </div>

        <div className="bg-[#080D08] p-3.5 rounded-2xl border border-dew-green/40 font-mono text-xs text-dew-green text-center font-bold">
          Total Score = Σ [ W_i • Earned_Points_i ] (for top 10 results)
        </div>
      </div>

      {/* Recency Multiplier Info Box */}
      <div className="dew-glass-card p-8 rounded-3xl border border-dew-yellow/30 bg-gradient-to-r from-[#141F14] to-[#0A120A] space-y-4">
        <div className="flex items-center space-x-3 text-dew-yellow">
          <Flame className="w-7 h-7 text-dew-red fill-dew-red" />
          <h2 className="font-display text-3xl font-extrabold uppercase text-white">
            60-MONTH (5-YEAR) SMOOTH RECENCY DECAY CURVE
          </h2>
        </div>
        <p className="text-sm text-gray-300">
          To prioritize current form while giving fair credit for 5-year legacy achievements, a 60-month active window applies smooth recency decay:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono text-center">
          <div className="bg-[#080D08] p-3 rounded-2xl border border-dew-green/30">
            <div className="text-xs text-gray-400">0 - 12 MONTHS</div>
            <div className="font-display text-2xl font-black text-dew-green">5.0x</div>
            <div className="text-[10px] text-gray-500 mt-1">100% Weight</div>
          </div>
          <div className="bg-[#080D08] p-3 rounded-2xl border border-dew-yellow/30">
            <div className="text-xs text-gray-400">12 - 24 MONTHS</div>
            <div className="font-display text-2xl font-black text-dew-yellow">3.0x</div>
            <div className="text-[10px] text-gray-500 mt-1">60% Weight</div>
          </div>
          <div className="bg-[#080D08] p-3 rounded-2xl border border-dew-red/30">
            <div className="text-xs text-gray-400">24 - 36 MONTHS</div>
            <div className="font-display text-2xl font-black text-dew-red">1.0x</div>
            <div className="text-[10px] text-gray-500 mt-1">20% Weight</div>
          </div>
          <div className="bg-[#080D08] p-3 rounded-2xl border border-orange-500/30">
            <div className="text-xs text-gray-400">36 - 48 MONTHS</div>
            <div className="font-display text-2xl font-black text-orange-400">0.5x</div>
            <div className="text-[10px] text-gray-500 mt-1">10% Weight</div>
          </div>
          <div className="bg-[#080D08] p-3 rounded-2xl border border-gray-700">
            <div className="text-xs text-gray-400">48 - 60 MONTHS</div>
            <div className="font-display text-2xl font-black text-gray-400">0.25x</div>
            <div className="text-[10px] text-gray-500 mt-1">5% Weight</div>
          </div>
        </div>
      </div>

    </div>
  );
}
