import React from 'react';
import {
  Sparkles,
  Search,
  Layers,
  Cpu,
  CheckCircle2,
  Bell,
  Play,
  Share2,
  Film,
  Terminal,
  Activity,
} from 'lucide-react';
import { Episode, ProductionJob, Universe } from '../../types';

interface HeaderProps {
  universe?: Universe;
  currentUniverse?: Universe;
  episodes?: Episode[];
  selectedEpisodeId?: string;
  activeJob?: ProductionJob | null;
  onSelectEpisode?: (id: string) => void;
  onOpenSearch?: () => void;
  onOpenAssistant?: () => void;
  onOpenAIAssistant?: () => void;
  onQuickCompile?: () => void;
  onSelectView?: (viewId: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  universe,
  currentUniverse,
  episodes = [],
  selectedEpisodeId,
  activeJob = null,
  onSelectEpisode,
  onOpenSearch,
  onOpenAssistant,
  onOpenAIAssistant,
  onQuickCompile,
  onSelectView,
}) => {
  const activeUniverse = currentUniverse || universe;
  const universeName = activeUniverse?.name || 'Canonical Production Universe';
  const charCount = activeUniverse?.characters?.length || 0;

  const handleOpenAssistant = () => {
    if (onOpenAssistant) {
      onOpenAssistant();
    } else if (onOpenAIAssistant) {
      onOpenAIAssistant();
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => onSelectView && onSelectView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-[#FAFAFA]">
                TSICVIDIA Studio
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                BENTO v1.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-tight hidden sm:block">
              Deterministic Creative Compilation Engine
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden md:block" />

        {/* Current Active Universe / Project Badge */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-[#121215] border border-zinc-800 rounded-full text-xs">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-zinc-400 font-medium">Universe:</span>
          <span className="text-[#FAFAFA] font-medium">{universeName}</span>
          <span className="text-[10px] text-zinc-400 px-2 py-0.5 bg-zinc-800/80 rounded-full">
            {charCount} Chars
          </span>
        </div>
      </div>

      {/* Center Search Bar (Cmd+K trigger) */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 bg-[#121215] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs text-zinc-400 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            <span>Search characters, shots, manifests, assets...</span>
          </div>
          <kbd className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls & Engine Health */}
      <div className="flex items-center gap-3">
        {/* Engine Health Status */}
        <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 bg-[#121215] border border-zinc-800 rounded-full text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="text-xs font-medium">Engine Ready</span>
          </div>
          <div className="h-3 w-px bg-zinc-800" />
          <div className="text-zinc-400 text-xs font-mono">
            Cache: <span className="text-emerald-400 font-semibold">94.2%</span>
          </div>
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={handleOpenAssistant}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">AI Script Assist</span>
        </button>

        {/* Quick Compile Trigger */}
        {onQuickCompile && (
          <button
            onClick={onQuickCompile}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Cpu className="w-4 h-4 stroke-[2]" />
            <span>Compile Episode</span>
          </button>
        )}

        {/* Active Production Indicator (if executing) */}
        {activeJob && activeJob.status === 'RUNNING' && (
          <div
            onClick={() => onSelectView && onSelectView('productions')}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 rounded-full text-xs font-mono cursor-pointer animate-pulse"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Compiling {activeJob.progressPercent}%</span>
          </div>
        )}
      </div>
    </header>
  );
};
