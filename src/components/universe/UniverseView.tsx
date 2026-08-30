import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Package,
  BookOpen,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Workflow,
  CheckCircle2,
  Play,
  ArrowRight,
} from 'lucide-react';
import { Episode, Universe, ProductionRecipe } from '../../types';
import { audioSynthesizer } from '../../lib/audioSynthesizer';

interface UniverseViewProps {
  universe: Universe;
  onUpdateUniverse: (universe: Universe) => void;
  onCreateEpisodeFromRecipe?: (recipe: ProductionRecipe) => void;
}

export const UniverseView: React.FC<UniverseViewProps> = ({
  universe,
  onUpdateUniverse,
  onCreateEpisodeFromRecipe,
}) => {
  const [activeTab, setActiveTab] = useState<'locations' | 'props' | 'rules' | 'recipes'>('recipes');

  const recipes = universe.recipes || [
    {
      id: 'recipe_comedy_short',
      name: 'Viral Satire / Comedy Short (6-Stage)',
      category: 'comedy_short' as const,
      description: 'High-velocity format with hook provocation, rapid escalation, deadpan observation, and sharp punchline resolution.',
      targetDuration: 22,
      structure: [
        { stage: 'hook' as const, label: 'Provocative Hook Rule', suggestedCamera: 'medium / eye-level', suggestedEmotion: 'deadpan', durationRatio: 0.22, guideline: 'Challenge a popular modern ritual with bold contrarian irony.' },
        { stage: 'setup' as const, label: 'Cultural Observation', suggestedCamera: 'close-up / 45-deg', suggestedEmotion: 'confused', durationRatio: 0.22, guideline: 'Paint the ridiculous mental picture of common behavior.' },
        { stage: 'conflict' as const, label: 'Personal Vulnerability', suggestedCamera: 'medium-close / profile', suggestedEmotion: 'deadpan', durationRatio: 0.20, guideline: 'Contrast the cultural pressure with real human limitation.' },
        { stage: 'observation' as const, label: 'Philosophical Axiom', suggestedCamera: 'three-quarter / low-angle', suggestedEmotion: 'smug', durationRatio: 0.18, guideline: 'Deliver the core thesis like an immutable natural law.' },
        { stage: 'punchline' as const, label: 'Decisive Punchline', suggestedCamera: 'close-up / eye-level', suggestedEmotion: 'deadpan', durationRatio: 0.12, guideline: 'Wrap with tight comedic reversal.' },
        { stage: 'cta' as const, label: 'Minimalist Sign-off', suggestedCamera: 'medium / frontal', suggestedEmotion: 'happy', durationRatio: 0.06, guideline: 'Direct tap-to-follow or community prompt.' },
      ],
    },
    {
      id: 'recipe_educational_teardown',
      name: 'System Architecture Breakdown',
      category: 'educational_breakdown' as const,
      description: 'Clear, high-retention technical dissection of complex systems with vector overlays and precise dialogue.',
      targetDuration: 30,
      structure: [
        { stage: 'hook' as const, label: 'Core Problem Statement', suggestedCamera: 'medium / frontal', suggestedEmotion: 'serious', durationRatio: 0.15, guideline: 'State the costly bottleneck or naive assumption.' },
        { stage: 'setup' as const, label: 'Architectural Fallacy', suggestedCamera: 'three-quarter / low-angle', suggestedEmotion: 'analytical', durationRatio: 0.25, guideline: 'Deconstruct why traditional approaches break down.' },
        { stage: 'observation' as const, label: 'First Principles Solution', suggestedCamera: 'close-up / eye-level', suggestedEmotion: 'confident', durationRatio: 0.35, guideline: 'Demonstrate the exact structural breakthrough.' },
        { stage: 'punchline' as const, label: 'Actionable Takeaway', suggestedCamera: 'medium / eye-level', suggestedEmotion: 'neutral', durationRatio: 0.25, guideline: 'Summary rule to implement immediately.' },
      ],
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              UNIVERSE STATE & RECIPES
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Persistent World Coherence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            {universe.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {universe.description}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'recipes'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production Recipes ({recipes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'locations'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Locations ({universe.locations.length})
        </button>
        <button
          onClick={() => setActiveTab('props')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'props'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Props & Objects ({universe.props.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          Canon Invariants ({universe.rules.length})
        </button>
      </div>

      {/* TAB 0: Production Recipes */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start justify-between">
            <div>
              <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
                The Serialized Media Franchise Engine
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                A <strong>Production Recipe</strong> is a reusable narrative template that binds with persistent Universe characters and topics to author structured productions at scale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#121215] border border-zinc-800 rounded-[28px] p-6 space-y-5 shadow-xl hover:border-zinc-700/80 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-semibold">
                      {recipe.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Target: {recipe.targetDuration}s
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-100">{recipe.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{recipe.description}</p>

                  {/* Stage Sequence */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">
                      Narrative Blueprint Stages ({recipe.structure.length}):
                    </span>
                    <div className="space-y-1.5">
                      {recipe.structure.map((stage, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-zinc-200 font-medium">{stage.label}</span>
                          </div>
                          <span className="text-[10px] text-indigo-400">{stage.suggestedEmotion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioSynthesizer.playStudioChime('compile');
                    onCreateEpisodeFromRecipe?.(recipe);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Workflow className="w-4 h-4" />
                  <span>Instantiate New Episode from Recipe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Locations */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {universe.locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-[#121215] border border-zinc-800 rounded-[28px] overflow-hidden shadow-xl"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-900">
                <img
                  src={loc.backgroundUrl}
                  alt={loc.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <div className="text-base font-medium">{loc.name}</div>
                  <div className="text-[10px] font-mono text-indigo-400">ID: {loc.id}</div>
                </div>
              </div>

              <div className="p-5 space-y-3 font-mono text-xs">
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">{loc.description}</p>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 text-[10px]">LIGHTING & ATMOSPHERE:</span>
                  <div className="text-emerald-400 text-[11px] font-medium">{loc.lighting}</div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-zinc-500 text-[10px]">PALETTE:</span>
                  <div className="flex gap-1.5">
                    {loc.palette.map((c, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-lg border border-zinc-700/60 shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Props */}
      {activeTab === 'props' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-xs">
          {universe.props.map((prop) => (
            <div
              key={prop.id}
              className="bg-[#121215] border border-zinc-800 rounded-[28px] p-5 space-y-3 shadow-xl"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img src={prop.canonicalImage} alt={prop.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-sm font-medium text-white flex items-center justify-between">
                <span>{prop.name}</span>
                <Package className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: World Rules */}
      {activeTab === 'rules' && (
        <div className="bg-[#121215] border border-zinc-800 rounded-[28px] p-6 md:p-8 space-y-5 shadow-xl">
          <div>
            <h2 className="text-lg font-light text-white">
              Canon World Invariants & Stylistic Guardrails
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              These rules are injected into prompt sanitization and QA validation for all episodes.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {universe.rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-start gap-3.5 text-zinc-200"
              >
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-indigo-400 font-medium">Rule {idx + 1}: </span>
                  <span>{rule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
