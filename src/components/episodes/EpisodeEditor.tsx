import React, { useState } from 'react';
import {
  Film,
  Plus,
  Trash2,
  Cpu,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Play,
  Volume2,
  Camera,
  Smile,
  Shield,
  HelpCircle,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { Episode, Scene, Shot, Universe } from '../../types';
import { audioSynthesizer } from '../../lib/audioSynthesizer';

interface EpisodeEditorProps {
  universe: Universe;
  episodes: Episode[];
  selectedEpisodeId: string;
  onSelectEpisode: (id: string) => void;
  onUpdateEpisode: (episode: Episode) => void;
  onCompileManifest: (episode: Episode) => void;
  onOpenAssistantWithPrompt: (prompt: string, type: string) => void;
}

export const EpisodeEditor: React.FC<EpisodeEditorProps> = ({
  universe,
  episodes,
  selectedEpisodeId,
  onSelectEpisode,
  onUpdateEpisode,
  onCompileManifest,
  onOpenAssistantWithPrompt,
}) => {
  const currentEpisode =
    episodes.find((e) => e.id === selectedEpisodeId) || episodes[0] || null;

  const [activeTab, setActiveTab] = useState<'shots' | 'script' | 'settings'>('shots');
  const [expandedSceneId, setExpandedSceneId] = useState<string>(
    currentEpisode?.scenes[0]?.id || ''
  );
  const [playingShotId, setPlayingShotId] = useState<string | null>(null);

  if (!currentEpisode) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        No episodes found. Create one to begin.
      </div>
    );
  }

  // Calculate total duration
  const totalCalculatedDuration = currentEpisode.scenes.reduce((acc, scene) => {
    return (
      acc +
      scene.shots.reduce((sAcc, shot) => {
        return sAcc + (Number(shot.duration) || 3.0);
      }, 0)
    );
  }, 0);

  const totalShotCount = currentEpisode.scenes.reduce((acc, s) => acc + s.shots.length, 0);

  // Play shot dialogue voice
  const handlePlayShotVoice = (shot: Shot) => {
    const char = universe.characters.find((c) => c.id === shot.characterId);
    const version = char?.versions.find((v) => v.version === (shot.characterVersion || char.currentVersion));

    setPlayingShotId(shot.id);
    audioSynthesizer.speakDialogue(shot.dialogue, {
      pitch: version?.voiceProfile.pitch ?? 0.95,
      rate: version?.voiceProfile.speakingSpeed ?? 1.05,
      onEnd: () => setPlayingShotId(null),
    });
  };

  // Add new shot to scene
  const handleAddShot = (sceneId: string) => {
    const defaultChar = universe.characters[0];
    const newShot: Shot = {
      id: `shot_${Date.now()}`,
      shotNumber: totalShotCount + 1,
      characterId: defaultChar.id,
      characterVersion: defaultChar.currentVersion,
      poseId: 'pose_bench_slouch',
      expressionId: 'exp_deadpan',
      action: 'observing_camera',
      locationId: universe.locations[0]?.id || 'loc_cyber_gym',
      camera: 'medium / eye-level',
      dialogue: 'Every observation begins with a structured proposition.',
      emotion: 'deadpan',
      duration: 3.5,
      motionPreset: 'subtle_head',
      propIds: [],
      referenceAssetHashes: ['sha256:88fa29e81'],
      seed: 1000 + totalShotCount * 37,
      status: 'DRAFT',
      primaryProvider: 'Flux.1-Dev-Adapter',
      fallbackStrategy: 'static_pose_animation',
    };

    const updatedScenes = currentEpisode.scenes.map((sc) => {
      if (sc.id === sceneId) {
        return {
          ...sc,
          shots: [...sc.shots, newShot],
        };
      }
      return sc;
    });

    onUpdateEpisode({
      ...currentEpisode,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update shot fields
  const handleUpdateShot = (sceneId: string, shotId: string, updates: Partial<Shot>) => {
    const updatedScenes = currentEpisode.scenes.map((sc) => {
      if (sc.id === sceneId) {
        return {
          ...sc,
          shots: sc.shots.map((sh) => (sh.id === shotId ? { ...sh, ...updates } : sh)),
        };
      }
      return sc;
    });

    onUpdateEpisode({
      ...currentEpisode,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete shot
  const handleDeleteShot = (sceneId: string, shotId: string) => {
    const updatedScenes = currentEpisode.scenes.map((sc) => {
      if (sc.id === sceneId) {
        return {
          ...sc,
          shots: sc.shots.filter((sh) => sh.id !== shotId),
        };
      }
      return sc;
    });

    onUpdateEpisode({
      ...currentEpisode,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              EPISODIC INTENT
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Intermediate Representation Input
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            {currentEpisode.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl line-clamp-1">
            {currentEpisode.premise}
          </p>
        </div>

        {/* Compile Manifest Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() =>
              onOpenAssistantWithPrompt(
                `Optimize this episode script for higher retention: "${currentEpisode.script.rawText}"`,
                'script_generation'
              )
            }
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded-2xl text-xs font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Script Assist</span>
          </button>

          <button
            onClick={() => onCompileManifest(currentEpisode)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Compile Production IR</span>
          </button>
        </div>
      </div>

      {/* Episode Navigation Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800 rounded-[32px] p-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('shots')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'shots'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Scenes & Shots ({totalShotCount})
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Script Structure
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
          <div>
            Duration: <span className="text-emerald-400 font-semibold">{totalCalculatedDuration.toFixed(1)}s</span>
          </div>
          <div>
            Aspect Ratio: <span className="text-white font-semibold">{currentEpisode.aspectRatio}</span>
          </div>
          <div>
            Scenes: <span className="text-white font-semibold">{currentEpisode.scenes.length}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: Shot Sequencer & Editor */}
      {activeTab === 'shots' && (
        <div className="space-y-6">
          {currentEpisode.scenes.map((scene, scIdx) => {
            const isExpanded = expandedSceneId === scene.id || expandedSceneId === '';
            const location = universe.locations.find((l) => l.id === scene.locationId);

            return (
              <div
                key={scene.id}
                className="bg-[#121215] border border-zinc-800 rounded-[32px] overflow-hidden shadow-lg"
              >
                {/* Scene Header */}
                <div
                  onClick={() => setExpandedSceneId(isExpanded ? '__none' : scene.id)}
                  className="px-6 py-4 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-zinc-900/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                    <span className="font-mono text-xs font-semibold text-indigo-400">
                      SCENE 0{scene.sceneNumber || scIdx + 1}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {scene.title}
                    </span>
                    {location && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">
                        📍 {location.name}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-zinc-400">
                    {scene.shots.length} Shots
                  </div>
                </div>

                {/* Shots Grid */}
                {isExpanded && (
                  <div className="p-6 space-y-4">
                    {scene.shots.map((shot, shotIdx) => {
                      const isPlaying = playingShotId === shot.id;

                      return (
                        <div
                          key={shot.id}
                          className="bg-zinc-800/20 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all space-y-4"
                        >
                          {/* Shot Header Row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-white px-2.5 py-1 bg-zinc-800 rounded-lg">
                                SHOT #{shot.shotNumber || shotIdx + 1}
                              </span>

                              {/* Character Selector */}
                              <select
                                value={shot.characterId}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, {
                                    characterId: e.target.value,
                                    characterVersion:
                                      universe.characters.find((c) => c.id === e.target.value)
                                        ?.currentVersion || 'v1.0',
                                  })
                                }
                                className="bg-zinc-900 border border-zinc-700 text-white text-xs font-medium px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                {universe.characters.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.currentVersion})
                                  </option>
                                ))}
                              </select>

                              {/* Pose Selector */}
                              <select
                                value={shot.poseId}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, { poseId: e.target.value })
                                }
                                className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="pose_bench_slouch">Pose: Bench Slouch</option>
                                <option value="pose_pointing_forward">Pose: Pointing Forward</option>
                                <option value="pose_crossed_arms">Pose: Crossed Arms</option>
                                <option value="pose_holding_coffee">Pose: Holding Coffee</option>
                              </select>

                              {/* Expression Selector */}
                              <select
                                value={shot.expressionId}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, { expressionId: e.target.value })
                                }
                                className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="exp_deadpan">Exp: Deadpan (😐)</option>
                                <option value="exp_smug">Exp: Smug (😏)</option>
                                <option value="exp_confused">Exp: Confused (🤨)</option>
                                <option value="exp_happy">Exp: Happy (🙂)</option>
                              </select>
                            </div>

                            {/* Duration & Delete */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <input
                                  type="number"
                                  step="0.1"
                                  min="1"
                                  max="30"
                                  value={shot.duration}
                                  onChange={(e) =>
                                    handleUpdateShot(scene.id, shot.id, {
                                      duration: parseFloat(e.target.value) || 3.0,
                                    })
                                  }
                                  className="w-14 bg-zinc-900 border border-zinc-700 text-center rounded-lg px-1.5 py-0.5 text-emerald-400 font-semibold"
                                />
                                <span>s</span>
                              </div>

                              <button
                                onClick={() => handleDeleteShot(scene.id, shot.id)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete shot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Dialogue Script Box */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-500">CHARACTER SPOKEN DIALOGUE:</span>
                              <button
                                onClick={() => handlePlayShotVoice(shot)}
                                className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:underline cursor-pointer"
                              >
                                <Volume2
                                  className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`}
                                />
                                <span>{isPlaying ? 'Speaking...' : 'Play Voice'}</span>
                              </button>
                            </div>

                            <textarea
                              rows={2}
                              value={shot.dialogue}
                              onChange={(e) =>
                                handleUpdateShot(scene.id, shot.id, { dialogue: e.target.value })
                              }
                              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-indigo-500 text-white text-xs p-3 rounded-xl focus:outline-none transition-colors font-sans leading-relaxed"
                              placeholder="Enter spoken lines for this shot..."
                            />
                          </div>

                          {/* Secondary Production Parameters */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                            <div>
                              <label className="text-[10px] text-zinc-500">CAMERA ANGLE</label>
                              <select
                                value={shot.camera}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, { camera: e.target.value })
                                }
                                className="w-full mt-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="medium / eye-level">Medium / Eye-Level</option>
                                <option value="close-up / dutch-angle">Close-Up / Dutch Angle</option>
                                <option value="wide / low-angle">Wide / Low Angle</option>
                                <option value="medium-close / frontal">Medium-Close / Frontal</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-zinc-500">MOTION PRESET</label>
                              <select
                                value={shot.motionPreset}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, { motionPreset: e.target.value })
                                }
                                className="w-full mt-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="subtle_head">Subtle Head Nod</option>
                                <option value="hand_emphasis">Hand Gesture Emphasis</option>
                                <option value="talking_neutral">Talking Neutral Cadence</option>
                                <option value="shoulder_shrug">Shoulder Shrug</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-zinc-500">FALLBACK STRATEGY</label>
                              <select
                                value={shot.fallbackStrategy}
                                onChange={(e) =>
                                  handleUpdateShot(scene.id, shot.id, {
                                    fallbackStrategy: e.target.value as any,
                                  })
                                }
                                className="w-full mt-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="static_pose_animation">Static Pose Animation</option>
                                <option value="camera_motion_fallback">Ken Burns Camera Pan</option>
                                <option value="alternative_motion_provider">Alternative Provider</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Shot Button */}
                    <button
                      onClick={() => handleAddShot(scene.id)}
                      className="w-full py-3 border border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/30 hover:bg-zinc-800/40 rounded-2xl text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Add Shot to Scene #{scene.sceneNumber}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Script Structure */}
      {activeTab === 'script' && (
        <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-light text-white">
              Formulaic Narrative Structure
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              TSICVIDIA translates high-retention structural beats into deterministic shot assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-indigo-400 font-semibold">1. THE HOOK (0–4s)</span>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                {currentEpisode.script.structure.hook}
              </p>
            </div>

            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-indigo-400 font-semibold">2. THE SETUP (4–8s)</span>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                {currentEpisode.script.structure.setup}
              </p>
            </div>

            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-indigo-400 font-semibold">3. THE OBSERVATION & CONFLICT</span>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                {currentEpisode.script.structure.conflict}
              </p>
            </div>

            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1.5">
              <span className="text-emerald-400 font-semibold">4. THE PUNCHLINE & CTA</span>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                {currentEpisode.script.structure.punchline}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
