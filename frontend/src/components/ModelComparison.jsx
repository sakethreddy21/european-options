import React from 'react';
import { Award, Layers, Cpu, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ModelComparison({ priceData, params }) {
  if (!priceData) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        Loading model price estimates...
      </div>
    );
  }

  const { black_scholes, binomial_tree, monte_carlo, computation_time_ms } = priceData;
  const bsPrice = black_scholes.price;

  // Calculate percentage errors relative to Black-Scholes benchmark
  const btDiff = Math.abs(binomial_tree.price - bsPrice);
  const btPctErr = bsPrice > 0 ? (btDiff / bsPrice) * 100 : 0;

  const mcDiff = Math.abs(monte_carlo.price - bsPrice);
  const mcPctErr = bsPrice > 0 ? (mcDiff / bsPrice) * 100 : 0;

  const isMcInCi = bsPrice >= monte_carlo.ci_lower && bsPrice <= monte_carlo.ci_upper;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Model Price Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side evaluation of Analytical, Lattice, and Stochastic pricing algorithms
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          {params.option_type.toUpperCase()} OPTION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Black-Scholes Model Card */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Black-Scholes-Merton
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              Analytical Closed-Form
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              ${bsPrice.toFixed(4)}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Exact Theoretical Benchmark</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">d₁ parameter:</span>
              <span className="text-slate-200 font-mono">{black_scholes.d1.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">d₂ parameter:</span>
              <span className="text-slate-200 font-mono">{black_scholes.d2.toFixed(4)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Latency:
              </span>
              <span className="text-emerald-400 font-mono font-bold">{computation_time_ms.black_scholes} ms</span>
            </div>
          </div>
        </div>

        {/* 2. Binomial Tree Model Card */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-cyan-500 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Binomial Tree (CRR)
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
              {params.binomial_steps} Steps
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              ${binomial_tree.price.toFixed(4)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold ${btPctErr < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {btPctErr.toFixed(3)}% diff from BS
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Up Factor (u):</span>
              <span className="text-slate-200 font-mono">{binomial_tree.u.toFixed(5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Down Factor (d):</span>
              <span className="text-slate-200 font-mono">{binomial_tree.d.toFixed(5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Risk-Neutral (p):</span>
              <span className="text-slate-200 font-mono">{binomial_tree.p.toFixed(5)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Latency:
              </span>
              <span className="text-cyan-400 font-mono font-bold">{computation_time_ms.binomial_tree} ms</span>
            </div>
          </div>
        </div>

        {/* 3. Monte Carlo Model Card */}
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-purple-500 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Monte Carlo (GBM)
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full font-mono">
              {params.monte_carlo_simulations.toLocaleString()} Paths
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              ${monte_carlo.price.toFixed(4)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs font-semibold ${mcPctErr < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                ±${monte_carlo.standard_error.toFixed(4)} SE
              </span>
              {isMcInCi ? (
                <span className="flex items-center gap-0.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> In 95% CI
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[11px] text-amber-400 font-medium">
                  <AlertCircle className="w-3 h-3" /> Outside CI
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">95% CI Lower:</span>
              <span className="text-slate-200 font-mono">${monte_carlo.ci_lower.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">95% CI Upper:</span>
              <span className="text-slate-200 font-mono">${monte_carlo.ci_upper.toFixed(4)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Latency:
              </span>
              <span className="text-purple-400 font-mono font-bold">{computation_time_ms.monte_carlo} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
