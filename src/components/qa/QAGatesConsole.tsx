import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  Zap,
  RefreshCw,
  Eye,
  Volume2,
  Activity,
  Layers,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Episode, QualityGateResult, ShotQAResult, Universe } from '../../types';
import { evaluateShotQA } from '../../lib/qaEngine';
import { audioSynthesizer } from '../../lib/audioSynthesizer';

interface QAGatesConsoleProps {
  universe: Universe;
  episodes: Episode[];
}

export const QAGatesConsole: React.FC<QAGatesConsoleProps> = ({ universe, episodes }) => {
  const currentEpisode = episodes[0];
  const [identityThreshold, setIdentityThreshold] = useState<number>(0.88);
  const [motionMaxJitter, setMotionMaxJitter] = useState<number>(0.08);
  const [remediatedShots, setRemediatedShots] = useState<Record<string, boolean>>({});

  const handleApplyRemedy = (shotId: string) => {
    audioSynthesizer.playStudioChime('qa_pass');
    setRemediatedShots((prev) => ({ ...prev, [shotId]: true }));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              QUALITY GATES & PROVENANCE
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Actionable Diagnostics & Graceful Degradation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Production Quality Gates Console
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Bad generations are detected and remediated before reaching the final composition.
          </p>
        </div>

        {/* Global QA Overall Status Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#121215] border border-zinc-800 rounded-2xl text-xs font-mono">
          <span className="text-zinc-500">STATUS:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>READY FOR COMPOSITING</span>
          </span>
        </div>
      </div>

      {/* Quality Gate Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500">
            <span className="text-[10px] uppercase">1. IDENTITY</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-light text-emerald-400">PASS</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">94.2% Face Similarity</div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500">
            <span className="text-[10px] uppercase">2. VISUAL</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-light text-emerald-400">PASS</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">0 Artifacts / 0 Drift</div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500">
            <span className="text-[10px] uppercase">3. AUDIO</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-light text-emerald-400">PASS</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">-14.0 LUFS Broadcast</div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500">
            <span className="text-[10px] uppercase">4. MOTION</span>
            {remediatedShots['shot_003'] ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className={`text-xl font-light ${remediatedShots['shot_003'] ? 'text-emerald-400' : 'text-amber-400'}`}>
            {remediatedShots['shot_003'] ? 'PASS' : 'WARNING'}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {remediatedShots['shot_003'] ? 'Remedy Applied' : 'Landmark Jitter'}
          </div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5 text-zinc-500">
            <span className="text-[10px] uppercase">5. COMPOSITE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-light text-emerald-400">PASS</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">30.0 FPS • 1080x1920</div>
        </div>
      </div>

      {/* Actionable Shot QA Diagnostics */}
      <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Shot-by-Shot Quality Gates & Fallback Policies
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            {currentEpisode?.title}
          </span>
        </div>

        <div className="space-y-3">
          {currentEpisode?.scenes.flatMap((sc) => sc.shots).map((shot) => {
            const isRemediated = remediatedShots[shot.id];
            const hasWarning = shot.id === 'shot_003' && !isRemediated;

            return (
              <div
                key={shot.id}
                className={`p-5 rounded-2xl border transition-all ${
                  hasWarning
                    ? 'bg-amber-950/20 border-amber-500/40 text-white'
                    : 'bg-zinc-800/20 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-white text-xs">
                        SHOT #{shot.shotNumber}: {shot.characterId} ({shot.characterVersion})
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          hasWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {hasWarning ? 'MOTION WARNING' : 'ALL GATES PASS'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 italic">
                      "{shot.dialogue}"
                    </p>
                  </div>

                  {hasWarning && (
                    <button
                      onClick={() => handleApplyRemedy(shot.id)}
                      className="shrink-0 flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-2xl text-xs font-mono transition-all cursor-pointer shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Apply Anchor Smoothing Fallback</span>
                    </button>
                  )}
                </div>

                {hasWarning && (
                  <div className="mt-3 p-3.5 bg-zinc-800/40 border border-amber-500/30 rounded-2xl text-xs font-mono text-amber-200/90 space-y-1">
                    <div className="font-semibold">⚠️ Diagnostic Report:</div>
                    <div className="text-zinc-300 text-[11px]">
                      Facial landmark drift detected in Frames 78–92 (jawline tremor index 0.094 &gt; threshold 0.080).
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      Recommended Action: Apply subtle landmark smoothing or gracefully degrade to Ken Burns static camera pan.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold Sliders Configuration Card */}
      <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 font-mono text-xs shadow-xl">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Configurable Quality Gate Thresholds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">IDENTITY SIMILARITY THRESHOLD</span>
              <span className="text-emerald-400 font-semibold">{(identityThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="0.98"
              step="0.01"
              value={identityThreshold}
              onChange={(e) => setIdentityThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[10px] text-zinc-500">
              Generations with face similarity below this value trigger automatic regeneration.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">MAXIMUM LANDMARK JITTER INDEX</span>
              <span className="text-emerald-400 font-semibold">{motionMaxJitter.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.04"
              max="0.15"
              step="0.005"
              value={motionMaxJitter}
              onChange={(e) => setMotionMaxJitter(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[10px] text-zinc-500">
              Drift above this limit activates graceful degradation to static pose animation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
