import React, { useState } from 'react';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  GitBranch,
  Volume2,
  Sparkles,
  Layers,
  Code2,
  CheckCircle2,
  Edit3,
  Save,
  Tag,
  Palette,
  Eye,
  Camera,
  Play,
  Sliders,
  Maximize2,
  GitCompare,
} from 'lucide-react';
import { Character, CharacterVersion, PoseItem, ExpressionItem, Universe } from '../../types';
import { audioSynthesizer } from '../../lib/audioSynthesizer';

interface CharacterStudioProps {
  universe: Universe;
  onUpdateUniverse: (updated: Universe) => void;
  onOpenDiffModal: (char: Character, v1: string, v2: string) => void;
}

export const CharacterStudio: React.FC<CharacterStudioProps> = ({
  universe,
  onUpdateUniverse,
  onOpenDiffModal,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(universe.characters[0]?.id || 'char_milo');
  const [activeTab, setActiveTab] = useState<
    'dna' | 'landmarks' | 'qa_profile' | 'voice' | 'poses' | 'expressions' | 'references' | 'versions' | 'json'
  >('dna');
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  const selectedChar = universe.characters.find((c) => c.id === selectedCharId) || universe.characters[0];
  const activeVersionObj =
    selectedChar?.versions.find((v) => v.version === selectedChar.currentVersion) ||
    selectedChar?.versions[0];

  // Voice Test Handler
  const handleTestVoice = () => {
    if (!activeVersionObj) return;
    setIsPlayingVoice(true);
    const sampleText = `Hello. I am ${selectedChar.name}. My visual identity and voice characteristics are locked into TSICVIDIA version ${activeVersionObj.version}.`;
    audioSynthesizer.speakDialogue(sampleText, {
      pitch: activeVersionObj.voiceProfile.pitch,
      rate: activeVersionObj.voiceProfile.speakingSpeed,
      onEnd: () => setIsPlayingVoice(false),
    });
  };

  // Branch / Create New Version Handler
  const handleCreateNewVersion = () => {
    if (!selectedChar || !activeVersionObj) return;
    const currentVerNumber = parseFloat(activeVersionObj.version.replace('v', '')) || 3.2;
    const nextVer = `v${(currentVerNumber + 0.1).toFixed(1)}`;

    const newVersion: CharacterVersion = {
      ...JSON.parse(JSON.stringify(activeVersionObj)),
      version: nextVer,
      parentVersion: activeVersionObj.version,
      createdAt: new Date().toISOString(),
      changeSummary: `Branched from ${activeVersionObj.version}. Refined styling parameters.`,
      isLocked: false,
    };

    const updatedChar: Character = {
      ...selectedChar,
      currentVersion: nextVer,
      versions: [newVersion, ...selectedChar.versions],
    };

    const updatedUniverse: Universe = {
      ...universe,
      characters: universe.characters.map((c) => (c.id === updatedChar.id ? updatedChar : c)),
    };

    onUpdateUniverse(updatedUniverse);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar & Character Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              CANONICAL CREATIVE STATE
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Never Mutate Production History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Character Studio <span className="text-zinc-500 font-normal">& DNA Operating System</span>
          </h1>
        </div>

        {/* Character Selector Pill Group */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {universe.characters.map((char) => {
            const isSelected = char.id === selectedCharId;
            return (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#121215] border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <img
                  src={char.avatarUrl}
                  alt={char.name}
                  className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                />
                <span>{char.name}</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {char.currentVersion}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Character Card, Quick Preview & Version Lock */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#121215] border border-zinc-800 rounded-[32px] overflow-hidden shadow-xl">
            {/* Visual Portrait */}
            <div className="relative aspect-[4/5] bg-gradient-to-t from-[#09090B] via-transparent to-transparent">
              <img
                src={selectedChar.avatarUrl}
                alt={selectedChar.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/30 to-transparent" />

              {/* Version & Lock Badge Over Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 text-xs font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-medium">{activeVersionObj?.version}</span>
                <span className="text-[10px] text-emerald-400 uppercase">Locked</span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h2 className="text-2xl font-light">
                  {selectedChar.name}
                </h2>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">
                  {selectedChar.archetype}
                </p>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {selectedChar.description}
                </p>
              </div>
            </div>

            {/* Quick Actions under preview */}
            <div className="p-5 bg-[#121215] border-t border-zinc-800/80 space-y-3">
              <button
                onClick={handleTestVoice}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 rounded-2xl text-xs font-medium transition-all cursor-pointer"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingVoice ? 'text-indigo-400 animate-bounce' : 'text-zinc-400'}`} />
                <span>{isPlayingVoice ? 'Synthesizing voice...' : 'Test Voice Preview'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNewVersion}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-medium transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Branch Version</span>
                </button>

                {selectedChar.versions.length > 1 && (
                  <button
                    onClick={() =>
                      onOpenDiffModal(
                        selectedChar,
                        selectedChar.versions[1]?.version || 'v3.1',
                        selectedChar.currentVersion
                      )
                    }
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
                    title="Compare Versions"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Diff</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Version History Tree */}
          <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                Version Tree ({selectedChar.versions.length})
              </span>
              <span className="text-[10px] text-zinc-500">Git Lineage</span>
            </div>

            <div className="space-y-2">
              {selectedChar.versions.map((ver) => {
                const isCurrent = ver.version === selectedChar.currentVersion;
                return (
                  <div
                    key={ver.version}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-zinc-800/40 border-indigo-500/50 text-white'
                        : 'bg-zinc-900/30 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-medium text-white flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        {ver.version}
                        {isCurrent && (
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {ver.changeSummary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Character DNA Workstation */}
        <div className="lg:col-span-8 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 shadow-xl space-y-6">
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('dna')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'dna'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Visual DNA
              </button>
              <button
                onClick={() => setActiveTab('landmarks')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'landmarks'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Vector DNA & Mesh ({activeVersionObj?.vectorLandmarks?.length || 12})
              </button>
              <button
                onClick={() => setActiveTab('qa_profile')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'qa_profile'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                QA Threshold Profile
              </button>
              <button
                onClick={() => setActiveTab('poses')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'poses'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Pose Library ({activeVersionObj?.poseLibrary.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('expressions')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'expressions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Expression Library ({activeVersionObj?.expressionLibrary.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Voice Profile
              </button>
              <button
                onClick={() => setActiveTab('references')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'references'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Reference Sheets
              </button>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'json' ? 'dna' : 'json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{activeTab === 'json' ? 'Visual View' : 'Raw JSON'}</span>
            </button>
          </div>

          {/* TAB 1: Visual DNA Structured Controls */}
          {activeTab === 'dna' && activeVersionObj && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                  <label className="text-[11px] font-mono text-zinc-500 uppercase">
                    Face & Facial Structure
                  </label>
                  <p className="text-xs text-zinc-200 font-medium">
                    {activeVersionObj.visualDna.face}
                  </p>
                </div>

                <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                  <label className="text-[11px] font-mono text-zinc-500 uppercase">
                    Hair Style & Cut
                  </label>
                  <p className="text-xs text-zinc-200 font-medium">
                    {activeVersionObj.visualDna.hair}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: activeVersionObj.visualDna.hairColor }}
                    />
                    <span className="text-[10px] font-mono text-zinc-400">
                      {activeVersionObj.visualDna.hairColor}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                  <label className="text-[11px] font-mono text-zinc-500 uppercase">
                    Eye Morphology & Look
                  </label>
                  <p className="text-xs text-zinc-200 font-medium">
                    {activeVersionObj.visualDna.eyes}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: activeVersionObj.visualDna.eyeColor }}
                    />
                    <span className="text-[10px] font-mono text-zinc-400">
                      {activeVersionObj.visualDna.eyeColor}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1">
                  <label className="text-[11px] font-mono text-zinc-500 uppercase">
                    Body Proportions & Height
                  </label>
                  <p className="text-xs text-zinc-200 font-medium">
                    {activeVersionObj.visualDna.bodyProportions}
                  </p>
                </div>
              </div>

              {/* Wardrobe & Color Palette */}
              <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-3">
                <label className="text-[11px] font-mono text-zinc-500 uppercase">
                  Canonical Wardrobe & Fabrics
                </label>
                <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                  {activeVersionObj.visualDna.wardrobe}
                </p>

                <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {activeVersionObj.visualDna.palette.map((hex, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {activeVersionObj.visualDna.accessories.map((acc, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Constraints / Negative Invariants */}
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enforced Negative Visual Constraints</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {activeVersionObj.visualDna.visualConstraints.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB: Vector DNA & 2D Landmarks (Penpot/Inkscape Reference) */}
          {activeTab === 'landmarks' && activeVersionObj && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
                    2D Vector Landmarks & Skeleton Joint Anchors
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Sub-pixel landmark coordinates used by the QA engine to detect motion drift and facial warping.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  468-pt Mesh Compatible
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(activeVersionObj.vectorLandmarks || [
                  { id: 'lm_jaw_tip', name: 'Mandible Apex Anchor', category: 'jaw', x: 0.502, y: 0.745, confidence: 0.99 },
                  { id: 'lm_eye_pupil_l', name: 'Left Eye Pupil', category: 'eye_pupil', x: 0.420, y: 0.435, confidence: 0.99 },
                  { id: 'lm_eye_pupil_r', name: 'Right Eye Pupil', category: 'eye_pupil', x: 0.580, y: 0.435, confidence: 0.99 },
                  { id: 'lm_mouth_upper', name: 'Upper Lip Viseme Anchor', category: 'mouth_viseme', x: 0.500, y: 0.640, confidence: 0.99 },
                  { id: 'lm_mouth_lower', name: 'Lower Lip Viseme Anchor', category: 'mouth_viseme', x: 0.500, y: 0.685, confidence: 0.99 },
                  { id: 'lm_bone_neck', name: 'Cervical Spine Joint', category: 'skeleton_bone', x: 0.500, y: 0.810, confidence: 0.95 },
                ]).map((lm) => (
                  <div
                    key={lm.id}
                    className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="text-zinc-200 font-medium">{lm.name}</div>
                      <div className="text-[10px] text-zinc-500">{lm.category} ({lm.id})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">({lm.x.toFixed(3)}, {lm.y.toFixed(3)})</div>
                      <div className="text-[10px] text-emerald-400">conf: {(lm.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Character QA Profile */}
          {activeTab === 'qa_profile' && activeVersionObj && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider font-mono">
                  Custom Character Quality & Tolerance Thresholds
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Universal thresholds don't fit stylized characters. This profile sets character-specific validation gates.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="text-zinc-500 text-[10px]">MIN IDENTITY SIMILARITY</div>
                  <div className="text-emerald-400 font-bold text-base">
                    {((activeVersionObj.qaProfile?.identityThreshold ?? 0.88) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-zinc-400">Cosine embedding match on face vector</div>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="text-zinc-500 text-[10px]">MAX ALLOWED POSE VARIANCE</div>
                  <div className="text-amber-400 font-bold text-base">
                    {((activeVersionObj.qaProfile?.allowedPoseVariance ?? 0.12) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-zinc-400">Rotational joint deviation ceiling</div>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="text-zinc-500 text-[10px]">PALETTE DRIFT TOLERANCE</div>
                  <div className="text-indigo-400 font-bold text-base">
                    {((activeVersionObj.qaProfile?.paletteDriftMax ?? 0.05) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-zinc-400">CIELAB ΔE color distance threshold</div>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="text-zinc-500 text-[10px]">BROADCAST AUDIO TARGET</div>
                  <div className="text-cyan-400 font-bold text-base">
                    {activeVersionObj.qaProfile?.lufsTarget ?? -14.0} LUFS
                  </div>
                  <div className="text-[10px] text-zinc-400">Integrated loudness specification</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pose Library */}
          {activeTab === 'poses' && activeVersionObj && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  Pose Anchors reduce creative entropy by 90% during shot compilation.
                </span>
                <span className="text-indigo-400">
                  {activeVersionObj.poseLibrary.length} Registered Poses
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeVersionObj.poseLibrary.map((pose) => (
                  <div
                    key={pose.id}
                    className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-2.5 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-semibold text-white">{pose.name}</span>
                      <span className="text-[10px] text-zinc-400 uppercase px-2 py-0.5 bg-zinc-800 rounded-full">
                        {pose.category}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 font-mono">
                      <span className="text-zinc-500">Landmarks: </span>
                      {pose.landmarks}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pose.semanticTags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Expression Library */}
          {activeTab === 'expressions' && activeVersionObj && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  Canonical facial expressions resolve to explicit vectors instead of arbitrary model prompts.
                </span>
                <span className="text-indigo-400">
                  {activeVersionObj.expressionLibrary.length} Expressions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeVersionObj.expressionLibrary.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl text-center space-y-2.5"
                  >
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-xl">
                      {exp.emotion === 'deadpan'
                        ? '😐'
                        : exp.emotion === 'smug'
                        ? '😏'
                        : exp.emotion === 'confused'
                        ? '🤨'
                        : '🙂'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{exp.name}</div>
                      <div className="text-[10px] font-mono text-zinc-400 capitalize">
                        Intensity: {exp.intensity}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Voice Profile */}
          {activeTab === 'voice' && activeVersionObj && (
            <div className="space-y-4">
              <div className="p-5 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white font-mono">
                      {activeVersionObj.voiceProfile.voiceName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                    {activeVersionObj.voiceProfile.provider}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">PITCH</div>
                    <div className="text-white font-semibold text-sm">
                      {activeVersionObj.voiceProfile.pitch}x
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">SPEED</div>
                    <div className="text-white font-semibold text-sm">
                      {activeVersionObj.voiceProfile.speakingSpeed}x
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">STABILITY</div>
                    <div className="text-white font-semibold text-sm">
                      {(activeVersionObj.voiceProfile.stability * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">SIMILARITY</div>
                    <div className="text-white font-semibold text-sm">
                      {(activeVersionObj.voiceProfile.similarityBoost * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">
                    Emotional Profile & Cadence:{' '}
                  </span>
                  <span className="text-zinc-300">
                    {activeVersionObj.voiceProfile.emotionalProfile}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Reference Sheets */}
          {activeTab === 'references' && activeVersionObj && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeVersionObj.references.map((ref) => (
                <div
                  key={ref.id}
                  className="bg-zinc-800/20 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <img
                    src={ref.url}
                    alt={ref.type}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="p-2.5 text-center text-xs font-mono">
                    <span className="text-white font-medium capitalize">
                      {ref.type.replace('_', ' ')}
                    </span>
                    <div className="text-[9px] text-zinc-500 truncate">
                      {ref.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: Raw JSON View */}
          {activeTab === 'json' && activeVersionObj && (
            <div className="bg-[#09090B] border border-zinc-800 rounded-2xl p-4">
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96">
                {JSON.stringify(activeVersionObj, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
