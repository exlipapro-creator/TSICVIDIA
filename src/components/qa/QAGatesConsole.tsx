import React, { useState, useMemo } from 'react';
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
  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const currentEpisode = episodes.find((e) => e.id === selectedEpId) || episodes[0];
  const [identityThreshold, setIdentityThreshold] = useState<number>(0.88);
  const [motionMaxJitter, setMotionMaxJitter] = useState<number>(0.08);
  const [remediatedShots, setRemediatedShots] = useState<Record<string, boolean>>({});

  const handleApplyRemedy = (shotId: string) => {
    audioSynthesizer.playStudioChime('qa_pass');
    setRemediatedShots((prev) => ({ ...prev, [shotId]: true }));
  };

  const allShots = currentEpisode?.scenes.flatMap((sc) => sc.shots) || [];

  // Compute live QA results for each shot
  const shotQAMap: Record<string, { result: ShotQAResult; isRemediated: boolean }> = useMemo(() => {
    const map: Record<string, { result: ShotQAResult; isRemediated: boolean }> = {};
    allShots.forEach((shot) => {
      const char = universe.characters.find((c) => c.id === shot.characterId) || universe.characters[0];
      const customProfile = {
        identityThreshold,
        allowedPoseVariance: 0.12,
        paletteDriftMax: 0.05,
        landmarkDriftMax: motionMaxJitter,
        lufsTarget: -14.0,
        maxLipSyncDiscrepancyMs: 40,
      };

      const result = evaluateShotQA({
        shotId: shot.id,
        characterName: char?.name || 'Actor',
        characterVersion: shot.characterVersion || 'v1.0',
        poseId: shot.poseId,
        expressionId: shot.expressionId,
        dialogue: shot.dialogue,
        motionPreset: shot.motionPreset,
        duration: shot.duration,
        customQAProfile: customProfile,
      });

      const isRemediated = Boolean(remediatedShots[shot.id]);
      if (isRemediated) {
        result.motionStatus = 'PASS';
        result.overallStatus = result.identityStatus === 'WARNING' ? 'WARNING' : 'PASS';
      }

      map[shot.id] = { result, isRemediated };
    });
    return map;
  }, [allShots, universe.characters, identityThreshold, motionMaxJitter, remediatedShots]);

  const qaItems = Object.values(shotQAMap) as Array<{ result: ShotQAResult; isRemediated: boolean }>;
  const hasAnyWarnings = qaItems.some((item) => item.result.overallStatus !== 'PASS');
  const avgIdentity = allShots.length > 0
    ? (allShots.reduce((acc, s) => acc + (shotQAMap[s.id]?.result.identityScore || 0.94), 0) / allShots.length) * 100
    : 94.2;

  const motionWarningsCount = qaItems.filter(
    (item) => item.result.motionStatus !== 'PASS' && !item.isRemediated
  ).length;

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
          {hasAnyWarnings ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>{motionWarningsCount} REMEDIATIONS AVAILABLE</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>READY FOR COMPOSITING</span>
            </span>
          )}
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
          <div className="text-[10px] text-zinc-500 mt-0.5">{avgIdentity.toFixed(1)}% Face Similarity</div>
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
            {motionWarningsCount === 0 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className={`text-xl font-light ${motionWarningsCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {motionWarningsCount === 0 ? 'PASS' : 'WARNING'}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {motionWarningsCount === 0 ? 'All Anchors Locked' : `${motionWarningsCount} Landmark Drift`}
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
          {allShots.map((shot) => {
            const qaData = shotQAMap[shot.id];
            const isRemediated = qaData?.isRemediated || false;
            const qaResult = qaData?.result;
            const hasWarning = qaResult?.overallStatus !== 'PASS';

            return (
              <div
                key={shot.id}
                className={`p-5 rounded-2xl border transition-all ${
                  hasWarning
                    ? 'bg-amber-950/20 border-amber-500/40 text-white'
                    : isRemediated
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
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
                            : isRemediated
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {hasWarning
                          ? 'MOTION WARNING'
                          : isRemediated
                          ? 'FALLBACK REMEDY ACTIVE'
                          : 'ALL GATES PASS'}
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
                      {qaResult?.driftFrames || 'Landmark tremor exceeds profile threshold.'}
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      Recommended Action: {qaResult?.remedyAction || 'Apply subtle anchor smoothing or execute Graceful Degradation.'}
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
