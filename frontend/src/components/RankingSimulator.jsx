import React, { useState } from 'react';
import { Sliders, Calculator, CheckCircle2, TrendingDown, HelpCircle, Activity } from 'lucide-react';

export default function RankingSimulator({ formula, setFormula }) {
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getPoints = (rank, type) => {
    if (type === 'INVERSE') {
      return (100 / rank).toFixed(1);
    } else if (type === 'EXPONENTIAL') {
      return (100 * Math.exp(-0.25 * (rank - 1))).toFixed(1);
    } else if (type === 'STANDARD_POINTS') {
      const std = [100, 70, 50, 40, 30, 25, 20, 15, 10, 5];
      return std[rank - 1].toFixed(1);
    }
    return 0;
  };

  return (
    <div className="space-y-10">
      
      {/* Header Banner */}
      <div className="bg-dew-card border border-dew-green/30 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dew-green/10 border border-dew-green/30 text-dew-green text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Calculator className="w-3.5 h-3.5" />
          <span>MATHEMATICAL CURVE ANALYSIS</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase text-white">
          RANKING CURVE <span className="dew-gradient-text">SIMULATOR & ANALYSIS</span>
        </h1>
        <p className="text-gray-300 text-base max-w-3xl mt-2">
          Compare the mathematical point allocation curves for placements 1 through 10.
        </p>
      </div>

      {/* Recommended Standard Math Explanation */}
      <div className="dew-glass-card p-6 md:p-8 rounded-3xl border border-dew-green/40 bg-gradient-to-br from-[#122112] to-[#0A120A] space-y-4">
        <div className="flex items-center space-x-3 text-dew-green">
          <CheckCircle2 className="w-7 h-7" />
          <h2 className="font-display text-3xl font-bold uppercase text-white">
            RECOMMENDED STANDARDS FOR STRONGMAN RANKINGS
          </h2>
        </div>

        <div className="space-y-3 text-sm text-gray-300 leading-relaxed font-sans">
          <p>
            In sports analytics (e.g., Formula 1, ATP Tennis, Chess Elo, and Strongman), ranking algorithms must reward <strong className="text-dew-green">win dominance</strong> while offering meaningful points to all top 10 finishers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              formula === 'INVERSE' ? 'bg-dew-green/10 border-dew-green shadow-dew-glow' : 'bg-[#080D08] border-dew-green/20'
            }`} onClick={() => setFormula('INVERSE')}>
              <div className="text-dew-green font-display text-xl font-bold uppercase">1. INVERSE CURVE (y = 100/x)</div>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Requested default. 1st place gets 100 pts, 2nd gets 50 pts (50% drop), 3rd gets 33.3 pts. Steep initial drop off that heavily favors podium finishes.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              formula === 'EXPONENTIAL' ? 'bg-dew-yellow/10 border-dew-yellow shadow-yellow-glow' : 'bg-[#080D08] border-dew-yellow/20'
            }`} onClick={() => setFormula('EXPONENTIAL')}>
              <div className="text-dew-yellow font-display text-xl font-bold uppercase">2. EXPONENTIAL DECAY</div>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Smooth exponential decay formula 100 &times; e<sup>-0.25(rank - 1)</sup>. Creates a gradual fall-off ensuring 7th-10th places still receive competitive baseline points.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              formula === 'STANDARD_POINTS' ? 'bg-dew-red/10 border-dew-red shadow-red-glow' : 'bg-[#080D08] border-dew-red/20'
            }`} onClick={() => setFormula('STANDARD_POINTS')}>
              <div className="text-dew-red font-display text-xl font-bold uppercase">3. STANDARD PODIUM TABLE</div>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Fixed point table [100, 70, 50, 40, 30, 25, 20, 15, 10, 5]. Similar to Motorsport F1 scoring where 2nd place receives 70% of 1st place points.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Point Distribution Table Comparison */}
      <div className="dew-glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <h3 className="font-display text-2xl font-bold uppercase text-white flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-dew-green" />
          <span>POINTS FINISHING TABLE (1ST - 10TH PLACE)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="bg-[#080D08] text-gray-400 border-b border-dew-green/20">
                <th className="py-3 px-4 text-left">PLACEMENT RANK</th>
                <th className="py-3 px-4 text-dew-green font-bold">INVERSE (y = 100/x)</th>
                <th className="py-3 px-4 text-dew-yellow font-bold">EXPONENTIAL DECAY</th>
                <th className="py-3 px-4 text-dew-red font-bold">STANDARD PODIUM TABLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dew-green/10">
              {ranks.map((r) => (
                <tr key={r} className="hover:bg-dew-card/60">
                  <td className="py-3 px-4 text-left font-bold text-white">
                    Place #{r} {r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : ''}
                  </td>
                  <td className={`py-3 px-4 font-bold ${formula === 'INVERSE' ? 'text-dew-green bg-dew-green/10' : 'text-gray-300'}`}>
                    {getPoints(r, 'INVERSE')} PTS
                  </td>
                  <td className={`py-3 px-4 font-bold ${formula === 'EXPONENTIAL' ? 'text-dew-yellow bg-dew-yellow/10' : 'text-gray-300'}`}>
                    {getPoints(r, 'EXPONENTIAL')} PTS
                  </td>
                  <td className={`py-3 px-4 font-bold ${formula === 'STANDARD_POINTS' ? 'text-dew-red bg-dew-red/10' : 'text-gray-300'}`}>
                    {getPoints(r, 'STANDARD_POINTS')} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
