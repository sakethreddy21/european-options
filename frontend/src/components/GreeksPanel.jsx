import React from 'react';
import { Activity, ShieldCheck, Zap, Clock, DollarSign } from 'lucide-react';

export default function GreeksPanel({ greeks }) {
  if (!greeks) return null;

  const greekCards = [
    {
      name: 'Delta (Δ)',
      symbol: 'Δ',
      value: greeks.delta.toFixed(4),
      subtext: `Price move for +$1 change in Spot`,
      range: 'Call: [0 to +1] | Put: [-1 to 0]',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
      icon: Activity,
      description: 'Hedge Ratio: Number of shares of underlying stock needed to create a delta-neutral portfolio.'
    },
    {
      name: 'Gamma (Γ)',
      symbol: 'Γ',
      value: greeks.gamma.toFixed(4),
      subtext: `Delta change per +$1 move in Spot`,
      range: 'Always ≥ 0 for long options',
      color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
      icon: ShieldCheck,
      description: 'Curvature Risk: Measures how rapidly Delta changes as stock price fluctuates. Peak at-the-money.'
    },
    {
      name: 'Vega (ν)',
      symbol: 'ν',
      value: `$${greeks.vega.toFixed(4)}`,
      subtext: `Price change for +1% increase in Volatility`,
      range: 'Always ≥ 0 for long options',
      color: 'border-purple-500 text-purple-400 bg-purple-500/10',
      icon: Zap,
      description: 'Volatility Sensitivity: Higher option duration T and higher spot price increase Vega magnitude.'
    },
    {
      name: 'Theta (Θ)',
      symbol: 'Θ',
      value: `$${greeks.theta.toFixed(4)} / day`,
      subtext: `Daily time decay loss`,
      range: 'Annual: $' + greeks.theta_annual.toFixed(2) + '/yr',
      color: 'border-rose-500 text-rose-400 bg-rose-500/10',
      icon: Clock,
      description: 'Time Decay: Quantifies the daily erosion in option value as expiration date T approaches.'
    },
    {
      name: 'Rho (ρ)',
      symbol: 'ρ',
      value: `$${greeks.rho.toFixed(4)}`,
      subtext: `Price change for +1% move in Risk-Free Rate`,
      range: 'Call: Positive | Put: Negative',
      color: 'border-amber-500 text-amber-400 bg-amber-500/10',
      icon: DollarSign,
      description: 'Interest Rate Risk: Measures sensitivity of option price to shifts in the risk-free rate r.'
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          Option Risk Sensitivities (Analytical Greeks)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          First and second-order partial derivatives of Black-Scholes pricing PDE
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {greekCards.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div
              key={idx}
              className={`glass-card p-4 rounded-xl border-t-2 ${g.color.split(' ')[0]} hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">{g.name}</span>
                  <div className={`p-1.5 rounded-lg ${g.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="my-2">
                  <span className="text-2xl font-extrabold font-mono text-slate-100">{g.value}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{g.subtext}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-2">
                <p className="text-[10px] text-slate-400 leading-relaxed">{g.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
