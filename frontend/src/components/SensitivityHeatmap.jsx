import React, { useState, useEffect } from 'react';
import { fetchSensitivity } from '../api/client';
import { BarChart3, Activity, Grid } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SensitivityHeatmap({ params }) {
  const [sensData, setSensData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSens() {
      setLoading(true);
      try {
        const data = await fetchSensitivity(params);
        if (isMounted) setSensData(data);
      } catch (err) {
        console.error('Sensitivity error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSens();
    return () => { isMounted = false; };
  }, [params.S, params.K, params.T, params.r, params.sigma, params.option_type]);

  if (loading || !sensData) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-emerald-400 animate-spin" />
        Computing Sensitivity Matrix and Heatmaps...
      </div>
    );
  }

  const { spot_sensitivity, volatility_sensitivity, heatmap } = sensData;

  // Chart 1: Spot Price Sensitivity
  const spotChartData = {
    labels: spot_sensitivity.map(s => `$${s.spot}`),
    datasets: [
      {
        label: 'Black-Scholes Price',
        data: spot_sensitivity.map(s => s.black_scholes),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'Binomial Tree Price',
        data: spot_sensitivity.map(s => s.binomial_tree),
        borderColor: 'rgb(6, 182, 212)',
        borderDash: [4, 4],
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  // Chart 2: Volatility Sensitivity
  const volChartData = {
    labels: volatility_sensitivity.map(v => `${v.volatility}%`),
    datasets: [
      {
        label: 'Option Price vs Volatility',
        data: volatility_sensitivity.map(v => v.black_scholes),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#cbd5e1', font: { size: 10 } } }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  };

  // Helper for heatmap cell color intensity
  const allHeatmapValues = heatmap.grid.flatMap(row => heatmap.vols.map(v => row[`vol_${v}`]));
  const maxVal = Math.max(...allHeatmapValues, 1);
  const minVal = Math.min(...allHeatmapValues, 0);

  const getHeatmapBg = (val) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    // Gradient from dark slate to deep purple/emerald
    const red = Math.round(15 + ratio * 80);
    const green = Math.round(23 + ratio * 180);
    const blue = Math.round(42 + ratio * 160);
    return `rgba(${red}, ${green}, ${blue}, 0.65)`;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Parameter Sensitivity Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate how option values respond across continuous ranges of Spot Price and Volatility
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spot Sensitivity Plot */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
            Spot Price (S₀) vs Option Value
          </h3>
          <div className="h-60">
            <Line data={spotChartData} options={chartOptions} />
          </div>
        </div>

        {/* Volatility Sensitivity Plot */}
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
            Volatility (σ) vs Option Value
          </h3>
          <div className="h-60">
            <Line data={volChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 2D Heatmap Grid */}
      <div className="glass-card p-5 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-indigo-400" />
          Option Price Matrix Heatmap (Spot Price vs Volatility)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Horizontal Axis = Volatility σ (%) | Vertical Axis = Spot Price S₀ ($)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-2.5 bg-slate-900/80 text-slate-400 border border-slate-800">Spot \ Vol</th>
                {heatmap.vols.map(v => (
                  <th key={v} className="p-2.5 bg-slate-900/80 text-slate-300 border border-slate-800">
                    {v}% Vol
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.grid.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2.5 font-bold bg-slate-900/80 text-slate-200 border border-slate-800">
                    ${row.spot}
                  </td>
                  {heatmap.vols.map(v => {
                    const val = row[`vol_${v}`];
                    return (
                      <td
                        key={v}
                        style={{ backgroundColor: getHeatmapBg(val) }}
                        className="p-2.5 text-slate-100 font-bold border border-slate-800/80 transition-all hover:scale-105"
                      >
                        ${val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
