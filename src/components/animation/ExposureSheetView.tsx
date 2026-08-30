import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  Maximize2,
  FileSpreadsheet,
  Film,
  Camera,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { Episode, Universe, Shot, ExposureSheetFrame } from '../../types';

interface ExposureSheetViewProps {
  universe: Universe;
  selectedEpisode: Episode;
  onOpenShotDesigner?: (shot: Shot) => void;
}

export const ExposureSheetView: React.FC<ExposureSheetViewProps> = ({
  universe,
  selectedEpisode,
  onOpenShotDesigner,
}) => {
  const currentShot = selectedEpisode.scenes[0]?.shots[0] || {
    id: 'shot_001',
    shotNumber: 1,
    characterId: 'char_milo',
    characterVersion: 'v3.2',
    poseId: 'pose_bench_slouch',
    expressionId: 'exp_deadpan',
    action: 'holding_coffee',
    locationId: 'loc_cyber_gym',
    camera: 'medium / eye-level',
    dialogue: "Rule number one of modern fitness: You didn't work out unless someone at 4:30 AM saw you suffer.",
    emotion: 'deadpan',
    duration: 4.8,
    motionPreset: 'subtle_head',
    propIds: ['prop_espresso_cup'],
    referenceAssetHashes: ['sha256:88fa29e81'],
    seed: 1042,
    status: 'READY',
    primaryProvider: 'Flux.1-Dev-Adapter',
    fallbackStrategy: 'static_pose_animation',
  };

  const character = universe.characters.find((c) => c.id === currentShot.characterId) || universe.characters[0];
  const charVersion = character.versions.find((v) => v.version === currentShot.characterVersion) || character.versions[0];

  // Timing state
  const fps = 24;
  const totalFrames = Math.round(currentShot.duration * fps); // e.g. 115 frames
  const [currentFrame, setCurrentFrame] = useState<number>(18);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [onionSkinEnabled, setOnionSkinEnabled] = useState<boolean>(true);
  const [onionSkinOpacity, setOnionSkinOpacity] = useState<number>(45);
  const [selectedColumn, setSelectedColumn] = useState<string>('all');

  // Generate deterministic X-Sheet frame list
  const phonemes = ['REST', 'A', 'E', 'O', 'M', 'L', 'F/V', 'TH', 'U'];
  const frames: ExposureSheetFrame[] = Array.from({ length: totalFrames }, (_, i) => {
    const fNum = i + 1;
    const timeSec = (i / fps).toFixed(2);
    
    // Viseme / Phoneme mapping from dialogue
    let phoneme = 'REST';
    let syllable = '';
    if (fNum >= 4 && fNum <= 12) { phoneme = 'R'; syllable = 'Rule'; }
    else if (fNum >= 13 && fNum <= 20) { phoneme = 'U'; syllable = 'num-'; }
    else if (fNum >= 21 && fNum <= 28) { phoneme = 'M'; syllable = '-ber'; }
    else if (fNum >= 32 && fNum <= 42) { phoneme = 'O'; syllable = 'one'; }
    else if (fNum >= 48 && fNum <= 60) { phoneme = 'F/V'; syllable = 'fit-'; }
    else if (fNum >= 61 && fNum <= 75) { phoneme = 'E'; syllable = '-ness'; }
    else if (fNum >= 85 && fNum <= 105) { phoneme = 'A'; syllable = 'suf-fer'; }

    return {
      frameNumber: fNum,
      timestampSec: Number(timeSec),
      shotId: currentShot.id,
      audioPhoneme: phoneme,
      dialogueSyllable: syllable,
      poseKey: fNum < 40 ? 'P01 Bench Slouch' : fNum < 80 ? 'P02 Head Tilt' : 'P01 Bench Slouch',
      faceViseme: phoneme !== 'REST' ? `Viseme [${phoneme}]` : 'Neutral Rest',
      cameraCue: fNum < 30 ? 'Static Eye-Level' : fNum < 70 ? 'Slow Push (1.05x)' : 'Hold',
      propState: 'Espresso Held (Rest)',
      onionSkinActive: Math.abs(fNum - currentFrame) <= 3,
    };
  });

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
      }, 1000 / fps);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, fps]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#09090B] text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#121215]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100">Animation Exposure Sheet (X-Sheet)</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                OpenToonz Architecture
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Frame-accurate timing matrix: Visemes, Poses, Audio Phonemes & Multi-Frame Onion Skinning
            </p>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setCurrentFrame(1)}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
              title="First Frame"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-mono px-2"
              title="Step Back 1 Frame"
            >
              -1f
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
              title={isPlaying ? 'Pause' : 'Play 24 FPS'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-mono px-2"
              title="Step Forward 1 Frame"
            >
              +1f
            </button>
            <button
              onClick={() => setCurrentFrame(totalFrames)}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
              title="End Frame"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-300">
            FRAME <span className="text-amber-400 font-bold">{String(currentFrame).padStart(3, '0')}</span> / {totalFrames}
            <span className="text-zinc-500 ml-2">({(currentFrame / fps).toFixed(2)}s)</span>
          </div>

          <button
            onClick={() => setOnionSkinEnabled(!onionSkinEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              onionSkinEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Onion Skin {onionSkinEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Viewport + X-Sheet Table */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Onion Skinning Visualizer Viewport */}
        <div className="w-5/12 border-r border-zinc-800/80 bg-[#0B0C0E] flex flex-col">
          <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Onion Skinning Viewport
            </span>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Ghost Alpha:</span>
              <input
                type="range"
                min="10"
                max="80"
                value={onionSkinOpacity}
                onChange={(e) => setOnionSkinOpacity(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-zinc-300">{onionSkinOpacity}%</span>
            </div>
          </div>

          {/* Canvas Preview with Ghosting */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0e1014] to-[#08090B]">
            {/* Viewport Frame */}
            <div className="relative w-64 h-96 rounded-2xl border-2 border-zinc-700/80 bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Previous Frame Ghost (t-1: Red/Amber Tint) */}
              {onionSkinEnabled && currentFrame > 1 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity"
                  style={{ opacity: onionSkinOpacity / 100 }}
                >
                  <img
                    src={character.avatarUrl}
                    alt="t-1 ghost"
                    className="w-full h-full object-cover filter hue-rotate-[-40deg] contrast-150 transform translate-x-1"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-900/80 border border-red-500/50 rounded text-[9px] font-mono text-red-200">
                    t-1 (f{currentFrame - 1})
                  </div>
                </div>
              )}

              {/* Current Frame (t0) */}
              <div className="relative z-10 w-full h-full">
                <img
                  src={character.avatarUrl}
                  alt="t0 current frame"
                  className="w-full h-full object-cover"
                />
                
                {/* 2D Vector Landmark Mesh Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Face Mesh Points */}
                  <circle cx="50%" cy="42%" r="3" fill="#FF9F24" />
                  <circle cx="43%" cy="40%" r="2.5" fill="#38BDF8" />
                  <circle cx="57%" cy="40%" r="2.5" fill="#38BDF8" />
                  <line x1="43%" y1="40%" x2="57%" y2="40%" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2,2" />
                  
                  {/* Mouth Viseme Contour */}
                  <ellipse cx="50%" cy="66%" rx="14" ry={frames[currentFrame - 1]?.audioPhoneme !== 'REST' ? '8' : '3'} fill="none" stroke="#F59E0B" strokeWidth="2" />
                  
                  {/* Mandible Jawline */}
                  <path d="M 80,150 Q 128,210 176,150" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="3,3" />
                </svg>

                <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 flex items-center justify-between">
                  <span>{character.name} ({charVersion.version})</span>
                  <span className="text-amber-400 font-bold">{frames[currentFrame - 1]?.audioPhoneme}</span>
                </div>
              </div>

              {/* Next Frame Ghost (t+1: Cyan/Blue Tint) */}
              {onionSkinEnabled && currentFrame < totalFrames && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity"
                  style={{ opacity: onionSkinOpacity / 100 }}
                >
                  <img
                    src={character.avatarUrl}
                    alt="t+1 ghost"
                    className="w-full h-full object-cover filter hue-rotate-[160deg] contrast-150 transform -translate-x-1"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-900/80 border border-cyan-500/50 rounded text-[9px] font-mono text-cyan-200">
                    t+1 (f{currentFrame + 1})
                  </div>
                </div>
              )}
            </div>

            {/* Frame Metadata Badge */}
            <div className="mt-4 flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" /> t-1 Ghost
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> t0 Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> t+1 Ghost
              </span>
            </div>
          </div>
        </div>

        {/* Right: Traditional Animation Exposure Sheet Matrix */}
        <div className="flex-1 flex flex-col bg-[#121215] overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Exposure Matrix — Shot 01 ({currentShot.duration}s @ 24fps)
              </span>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Total Cels: <span className="text-zinc-200 font-bold">{totalFrames}</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-mono font-semibold text-zinc-400 px-4 py-2 uppercase tracking-wider sticky top-0 z-20">
            <div className="col-span-1 text-center">Frame</div>
            <div className="col-span-1 text-center">Time</div>
            <div className="col-span-2">Dialogue / Syllable</div>
            <div className="col-span-2">Phoneme / Viseme</div>
            <div className="col-span-2">Pose Lock</div>
            <div className="col-span-2">Camera Cue</div>
            <div className="col-span-2">Prop State</div>
          </div>

          {/* Table Rows (Scroller) */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {frames.map((frame) => {
              const isSelected = frame.frameNumber === currentFrame;
              const isGhost = Math.abs(frame.frameNumber - currentFrame) === 1;

              return (
                <div
                  key={frame.frameNumber}
                  onClick={() => setCurrentFrame(frame.frameNumber)}
                  className={`grid grid-cols-12 px-4 py-1.5 text-xs font-mono cursor-pointer transition-colors items-center ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-500 shadow-sm'
                      : isGhost && onionSkinEnabled
                      ? 'bg-zinc-800/40 text-zinc-300'
                      : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                  }`}
                >
                  <div className="col-span-1 text-center font-bold">
                    {String(frame.frameNumber).padStart(3, '0')}
                  </div>
                  <div className="col-span-1 text-center text-zinc-500 text-[10px]">
                    {frame.timestampSec.toFixed(2)}s
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 truncate">
                    {frame.dialogueSyllable ? (
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-semibold border border-indigo-500/30">
                        "{frame.dialogueSyllable}"
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        frame.audioPhoneme !== 'REST'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                          : 'text-zinc-600'
                      }`}
                    >
                      {frame.faceViseme}
                    </span>
                  </div>
                  <div className="col-span-2 truncate text-zinc-300">
                    {frame.poseKey}
                  </div>
                  <div className="col-span-2 truncate text-zinc-400 text-[11px]">
                    {frame.cameraCue}
                  </div>
                  <div className="col-span-2 truncate text-zinc-500 text-[10px]">
                    {frame.propState}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
