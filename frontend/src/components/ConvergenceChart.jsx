import React, { useState, useEffect } from 'react';
import { fetchConvergence } from '../api/client';
import { TrendingUp, Activity, Target } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ConvergenceChart({ params }) {
  const [convergenceData, setConvergenceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchConvergence(params);
        if (isMounted) setConvergenceData(data);
      } catch (err) {
        console.error('Convergence analysis error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [params.S, params.K, params.T, params.r, params.sigma, params.option_type]);

  if (loading || !convergenceData) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-spin" />
        Running Convergence Sweeps across N and M parameter spaces...
      </div>
    );
  }

  const { black_scholes_benchmark, binomial_convergence, monte_carlo_convergence } = convergenceData;

  // Chart 1: Binomial Tree Convergence Chart
  const btChartData = {
    labels: binomial_convergence.map(b => `${b.steps} Steps`),
    datasets: [
      {
        label: 'Binomial Tree Price',
        data: binomial_convergence.map(b => b.price),
        borderColor: 'rgb(6, 182, 212)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(6, 182, 212)',
        tension: 0.2
      },
      {
        label: `Black-Scholes Benchmark ($${black_scholes_benchmark})`,
        data: new Array(binomial_convergence.length).fill(black_scholes_benchmark),
        borderColor: 'rgba(234, 179, 8, 0.9)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  // Chart 2: Monte Carlo Convergence & Confidence Band Chart
  const mcChartData = {
    labels: monte_carlo_convergence.map(m => `${(m.simulations / 1000).toFixed(1)}k`),
    datasets: [
      {
        label: 'Monte Carlo Estimate',
        data: monte_carlo_convergence.map(m => m.price),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        tension: 0.1
      },
      {
        label: '95% Upper Bound',
        data: monte_carlo_convergence.map(m => m.ci_upper),
        borderColor: 'rgba(168, 85, 247, 0.3)',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: '+1' // Fill to lower bound
      },
      {
        label: '95% Lower Bound',
        data: monte_carlo_convergence.map(m => m.ci_lower),
        borderColor: 'rgba(168, 85, 247, 0.3)',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false
      },
      {
        label: `Black-Scholes Benchmark ($${black_scholes_benchmark})`,
        data: new Array(monte_carlo_convergence.length).fill(black_scholes_benchmark),
        borderColor: 'rgba(234, 179, 8, 0.9)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(4)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  });

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Algorithm Convergence Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical demonstration of lattice discretization and Monte Carlo law of large numbers
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20">
          Black-Scholes Reference: ${black_scholes_benchmark}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Binomial Tree Convergence Chart */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            Binomial Tree Convergence vs Steps (N)
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Oscillations dampen as discrete step size Δt → 0
          </p>
          <div className="h-64">
            <Line data={btChartData} options={chartOptions('Binomial Tree')} />
          </div>
        </div>

        {/* Monte Carlo Convergence Chart */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            Monte Carlo Convergence vs Sample Size (M)
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Standard error contracts at rate O(1/√M)
          </p>
          <div className="h-64">
            <Line data={mcChartData} options={chartOptions('Monte Carlo')} />
          </div>
        </div>
      </div>
    </div>
  );
}
