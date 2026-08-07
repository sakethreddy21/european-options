import React from 'react';
import { Sliders, RefreshCw, Zap, TrendingUp, DollarSign, Clock, Percent, Activity } from 'lucide-react';

export default function ParameterControls({ params, onChange, onReset, loading }) {
  const handleChange = (field, value) => {
    onChange({ ...params, [field]: value });
  };

  const applyPreset = (preset) => {
    switch (preset) {
      case 'ATM':
        onChange({ ...params, S: 100, K: 100, T: 1.0, r: 0.05, sigma: 0.20 });
        break;
      case 'ITM':
        onChange({ ...params, S: 120, K: 100, T: 1.0, r: 0.05, sigma: 0.20 });
        break;
      case 'OTM':
        onChange({ ...params, S: 80, K: 100, T: 1.0, r: 0.05, sigma: 0.20 });
        break;
      case 'HIGH_VOL':
        onChange({ ...params, S: 100, K: 100, T: 1.0, r: 0.05, sigma: 0.45 });
        break;
      default:
        break;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Option Parameters</h2>
            <p className="text-xs text-slate-400">Configure market conditions and simulation inputs</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reset
        </button>
      </div>

      {/* Option Type Selector (Call / Put) */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Option Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => handleChange('option_type', 'call')}
            className={`py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              params.option_type === 'call'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            CALL OPTION
          </button>
          <button
            onClick={() => handleChange('option_type', 'put')}
            className={`py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              params.option_type === 'put'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 rotate-180" />
            PUT OPTION
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="space-y-4">
        {/* Spot Price (S) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              Spot Price (S₀)
            </span>
            <span className="text-sm font-bold text-indigo-300">${params.S}</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="1"
            value={params.S}
            onChange={(e) => handleChange('S', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="mt-1">
            <input
              type="number"
              value={params.S}
              onChange={(e) => handleChange('S', Math.max(1, parseFloat(e.target.value) || 0))}
              className="glass-input w-full px-3 py-1.5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Strike Price (K) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              Strike Price (K)
            </span>
            <span className="text-sm font-bold text-indigo-300">${params.K}</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="1"
            value={params.K}
            onChange={(e) => handleChange('K', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="mt-1">
            <input
              type="number"
              value={params.K}
              onChange={(e) => handleChange('K', Math.max(1, parseFloat(e.target.value) || 0))}
              className="glass-input w-full px-3 py-1.5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Time to Expiry (T) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Expiration T (Years)
            </span>
            <span className="text-sm font-bold text-indigo-300">{params.T} yr ({Math.round(params.T * 365)} days)</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="3.0"
            step="0.05"
            value={params.T}
            onChange={(e) => handleChange('T', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Volatility (sigma) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Volatility (σ)
            </span>
            <span className="text-sm font-bold text-indigo-300">{Math.round(params.sigma * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.01"
            value={params.sigma}
            onChange={(e) => handleChange('sigma', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Risk-Free Rate (r) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-indigo-400" />
              Risk-Free Rate (r)
            </span>
            <span className="text-sm font-bold text-indigo-300">{(params.r * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.20"
            step="0.005"
            value={params.r}
            onChange={(e) => handleChange('r', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          {/* Binomial Tree Steps */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Binomial Steps (N)</span>
              <span className="text-slate-200 font-semibold">{params.binomial_steps}</span>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={params.binomial_steps}
              onChange={(e) => handleChange('binomial_steps', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Monte Carlo Paths */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Monte Carlo Paths (M)</span>
              <span className="text-slate-200 font-semibold">{params.monte_carlo_simulations.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={params.monte_carlo_simulations}
              onChange={(e) => handleChange('monte_carlo_simulations', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
          Quick Market Scenarios
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => applyPreset('ATM')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-300 text-left transition-all border border-slate-700/50"
          >
            🎯 At-The-Money
          </button>
          <button
            onClick={() => applyPreset('ITM')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-300 text-left transition-all border border-slate-700/50"
          >
            💰 In-The-Money
          </button>
          <button
            onClick={() => applyPreset('OTM')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-300 text-left transition-all border border-slate-700/50"
          >
            📉 Out-Of-The-Money
          </button>
          <button
            onClick={() => applyPreset('HIGH_VOL')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-300 text-left transition-all border border-slate-700/50"
          >
            ⚡ High Volatility
          </button>
        </div>
      </div>
    </div>
  );
}
