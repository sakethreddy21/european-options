import React, { useState, useEffect } from 'react';
import { fetchPriceComparison } from './api/client';
import ParameterControls from './components/ParameterControls';
import ModelComparison from './components/ModelComparison';
import BinomialTreeVisualizer from './components/BinomialTreeVisualizer';
import MonteCarloChart from './components/MonteCarloChart';
import ConvergenceChart from './components/ConvergenceChart';
import GreeksPanel from './components/GreeksPanel';
import SensitivityHeatmap from './components/SensitivityHeatmap';
import MathEducationalGuide from './components/MathEducationalGuide';

import { Activity, Layers, Cpu, Target, BarChart3, BookOpen, LayoutDashboard, Terminal } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState({
    S: 100.0,
    K: 100.0,
    T: 1.0,
    r: 0.05,
    sigma: 0.20,
    option_type: 'call',
    binomial_steps: 50,
    monte_carlo_simulations: 50000
  });

  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadPriceComparison = async () => {
    setLoading(true);
    try {
      const data = await fetchPriceComparison(params);
      setPriceData(data);
    } catch (err) {
      console.error('Price calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceComparison();
  }, [params.S, params.K, params.T, params.r, params.sigma, params.option_type, params.binomial_steps, params.monte_carlo_simulations]);

  const handleReset = () => {
    setParams({
      S: 100.0,
      K: 100.0,
      T: 1.0,
      r: 0.05,
      sigma: 0.20,
      option_type: 'call',
      binomial_steps: 50,
      monte_carlo_simulations: 50000
    });
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Greeks', icon: LayoutDashboard },
    { id: 'binomial', label: 'Binomial Tree', icon: Layers },
    { id: 'monte_carlo', label: 'Monte Carlo', icon: Cpu },
    { id: 'convergence', label: 'Convergence', icon: Target },
    { id: 'sensitivity', label: 'Sensitivity', icon: BarChart3 },
    { id: 'math_guide', label: 'Math Guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Top Navbar Header */}
      <header className="glass-panel rounded-2xl p-5 shadow-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              EUROPEAN OPTIONS SIMULATOR
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono px-2 py-0.5 rounded-full font-semibold">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Binomial Tree (CRR) • Black-Scholes-Merton • Monte Carlo Simulation (GBM)
            </p>
          </div>
        </div>

        {/* Live Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">FastAPI Backend Active</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Controls + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Parameter Controls (1/4 width) */}
        <div className="lg:col-span-1">
          <ParameterControls
            params={params}
            onChange={setParams}
            onReset={handleReset}
            loading={loading}
          />
        </div>

        {/* Right Column: Tabbed View (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Bar */}
          <div className="glass-panel p-1.5 rounded-2xl border border-slate-800 flex overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Views */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ModelComparison priceData={priceData} params={params} />
              <GreeksPanel greeks={priceData?.greeks} />
            </div>
          )}

          {activeTab === 'binomial' && (
            <BinomialTreeVisualizer params={params} />
          )}

          {activeTab === 'monte_carlo' && (
            <MonteCarloChart params={params} />
          )}

          {activeTab === 'convergence' && (
            <ConvergenceChart params={params} />
          )}

          {activeTab === 'sensitivity' && (
            <SensitivityHeatmap params={params} />
          )}

          {activeTab === 'math_guide' && (
            <MathEducationalGuide />
          )}
        </div>
      </div>
    </div>
  );
}
