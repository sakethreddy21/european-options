import React, { useState } from 'react';
import { BookOpen, Award, Layers, Cpu } from 'lucide-react';

export default function MathEducationalGuide() {
  const [activeTab, setActiveTab] = useState('black_scholes');

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Step-by-Step Mathematical Foundations & Code Guide
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete mathematical derivations, stochastic calculus proofs, and code implementations
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('black_scholes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'black_scholes'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Black-Scholes
          </button>
          <button
            onClick={() => setActiveTab('binomial_tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'binomial_tree'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Binomial Tree
          </button>
          <button
            onClick={() => setActiveTab('monte_carlo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'monte_carlo'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Monte Carlo
          </button>
        </div>
      </div>

      {/* Tab 1: Black-Scholes-Merton */}
      {activeTab === 'black_scholes' && (
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="glass-card p-5 rounded-xl border border-emerald-500/30">
            <h3 className="text-base font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              1. The Black-Scholes-Merton PDE & Closed-Form Solution
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Formulated by Fischer Black, Myron Scholes, and Robert Merton (1973), the model assumes stock prices follow Geometric Brownian Motion under continuous risk-neutral measure.
            </p>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2 mb-4">
              <div className="text-slate-400">// Black-Scholes PDE:</div>
              <div>∂V/∂t + ½σ²S²(∂²V/∂S²) + rS(∂V/∂S) - rV = 0</div>
              <div className="text-slate-400 pt-2">// Analytical European Call Formula:</div>
              <div>C(S, t) = S₀·N(d₁) - K·e⁻ʳᵀ·N(d₂)</div>
              <div className="text-slate-400 pt-2">// Analytical European Put Formula:</div>
              <div>P(S, t) = K·e⁻ʳᵀ·N(-d₂) - S₀·N(-d₁)</div>
            </div>

            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">
              Step-by-Step Derivation Breakdown:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-emerald-300">Step 1: Calculate d₁:</strong> Measures standardized distance between spot S₀ and strike K, adjusted for expected drift (r + ½σ²)T:
                <br />
                <code className="text-indigo-300 font-mono bg-slate-900 px-2 py-0.5 rounded inline-block mt-1">
                  d₁ = [ ln(S / K) + (r + 0.5 * σ²) * T ] / [ σ * √T ]
                </code>
              </li>
              <li>
                <strong className="text-emerald-300">Step 2: Calculate d₂:</strong> Adjusts d₁ for total accumulated volatility over horizon T:
                <br />
                <code className="text-indigo-300 font-mono bg-slate-900 px-2 py-0.5 rounded inline-block mt-1">
                  d₂ = d₁ - σ * √T
                </code>
              </li>
              <li>
                <strong className="text-emerald-300">Step 3: Cumulative Distribution Function N(x):</strong> N(d₂) represents the risk-neutral probability that the option finishes in-the-money (S<sub>T</sub> &gt; K).
              </li>
              <li>
                <strong className="text-emerald-300">Step 4: Analytical Greeks:</strong>
                Delta (Δ = N(d₁)), Gamma (Γ = N'(d₁) / [S σ √T]), Vega (ν = S N'(d₁) √T).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Binomial Tree */}
      {activeTab === 'binomial_tree' && (
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="glass-card p-5 rounded-xl border border-cyan-500/30">
            <h3 className="text-base font-bold text-cyan-400 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              2. Cox-Ross-Rubinstein (CRR) Binomial Tree Algorithm
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Discretizes time T into N steps of size Δt = T / N. Asset price moves up by factor u or down by factor d.
            </p>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2 mb-4">
              <div className="text-slate-400">// CRR Parameter Calibration:</div>
              <div>u = exp(σ * √Δt),  d = 1 / u = exp(-σ * √Δt)</div>
              <div className="text-slate-400 pt-2">// Risk-Neutral Probability:</div>
              <div>p = [ exp(r * Δt) - d ] / [ u - d ]</div>
              <div className="text-slate-400 pt-2">// Backward Induction Step (from step N-1 down to 0):</div>
              <div>{"V[i,j] = exp(-r * Δt) * [ p * V[i+1, j+1] + (1 - p) * V[i+1, j] ]"}</div>
            </div>

            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">
              Step-by-Step Execution Workflow:
            </h4>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
              <li>
                <strong className="text-cyan-300">Forward Pass (Tree Construction):</strong> Compute asset price lattice at each node (i, j): {"S[i,j] = S₀ · uʲ · dⁱ⁻ʲ"}.
              </li>
              <li>
                <strong className="text-cyan-300">Boundary Condition at Expiration (i = N):</strong> Evaluate option terminal payoff: {"V[N,j] = max(0, S[N,j] - K)"} for Call.
              </li>
              <li>
                <strong className="text-cyan-300">Backward Pass (Dynamic Programming):</strong> Iterate backwards from i = N-1 to 0, discounting expectations at risk-free rate r.
              </li>
              <li>
                <strong className="text-cyan-300">Node Delta Calculation:</strong> {"Δ[i,j] = (V[i+1, j+1] - V[i+1, j]) / (S[i+1, j+1] - S[i+1, j])"}.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: Monte Carlo */}
      {activeTab === 'monte_carlo' && (
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="glass-card p-5 rounded-xl border border-purple-500/30">
            <h3 className="text-base font-bold text-purple-400 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              3. Monte Carlo Simulation under Geometric Brownian Motion
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Simulates M independent stochastic price paths under the risk-neutral measure using standard normal random draws Z ~ N(0, 1).
            </p>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2 mb-4">
              <div className="text-slate-400">// Stochastic Differential Equation Solution:</div>
              <div>S_T = S₀ * exp( (r - ½σ²)T + σ√T * Z )</div>
              <div className="text-slate-400 pt-2">// Discounted Monte Carlo Estimator:</div>
              <div>{"V_MC = exp(-rT) * (1 / M) * ∑ max(0, S[T,i] - K)"}</div>
              <div className="text-slate-400 pt-2">// Standard Error & 95% Confidence Interval:</div>
              <div>SE = exp(-rT) * (s_payoff / √M)</div>
              <div>95% CI = [ V_MC - 1.96 * SE,  V_MC + 1.96 * SE ]</div>
            </div>

            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">
              Step-by-Step Simulation Routine:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-purple-300">Step 1: Random Variate Generation:</strong> Sample M standard normal random variables Z<sub>i</sub> ~ N(0, 1) via Box-Muller or NumPy vectorization.
              </li>
              <li>
                <strong className="text-purple-300">Step 2: Terminal Asset Price Generation:</strong> Transform Z<sub>i</sub> into S<sub>T, i</sub> using Ito's integral solution.
              </li>
              <li>
                <strong className="text-purple-300">Step 3: Discounted Payoff Averaging:</strong> Evaluate payoff max(S<sub>T, i</sub> - K, 0) and discount back to time t=0 with e⁻ʳᵀ.
              </li>
              <li>
                <strong className="text-purple-300">Step 4: Error Quantification:</strong> Compute sample standard error and 95% confidence bounds to measure simulation convergence precision.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
