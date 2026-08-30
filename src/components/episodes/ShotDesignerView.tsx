import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  User,
  Sparkles,
  Camera,
  Layers,
  Activity,
  Sliders,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Eye,
  Zap,
  Play,
  AlertCircle,
  Clock,
  ShieldCheck,
  Film,
} from 'lucide-react';
import { Character, Episode, Shot, Universe } from '../../types';
import { audioSynthesizer } from '../../lib/audioSynthesizer';
import { analyzeShotDelta, getShotArtifactBreakdown } from '../../lib/invalidationEngine';

interface ShotDesignerViewProps {
  universe: Universe;
  selectedEpisode: Episode;
  onUpdateShot?: (updatedShot: Shot) => void;
  onCompileShot?: (shot: Shot) => void;
}

export const ShotDesignerView: React.FC<ShotDesignerViewProps> = ({
  universe,
  selectedEpisode,
  onUpdateShot,
  onCompileShot,
}) => {
  const allShots: Shot[] = selectedEpisode.scenes.flatMap((s) => s.shots);
  const [selectedShotId, setSelectedShotId] = useState<string>(allShots[0]?.id || 'shot_001');

  const currentShot = allShots.find((s) => s.id === selectedShotId) || allShots[0];
  const [characterId, setCharacterId] = useState<string>(currentShot?.characterId || 'char_milo');
  const [poseId, setPoseId] = useState<string>(currentShot?.poseId || 'pose_bench_slouch');
  const [expressionId, setExpressionId] = useState<string>(currentShot?.expressionId || 'exp_deadpan');
  const [camera, setCamera] = useState<string>(currentShot?.camera || 'medium / eye-level');
  const [action, setAction] = useState<string>(currentShot?.action || 'holding_coffee');
  const [motionPreset, setMotionPreset] = useState<string>(currentShot?.motionPreset || 'subtle_head');
  const [dialogue, setDialogue] = useState<string>(currentShot?.dialogue || '');
  const [duration, setDuration] = useState<number>(currentShot?.duration || 4.8);
  const [seed, setSeed] = useState<number>(currentShot?.seed || 1042);
  const [fallbackStrategy, setFallbackStrategy] = useState<Shot['fallbackStrategy']>(
    currentShot?.fallbackStrategy || 'static_pose_animation'
  );

  const character = universe.characters.find((c) => c.id === characterId) || universe.characters[0];
  const activeVersion = character?.versions?.find((v) => v.version === character.currentVersion) || character?.versions?.[0];
  const activeVersionString = activeVersion?.version || 'v1.0';

  // Compute live tentative shot & invalidation delta
  const draftShot: Shot = useMemo(() => ({
    ...currentShot,
    characterId,
    characterVersion: activeVersionString,
    poseId,
    expressionId,
    camera,
    action,
    motionPreset,
    dialogue,
    duration,
    seed,
    fallbackStrategy,
  }), [currentShot, characterId, activeVersionString, poseId, expressionId, camera, action, motionPreset, dialogue, duration, seed, fallbackStrategy]);

  const invalidation = useMemo(() => analyzeShotDelta(currentShot, draftShot), [currentShot, draftShot]);
  const breakdown = useMemo(() => getShotArtifactBreakdown(draftShot, invalidation), [draftShot, invalidation]);

  const handleSave = () => {
    if (!currentShot) return;
    audioSynthesizer.playStudioChime('shot_click');
    onUpdateShot?.(draftShot);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#09090B] text-slate-100 overflow-hidden select-none">
      {/* Header */}
      <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#121215]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100">Shot Designer & Parameter Binding</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Precision Creative State
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Directly author immutable shot geometry, camera cues, and character pose bindings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shot Selector Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 font-mono">
            <span>SHOT:</span>
            <select
              value={selectedShotId}
              onChange={(e) => {
                const s = allShots.find((item) => item.id === e.target.value);
                if (s) {
                  setSelectedShotId(s.id);
                  setCharacterId(s.characterId);
                  setPoseId(s.poseId);
                  setExpressionId(s.expressionId);
                  setCamera(s.camera);
                  setAction(s.action);
                  setMotionPreset(s.motionPreset);
                  setDialogue(s.dialogue);
                  setDuration(s.duration);
                  setSeed(s.seed);
                }
              }}
              className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer"
            >
              {allShots.map((s, idx) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-200">
                  Shot {String(idx + 1).padStart(2, '0')} — {s.emotion} ({s.duration}s)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Viewport Preview + Parameter Controls */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left: Viewport Preview & Visual Anchors */}
        <div className="col-span-5 border-r border-zinc-800/80 bg-[#0B0C0E] flex flex-col p-6 items-center justify-center">
          <div className="relative w-72 h-[420px] rounded-3xl border-2 border-zinc-700/80 bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center group">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
            {/* Viewport Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 flex flex-col justify-between p-4 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  {character.name} {activeVersion.version} [LOCKED]
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                  SEED #{seed}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">{camera}</p>
                <p className="text-[11px] text-zinc-400 font-mono italic">"{dialogue}"</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              Duration: <strong className="text-zinc-200">{duration}s</strong>
            </span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              Motion: <strong className="text-indigo-400">{motionPreset}</strong>
            </span>
          </div>
        </div>

        {/* Right: Parameter Binding Form */}
        <div className="col-span-7 bg-[#121215] overflow-y-auto p-6 space-y-6">
          {/* Live Dependency Invalidation Impact Monitor */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Dependency Invalidation Impact
              </span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                  invalidation.isStale
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}
              >
                {invalidation.isStale ? '● Recompilation Required' : '✓ All Artifacts Valid'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {invalidation.summaryMessage}
            </p>

            {/* Granular Artifact Layer Breakdown */}
            <div className="grid grid-cols-5 gap-2 pt-1 text-[11px] font-mono">
              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${
                  breakdown.characterVisual.status === 'VALID'
                    ? 'bg-zinc-950 border-emerald-500/30 text-emerald-300'
                    : breakdown.characterVisual.status === 'CACHED'
                    ? 'bg-zinc-950 border-blue-500/30 text-blue-300'
                    : 'bg-zinc-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">Visual</span>
                <span className="font-bold text-[10px]">{breakdown.characterVisual.status}</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${
                  breakdown.voiceAudio.status === 'VALID'
                    ? 'bg-zinc-950 border-emerald-500/30 text-emerald-300'
                    : breakdown.voiceAudio.status === 'CACHED'
                    ? 'bg-zinc-950 border-blue-500/30 text-blue-300'
                    : 'bg-zinc-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">Audio</span>
                <span className="font-bold text-[10px]">{breakdown.voiceAudio.status}</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${
                  breakdown.motionSynthesis.status === 'VALID'
                    ? 'bg-zinc-950 border-emerald-500/30 text-emerald-300'
                    : breakdown.motionSynthesis.status === 'CACHED'
                    ? 'bg-zinc-950 border-blue-500/30 text-blue-300'
                    : 'bg-zinc-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">Motion</span>
                <span className="font-bold text-[10px]">{breakdown.motionSynthesis.status}</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${
                  breakdown.qualityGate.status === 'VALID'
                    ? 'bg-zinc-950 border-emerald-500/30 text-emerald-300'
                    : 'bg-zinc-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">QA Gate</span>
                <span className="font-bold text-[10px]">{breakdown.qualityGate.status}</span>
              </div>

              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${
                  breakdown.compositorTrack.status === 'VALID'
                    ? 'bg-zinc-950 border-emerald-500/30 text-emerald-300'
                    : 'bg-zinc-950 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="text-[9px] text-zinc-500 uppercase">Composite</span>
                <span className="font-bold text-[10px]">{breakdown.compositorTrack.status}</span>
              </div>
            </div>
          </div>

          {/* Character & Version Binding */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Character & Creative DNA Version
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Immutable Reference
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Actor Identity</label>
                <select
                  value={characterId}
                  onChange={(e) => setCharacterId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                >
                  {universe.characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.archetype})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Locked DNA Version</label>
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono">
                  {activeVersion.version} — {activeVersion.changeSummary.slice(0, 38)}...
                </div>
              </div>
            </div>
          </div>

          {/* Pose & Expression Library */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono block">
                Pose Library Binding
              </label>
              <select
                value={poseId}
                onChange={(e) => setPoseId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                {activeVersion.poseLibrary.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono block">
                Expression Library Binding
              </label>
              <select
                value={expressionId}
                onChange={(e) => setExpressionId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                {activeVersion.expressionLibrary.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name} (Intensity: {exp.intensity}/10)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Camera Angle & Motion Preset */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono block">
                Camera Specification
              </label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="medium / eye-level">Medium / Eye-Level (50mm)</option>
                <option value="close-up / 45-deg">Close-Up / 45° Angle (85mm)</option>
                <option value="medium-close / profile">Medium-Close / Profile (70mm)</option>
                <option value="three-quarter / low-angle">Three-Quarter / Low-Angle Hero (35mm)</option>
                <option value="dutch-angle / dynamic">Dutch Angle / Dynamic (24mm)</option>
              </select>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono block">
                Motion Preset & Driver
              </label>
              <select
                value={motionPreset}
                onChange={(e) => setMotionPreset(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="subtle_head">Subtle Head Tilt & Micro-Blinks</option>
                <option value="talking_neutral">Talking Neutral (Audio-Driven)</option>
                <option value="hand_emphasis">Hand Precision Emphasis Gesture</option>
                <option value="espresso_sip">Espresso Sip Action Motion</option>
              </select>
            </div>
          </div>

          {/* Dialogue & Action Text */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono block flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              Dialogue & Voice Script
            </label>
            <textarea
              rows={3}
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none leading-relaxed font-sans"
              placeholder="Enter precise shot dialogue..."
            />
          </div>

          {/* Duration & Seed & Fallback Strategy */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Duration (Sec)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="30.0"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
              />
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Seed Lock</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
                />
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 9000) + 1000)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-200"
                  title="Randomize Seed"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block">QA Fallback</label>
              <select
                value={fallbackStrategy}
                onChange={(e) => setFallbackStrategy(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="static_pose_animation">Static Pose Anchor</option>
                <option value="camera_motion_fallback">Ken Burns Push</option>
                <option value="alternative_motion_provider">Alternative Model</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
