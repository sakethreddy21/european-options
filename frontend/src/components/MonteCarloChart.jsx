import React, { useState, useEffect } from 'react';
import { fetchMonteCarloPaths } from '../api/client';
import { Cpu, Activity, RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonteCarloChart({ params }) {
  const [pathsData, setPathsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPaths = async () => {
    setLoading(true);
    try {
      const data = await fetchMonteCarloPaths(params);
      setPathsData(data);
    } catch (err) {
      console.error('Monte Carlo paths error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaths();
  }, [params.S, params.K, params.T, params.r, params.sigma, params.option_type]);

  if (loading || !pathsData) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-purple-400 animate-spin" />
        Simulating Geometric Brownian Motion Paths...
      </div>
    );
  }

  const { time_grid, paths, histogram, strike } = pathsData;

  // Chart 1: Time Series Paths Data
  const pathDatasets = paths.slice(0, 30).map((path, idx) => {
    const isITM = path.payoff > 0;
    const color = isITM
      ? `rgba(16, 185, 129, ${0.35 + (idx % 3) * 0.15})`  // emerald
      : `rgba(244, 63, 94, ${0.25 + (idx % 3) * 0.1})`;    // rose
    return {
      label: `Path ${path.path_id}`,
      data: path.prices,
      borderColor: color,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.2,
    };
  });

  // Strike Price Horizontal Benchmark Dataset
  pathDatasets.push({
    label: `Strike Price ($${strike})`,
    data: new Array(time_grid.length).fill(strike),
    borderColor: 'rgba(234, 179, 8, 0.9)',
    borderWidth: 2,
    borderDash: [6, 6],
    pointRadius: 0,
  });

  const lineChartData = {
    labels: time_grid.map(t => `${t}y`),
    datasets: pathDatasets,
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
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
  };

  // Chart 2: Histogram Distribution Data
  const barChartData = {
    labels: histogram.map(h => `$${h.bin_start}-${h.bin_end}`),
    datasets: [
      {
        label: 'Terminal Price Frequency',
        data: histogram.map(h => h.count),
        backgroundColor: histogram.map(h =>
          h.bin_start >= strike ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)'
        ),
        borderColor: histogram.map(h =>
          h.bin_start >= strike ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Frequency: ${context.parsed.y} simulations`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 45 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Monte Carlo Geometric Brownian Motion Trajectories
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sample asset price paths: <span className="text-emerald-400">Green = In-The-Money</span>, <span className="text-rose-400">Red = Out-Of-The-Money</span>
          </p>
        </div>
        <button
          onClick={loadPaths}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Resimulate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajectory Paths Plot (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Asset Price Trajectories S(t) over Expiration Horizon T
          </h3>
          <div className="h-72">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Terminal Price Payoff Histogram (1/3 width) */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Terminal Price S(T) Distribution
          </h3>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
