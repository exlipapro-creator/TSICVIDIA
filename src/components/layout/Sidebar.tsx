import React from 'react';
import {
  LayoutDashboard,
  Film,
  Users,
  Globe,
  Terminal,
  ShieldCheck,
  PlaySquare,
  FolderKanban,
  GitCompare,
  Sliders,
  Sparkles,
  Layers,
  FileCode2,
  Crosshair,
  Timer,
  Network,
  Workflow,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'episodes'
  | 'shot_designer'
  | 'exposure_sheet'
  | 'productions'
  | 'compositor'
  | 'qa'
  | 'characters'
  | 'universe'
  | 'assets'
  | 'diffs'
  | 'settings';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  episodeCount: number;
  characterCount: number;
  activeProductionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  episodeCount,
  characterCount,
  activeProductionsCount,
}) => {
  const navItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, section: 'PRODUCTION' },
    { id: 'episodes', label: 'Episode Director', icon: Film, badge: episodeCount, section: 'PRODUCTION' },
    { id: 'shot_designer', label: 'Shot Designer', icon: Crosshair, section: 'PRODUCTION' },
    { id: 'exposure_sheet', label: 'Exposure Sheet (X-Sheet)', icon: Timer, badge: '60fps', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', section: 'PRODUCTION' },
    { id: 'productions', label: 'Production Graph (DAG)', icon: Workflow, badge: activeProductionsCount > 0 ? activeProductionsCount : undefined, badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', section: 'PRODUCTION' },
    { id: 'compositor', label: 'Studio Compositor', icon: PlaySquare, section: 'PRODUCTION' },
    { id: 'qa', label: 'QA Inspector', icon: ShieldCheck, badge: 'PASS', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', section: 'PRODUCTION' },

    { id: 'characters', label: 'Character Studio', icon: Users, badge: characterCount, section: 'CANONICAL STATE' },
    { id: 'universe', label: 'Universe & Recipes', icon: Globe, section: 'CANONICAL STATE' },
    { id: 'assets', label: 'Asset Library & Lineage', icon: FolderKanban, section: 'CANONICAL STATE' },
    { id: 'diffs', label: 'Version Comparison', icon: GitCompare, section: 'CANONICAL STATE' },

    { id: 'settings', label: 'Provider Fabric', icon: Sliders, section: 'INFRASTRUCTURE' },
  ];

  return (
    <aside className="w-64 bg-[#09090B] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 select-none p-3">
      <div className="space-y-1">
        {/* Navigation Sections */}
        {navItems.map((item, idx) => {
          const isSelected = activeView === item.id;
          const Icon = item.icon;
          const showHeader = idx === 0 || navItems[idx - 1]?.section !== item.section;

          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <div className="px-3 pt-3.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group cursor-pointer ${
                  isSelected
                    ? 'bg-[#121215] text-[#FAFAFA] shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121215]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg ${isSelected ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      item.badgeColor ||
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Compiler Engine Status Bento Footer */}
      <div className="p-4 border border-zinc-800 bg-[#121215] rounded-[24px] mt-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono relative z-10">
          <span className="flex items-center gap-2 text-zinc-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            TSICVIDIA IR
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">Deterministic</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed relative z-10">
          Characters are persistent state. AI is execution.
        </p>
      </div>
    </aside>
  );
};
