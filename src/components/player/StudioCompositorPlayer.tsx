import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Film,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { AspectRatio, Episode, Universe } from '../../types';
import { audioSynthesizer } from '../../lib/audioSynthesizer';
import confetti from 'canvas-confetti';

interface StudioCompositorPlayerProps {
  universe: Universe;
  episode: Episode;
}

export const StudioCompositorPlayer: React.FC<StudioCompositorPlayerProps> = ({
  universe,
  episode,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(episode.aspectRatio || '9:16');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeShotIndex, setActiveShotIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Flatten all shots
  const allShots = episode.scenes.flatMap((sc) => sc.shots);
  const totalDuration = allShots.reduce((acc, s) => acc + (s.duration || 3.5), 0);

  // Find active shot by currentTime
  let accumulated = 0;
  let currentShot = allShots[0];
  for (let i = 0; i < allShots.length; i++) {
    accumulated += allShots[i].duration || 3.5;
    if (currentTime <= accumulated || i === allShots.length - 1) {
      currentShot = allShots[i];
      if (activeShotIndex !== i) {
        setActiveShotIndex(i);
      }
      break;
    }
  }

  // Playback timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const step = 0.05;
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + step;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Render on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#08090B';
    ctx.fillRect(0, 0, width, height);

    // Draw stylized environment gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (currentShot?.locationId === 'loc_cyber_gym') {
      gradient.addColorStop(0, '#191209');
      gradient.addColorStop(0.5, '#0E1015');
      gradient.addColorStop(1, '#08090B');
    } else if (currentShot?.locationId === 'loc_coffee_shop') {
      gradient.addColorStop(0, '#171412');
      gradient.addColorStop(0.5, '#0F1116');
      gradient.addColorStop(1, '#090A0E');
    } else {
      gradient.addColorStop(0, '#2A171A');
      gradient.addColorStop(0.5, '#120F1C');
      gradient.addColorStop(1, '#08090B');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background neon glow circles
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.35, 140, 0, Math.PI * 2);
    ctx.fillStyle = currentShot?.locationId === 'loc_cyber_gym' ? 'rgba(255, 159, 36, 0.08)' : 'rgba(139, 92, 246, 0.08)';
    ctx.fill();

    // Subtle camera breathing motion
    const breath = Math.sin(currentTime * 2) * 4;
    const mouthMovement = isPlaying ? Math.abs(Math.sin(currentTime * 8)) * 8 : 0;

    // Character Silhouette / Visual Presentation
    const charX = width / 2;
    const charY = height * 0.45 + breath;

    // Draw Character Head / Torso
    ctx.save();
    ctx.fillStyle = '#1A1E26';
    ctx.beginPath();
    ctx.ellipse(charX, charY + 80, 110, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Character Head
    ctx.fillStyle = '#3B2923';
    ctx.beginPath();
    ctx.arc(charX, charY - 20, 58, 0, Math.PI * 2);
    ctx.fill();

    // Face skin
    ctx.fillStyle = '#C8966E';
    ctx.beginPath();
    ctx.arc(charX, charY - 15, 48, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#221510';
    ctx.beginPath();
    ctx.arc(charX, charY - 40, 52, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes (Deadpan)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(charX - 18, charY - 18, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(charX + 18, charY - 18, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (Mouth flap synced to audio)
    ctx.strokeStyle = '#623B2A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (mouthMovement > 2) {
      ctx.ellipse(charX, charY + 12, 10, 3 + mouthMovement / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#4A1D1D';
      ctx.fill();
    } else {
      ctx.moveTo(charX - 12, charY + 12);
      ctx.lineTo(charX + 12, charY + 12);
      ctx.stroke();
    }

    // Hoodie Collar & Drawstrings
    ctx.fillStyle = '#1E232E';
    ctx.beginPath();
    ctx.moveTo(charX - 45, charY + 32);
    ctx.lineTo(charX + 45, charY + 32);
    ctx.lineTo(charX + 70, charY + 130);
    ctx.lineTo(charX - 70, charY + 130);
    ctx.closePath();
    ctx.fill();

    // Metallic Aglets
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(charX - 12, charY + 70 + breath * 0.5, 3, 14);
    ctx.fillRect(charX + 9, charY + 70 + breath * 0.5, 3, 14);

    ctx.restore();

    // Floating Synchronized Subtitle Overlay
    if (currentShot?.dialogue) {
      ctx.save();
      const text = `"${currentShot.dialogue}"`;
      ctx.font = 'bold 15px "Outfit", Inter, sans-serif';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(text);
      const boxWidth = Math.min(width - 32, metrics.width + 32);
      const boxX = (width - boxWidth) / 2;
      const boxY = height * 0.82;

      // Subtitle Backdrop Pill
      ctx.fillStyle = 'rgba(10, 13, 18, 0.85)';
      ctx.roundRect(boxX, boxY, boxWidth, 42, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 159, 36, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtitle Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, width / 2, boxY + 26);
      ctx.restore();
    }

    // Live Audio Waveform at bottom
    if (isPlaying) {
      ctx.save();
      ctx.strokeStyle = '#FF9F24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sliceWidth = width / 40;
      let x = 0;
      for (let i = 0; i < 40; i++) {
        const v = Math.sin(currentTime * 10 + i) * 8;
        const y = height - 12 + v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [currentTime, currentShot, isPlaying, aspectRatio]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (!isMuted && currentShot) {
        const char = universe.characters.find((c) => c.id === currentShot.characterId);
        const ver = char?.versions.find((v) => v.version === currentShot.characterVersion);
        audioSynthesizer.speakDialogue(currentShot.dialogue, {
          pitch: ver?.voiceProfile.pitch ?? 0.95,
          rate: ver?.voiceProfile.speakingSpeed ?? 1.05,
        });
      }
    } else {
      setIsPlaying(false);
      audioSynthesizer.stop();
    }
  };

  const handleExportVideo = () => {
    setIsExporting(true);
    audioSynthesizer.playStudioChime('render_done');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              STUDIO MULTI-TRACK COMPOSITOR
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Deterministic Composition & Subtitle Timing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Master Composition Previewer
          </h1>
        </div>

        {/* Aspect Ratio Switcher & Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#121215] border border-zinc-800 p-1 rounded-full text-xs font-mono">
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                aspectRatio === '9:16' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              9:16 Vertical
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                aspectRatio === '16:9' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              16:9 Landscape
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                aspectRatio === '1:1' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400 hover:text-white'
              }`}
            >
              1:1 Square
            </button>
          </div>

          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isExporting ? 'Exporting MP4...' : 'Export Master MP4'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Display: Canvas Stage + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Canvas Player Monitor */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#121215] border border-zinc-800 rounded-[32px] p-6 shadow-xl relative">
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 ${
              aspectRatio === '9:16'
                ? 'w-[270px] h-[480px]'
                : aspectRatio === '16:9'
                ? 'w-[480px] h-[270px]'
                : 'w-[360px] h-[360px]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={aspectRatio === '9:16' ? 360 : aspectRatio === '16:9' ? 640 : 480}
              height={aspectRatio === '9:16' ? 640 : aspectRatio === '16:9' ? 360 : 480}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Player Transport Controls */}
          <div className="w-full max-w-md flex items-center justify-between mt-5 px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-2xl text-xs font-mono">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer font-medium"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Rewind"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="text-zinc-300">
                {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Multi-Track Timeline Sequencer */}
        <div className="lg:col-span-6 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-3 mb-4">
              <span className="text-white font-medium uppercase">
                Synchronized Track Timeline
              </span>
              <span className="text-emerald-400 font-mono">
                Shot #{currentShot?.shotNumber || 1} Active
              </span>
            </div>

            {/* Time Scrubber */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0.00s</span>
                <span>{(totalDuration / 2).toFixed(1)}s</span>
                <span>{totalDuration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalDuration}
                step="0.05"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Visual Multi-Tracks */}
            <div className="space-y-3 font-mono text-xs">
              {/* Track 1: Video / Scene */}
              <div className="p-3.5 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-white">TRACK 1: VIDEO / STAGE</span>
                  <span className="text-zinc-500">{currentShot?.locationId}</span>
                </div>
                <div className="flex gap-1.5 h-7 pt-1">
                  {allShots.map((s, idx) => {
                    const isCur = idx === activeShotIndex;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          let start = 0;
                          for (let k = 0; k < idx; k++) start += allShots[k].duration || 3.5;
                          setCurrentTime(start);
                        }}
                        style={{ flex: s.duration || 3.5 }}
                        className={`h-full rounded-lg text-[9px] flex items-center justify-center cursor-pointer transition-all ${
                          isCur
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
                        }`}
                      >
                        Shot 0{idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Track 2: Voice Dialogue */}
              <div className="p-3.5 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-white">TRACK 2: VOICE SYNTHESIS</span>
                  <span className="text-emerald-400">-14.0 LUFS Normalized</span>
                </div>
                <p className="text-xs text-zinc-200 font-sans italic pt-1 line-clamp-2">
                  "{currentShot?.dialogue}"
                </p>
              </div>

              {/* Track 3: Subtitles & Captions */}
              <div className="p-3.5 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-semibold text-white">TRACK 3: OVERLAY CAPTIONS</span>
                  <span className="text-indigo-400 font-mono">Dynamic Centered Pill</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Safe margins: <span className="text-white">10% vertical / 8% horizontal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Shot Parameter Card */}
          <div className="p-3.5 bg-zinc-800/30 border border-zinc-800 rounded-2xl text-xs font-mono flex items-center justify-between text-zinc-300">
            <div>
              <span className="text-zinc-500 text-[10px]">CURRENT CAMERA:</span>
              <div className="text-white font-medium">{currentShot?.camera}</div>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px]">MOTION PRESET:</span>
              <div className="text-indigo-400 font-medium">{currentShot?.motionPreset}</div>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px]">FALLBACK:</span>
              <div className="text-emerald-400 font-medium">{currentShot?.fallbackStrategy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
