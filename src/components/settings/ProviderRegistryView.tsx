import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ExecutionPolicy } from '../../types';

export const ProviderRegistryView: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<ExecutionPolicy>('balanced');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              INFRASTRUCTURE REGISTRY
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Interchangeable Adapters
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Provider Routing & Execution Policies
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            TSICVIDIA decouples canonical character state from AI generation backends.
          </p>
        </div>
      </div>

      {/* Policy Selection Cards */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-semibold text-white uppercase">
          Select Active Execution Policy:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          {[
            {
              id: 'balanced' as ExecutionPolicy,
              title: 'Balanced',
              desc: 'Optimal tradeoff between speed, fidelity, and cost.',
              cost: '~$0.045 / shot',
            },
            {
              id: 'quality_first' as ExecutionPolicy,
              title: 'Quality First',
              desc: 'Maximum resolution, high step diffusion, highest voice stability.',
              cost: '~$0.082 / shot',
            },
            {
              id: 'speed_first' as ExecutionPolicy,
              title: 'Speed First',
              desc: 'Turbo diffusion models, lower inference latency for quick reviews.',
              cost: '~$0.021 / shot',
            },
            {
              id: 'budget_first' as ExecutionPolicy,
              title: 'Budget First',
              desc: 'Aggressive asset reuse and cached keyframe recycling.',
              cost: '~$0.012 / shot',
            },
          ].map((pol) => {
            const isSel = selectedPolicy === pol.id;
            return (
              <div
                key={pol.id}
                onClick={() => setSelectedPolicy(pol.id)}
                className={`p-5 rounded-[32px] border transition-all cursor-pointer space-y-2 shadow-xl ${
                  isSel
                    ? 'bg-zinc-800/40 border-indigo-500 text-white'
                    : 'bg-[#121215] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{pol.title}</span>
                  {isSel && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-zinc-300 font-sans">{pol.desc}</p>
                <div className="text-[10px] text-emerald-400 pt-1 font-mono">
                  {pol.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Adapter Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 font-mono text-xs shadow-xl">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Registered Backend Adapters
        </h2>

        <div className="space-y-3">
          <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Flux.1-Dev Adapter (Visual Engine)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">High-fidelity 2048px character keyframes with LoRA injection</div>
            </div>
            <span className="text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium">ACTIVE ROUTE</span>
          </div>

          <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-white font-medium">ElevenLabs Multilingual Engine (Voice Engine)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Canonical voice cloning with 24-bit audio normalization</div>
            </div>
            <span className="text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium">ACTIVE ROUTE</span>
          </div>

          <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-white font-medium">LivePortrait Adapter (Motion Engine)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Deterministic facial landmark tracking and lip-syncing</div>
            </div>
            <span className="text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium">ACTIVE ROUTE</span>
          </div>

          <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Gemini 3.7 Flash Engine (Script & Compiler AI)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Server-side structured JSON script and scene breakdowns</div>
            </div>
            <span className="text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium">ACTIVE ROUTE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
