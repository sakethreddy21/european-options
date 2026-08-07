import React, { useState, useEffect } from 'react';
import { fetchBinomialTree } from '../api/client';
import { Layers, Info, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function BinomialTreeVisualizer({ params }) {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [treeSteps, setTreeSteps] = useState(4);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTree() {
      setLoading(true);
      try {
        const data = await fetchBinomialTree({
          ...params,
          binomial_steps_vis: treeSteps
        });
        if (isMounted) setTreeData(data);
      } catch (err) {
        console.error('Tree visualizer error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTree();
    return () => { isMounted = false; };
  }, [params.S, params.K, params.T, params.r, params.sigma, params.option_type, treeSteps]);

  if (loading || !treeData) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-cyan-400 animate-spin" />
        Generating Binomial Lattice Structure...
      </div>
    );
  }

  const { levels, u, d, p, dt } = treeData;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Cox-Ross-Rubinstein Binomial Lattice Viewer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual forward asset price expansion & backward induction pricing graph
          </p>
        </div>

        {/* Tree Step Depth Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Tree Depth (N):</span>
          <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setTreeSteps(num)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  treeSteps === num
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num} Steps
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calibration Parameters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-slate-400 block">Up Movement (u):</span>
          <span className="text-cyan-400 font-bold text-sm">{u}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Down Movement (d):</span>
          <span className="text-rose-400 font-bold text-sm">{d}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Risk-Neutral Prob (p):</span>
          <span className="text-indigo-400 font-bold text-sm">{p}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Time Step (Δt):</span>
          <span className="text-slate-200 font-bold text-sm">{dt} yr</span>
        </div>
      </div>

      {/* Visual Tree Node Canvas */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[700px] flex justify-between items-center relative py-6 px-4">
          {levels.map((levelNodes, stepIdx) => (
            <div key={stepIdx} className="flex flex-col justify-around items-center h-[380px] z-10">
              <span className="text-[11px] font-bold font-mono text-slate-400 mb-2">
                Step {stepIdx} (t={(stepIdx * dt).toFixed(2)})
              </span>
              
              <div className="flex flex-col justify-between h-full py-2 space-y-3">
                {levelNodes.map((node, nodeIdx) => {
                  const isHovered = selectedNode?.step === stepIdx && selectedNode?.index === nodeIdx;
                  return (
                    <div
                      key={nodeIdx}
                      onMouseEnter={() => setSelectedNode(node)}
                      className={`glass-card p-3 rounded-xl border cursor-pointer transition-all duration-200 w-32 shadow-lg ${
                        isHovered
                          ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105 bg-slate-800'
                          : 'border-slate-700/60 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700/50 pb-1 mb-1 font-mono">
                        <span>Node ({stepIdx},{nodeIdx})</span>
                        <span className="text-cyan-400 flex items-center">
                          {nodeIdx > 0 && <ArrowUpRight className="w-2.5 h-2.5 text-emerald-400" />}
                          {nodeIdx === 0 && <ArrowDownRight className="w-2.5 h-2.5 text-rose-400" />}
                        </span>
                      </div>

                      <div className="space-y-0.5 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Stock S:</span>
                          <span className="font-bold text-slate-100">${node.stock_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Option V:</span>
                          <span className="font-bold text-emerald-400">${node.option_value}</span>
                        </div>
                        {node.delta !== null && (
                          <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800/60">
                            <span className="text-slate-400">Hedge Δ:</span>
                            <span className="text-indigo-300 font-semibold">{node.delta}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Details Legend */}
      {selectedNode && (
        <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-200 font-bold">
                Step {selectedNode.step}, Node {selectedNode.index}:
              </span>
              <span className="text-slate-400 ml-2">
                Underlying Asset Price = <strong className="text-slate-100">${selectedNode.stock_price}</strong> |
                Option Payoff/Value = <strong className="text-emerald-400">${selectedNode.option_value}</strong>
                {selectedNode.delta !== null && (
                  <> | Node Delta = <strong className="text-indigo-400">{selectedNode.delta}</strong></>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
