import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Play,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Film,
  Users,
  HardDrive,
  FileCode2,
  Plus,
  Calendar,
} from 'lucide-react';
import { Episode, ProductionJob, Universe } from '../../types';

interface DashboardViewProps {
  universe: Universe;
  episodes: Episode[];
  activeJob: ProductionJob | null;
  onSelectEpisode: (episodeId: string) => void;
  onSelectView: (viewId: any) => void;
  onTriggerCompile: (episodeId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  universe,
  episodes,
  activeJob,
  onSelectEpisode,
  onSelectView,
  onTriggerCompile,
}) => {
  const currentEpisode = episodes[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Bento Grid Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Tile 1: Hero Active Project (Span 8) */}
        <div className="md:col-span-8 bg-[#121215] border border-zinc-800 rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full text-xs font-medium border border-zinc-700/50 mb-4 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span>Active Universe: {universe?.name || 'Canonical Universe'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-light leading-tight text-[#FAFAFA]">
              {currentEpisode?.title || 'Nebula Brand System'}<br />
              <span className="text-zinc-500 font-normal">Deterministic Engine</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
              Characters are persistent state; AI providers execute instructions. Compile repeatable 4-beat episodic productions with locked visual DNA.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 relative z-10 mt-6 pt-4 border-t border-zinc-800/60">
            {/* Character Avatar Stack */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {universe.characters.slice(0, 3).map((char) => (
                  <img
                    key={char.id}
                    src={char.avatarUrl}
                    alt={char.name}
                    title={`${char.name} (${char.currentVersion})`}
                    className="w-12 h-12 rounded-2xl object-cover bg-zinc-800 border-2 border-[#121215] hover:scale-110 transition-transform"
                  />
                ))}
              </div>
              <div
                onClick={() => onSelectView('characters')}
                className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-medium text-xs cursor-pointer hover:bg-indigo-600/30 transition-colors"
              >
                +{universe.characters.length > 3 ? universe.characters.length - 3 : universe.characters.length}
              </div>
              <span className="text-xs text-zinc-400 font-medium ml-1">DNA Locked</span>
            </div>

            {/* Completion & Execution Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-zinc-500 mb-0.5">DAG Completion</div>
                <div className="text-2xl font-mono text-[#FAFAFA]">
                  {activeJob?.progressPercent ?? 100}%
                </div>
              </div>
              <button
                onClick={() => onTriggerCompile(currentEpisode?.id || 'ep_gym_ego')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-medium transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Compile Now</span>
              </button>
            </div>
          </div>

          {/* Ambient Indigo Glow */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Tile 2: Cache & Deterministic Storage (Span 4) */}
        <div className="md:col-span-4 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-zinc-400 text-sm font-medium">Deterministic Cache</span>
              </div>
              <span className="text-xs font-mono text-indigo-400 font-semibold">94.2%</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[94.2%] rounded-full"></div>
            </div>
            <div className="mt-3 flex justify-between text-xs text-zinc-500 font-mono">
              <span>SHA-256 Hit Rate</span>
              <span>Saved ~$0.84 / run</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Quality Gates Status</span>
              <span className="text-emerald-400 font-mono font-medium">5/5 PASS</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Broadcast LUFS -14dB • Visual identity 0.94 drift ratio
            </p>
          </div>
        </div>

        {/* Tile 3: Team / Character Pulse (Span 4) */}
        <div className="md:col-span-4 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 flex flex-col justify-between">
          <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Character Pulse</span>
            <span
              onClick={() => onSelectView('characters')}
              className="text-indigo-400 lowercase cursor-pointer hover:underline text-xs"
            >
              view all ({universe.characters.length})
            </span>
          </div>

          <div className="space-y-3.5">
            {universe.characters.slice(0, 3).map((char, index) => {
              const borderColors = [
                'border-indigo-500/40 bg-indigo-500/20',
                'border-emerald-500/40 bg-emerald-500/20',
                'border-orange-500/40 bg-orange-500/20',
              ];
              const statuses = [
                `Locked in ${char.currentVersion} • Visual DNA frozen`,
                `Voice synthesized • ElevenLabs active`,
                `Pose keyframes synced • 24fps target`,
              ];
              return (
                <div
                  key={char.id}
                  onClick={() => onSelectView('characters')}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-full ${borderColors[index % 3]} border flex items-center justify-center shrink-0 overflow-hidden`}>
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-[#FAFAFA] flex items-center justify-between">
                      <span>{char.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{char.currentVersion}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 italic truncate">
                      {statuses[index] || char.archetype}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tile 4: Weekly Compilation Impact (Span 3) */}
        <div className="md:col-span-3 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Weekly Impact</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="h-28 flex items-end gap-2 px-2">
            <div className="flex-1 bg-zinc-800 h-[40%] rounded-t-lg" title="Mon: 8 compiles"></div>
            <div className="flex-1 bg-zinc-800 h-[65%] rounded-t-lg" title="Tue: 14 compiles"></div>
            <div className="flex-1 bg-indigo-500 h-[92%] rounded-t-lg shadow-lg shadow-indigo-500/20" title="Wed: 24 compiles (Peak)"></div>
            <div className="flex-1 bg-zinc-800 h-[55%] rounded-t-lg" title="Thu: 11 compiles"></div>
            <div className="flex-1 bg-zinc-800 h-[75%] rounded-t-lg" title="Fri: 18 compiles"></div>
          </div>

          <div className="mt-4 flex justify-between text-[10px] text-zinc-500 font-mono px-1">
            <span>MON</span>
            <span>WED</span>
            <span>FRI</span>
          </div>
        </div>

        {/* Tile 5: Next Up / Pipeline Sequencer (Span 6) */}
        <div className="md:col-span-6 bg-[#121215] border border-zinc-800 rounded-[32px] p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-medium text-[#FAFAFA]">Production Pipeline</h3>
              <p className="text-xs text-zinc-500">Next staged DAG executions</p>
            </div>
            <button
              onClick={() => onSelectView('productions')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View Full DAG</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => onSelectView('episodes')}
              className="flex items-center justify-between p-3.5 bg-zinc-800/30 rounded-2xl border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                <div>
                  <div className="text-xs font-medium text-[#FAFAFA]">
                    {episodes[0]?.title || 'Gym Ego vs Science Nerd'}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    4-Beat Script • 9:16 Shorts • Ready for Manifest
                  </div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
                COMPILED
              </div>
            </div>

            <div
              onClick={() => onSelectView('qa')}
              className="flex items-center justify-between p-3.5 bg-zinc-800/30 rounded-2xl border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                <div>
                  <div className="text-xs font-medium text-[#FAFAFA]">Quality Gate Diagnostic Pass</div>
                  <div className="text-[11px] text-zinc-500">LUFS Normalization & Facial Landmark Tremor Check</div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                VALIDATED
              </div>
            </div>
          </div>
        </div>

        {/* Tile 6: Bento Quick Create Action (Span 3) */}
        <div
          onClick={() => onTriggerCompile(currentEpisode?.id || 'ep_gym_ego')}
          className="md:col-span-3 bg-indigo-600 rounded-[32px] p-8 flex flex-col justify-between hover:bg-indigo-500 cursor-pointer transition-colors shadow-xl shadow-indigo-600/20 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>

          <div className="text-white mt-8">
            <div className="text-2xl font-medium leading-tight mb-1.5">
              Compile Episode
            </div>
            <div className="text-indigo-100 text-xs leading-relaxed">
              Launch deterministic DAG execution with instant cache lookup
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Bento Grid Row: Persistent Characters & Providers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Characters Grid Tile (Span 8) */}
        <div className="md:col-span-8 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                Universe Characters & Version Locks
              </h3>
            </div>
            <button
              onClick={() => onSelectView('characters')}
              className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Open Character Studio →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {universe.characters.map((char) => (
              <div
                key={char.id}
                onClick={() => onSelectView('characters')}
                className="p-3.5 bg-zinc-800/20 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-11 h-11 rounded-xl object-cover border border-zinc-700 group-hover:border-indigo-400 transition-colors"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-[#FAFAFA] group-hover:text-indigo-300 transition-colors truncate">
                      {char.name}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                      {char.currentVersion} (Locked)
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {char.archetype}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Registry Tile (Span 4) */}
        <div className="md:col-span-4 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                Provider Registry
              </h3>
            </div>
            <button
              onClick={() => onSelectView('settings')}
              className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Config
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-zinc-800/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-zinc-200 font-medium">Flux.1-Dev</div>
                <div className="text-[10px] text-zinc-500">Visual Engine • 2048px</div>
              </div>
              <span className="text-emerald-400 text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full">ONLINE (1.4s)</span>
            </div>

            <div className="p-2.5 bg-zinc-800/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-zinc-200 font-medium">ElevenLabs</div>
                <div className="text-[10px] text-zinc-500">Voice Synthesis</div>
              </div>
              <span className="text-emerald-400 text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full">ONLINE (0.8s)</span>
            </div>

            <div className="p-2.5 bg-zinc-800/30 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-zinc-200 font-medium">Gemini 3.7 Flash</div>
                <div className="text-[10px] text-zinc-500">Script AI</div>
              </div>
              <span className="text-emerald-400 text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
