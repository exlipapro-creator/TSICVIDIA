import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Film,
  User,
  Cpu,
  ShieldCheck,
  Play,
  Layers,
  Sparkles,
  Sliders,
  FolderOpen,
  GitCompare,
  Clock,
  ArrowRight,
  PlusCircle,
  X,
} from 'lucide-react';
import { Episode, Universe } from '../../types';
import { NavView } from '../layout/Sidebar';

interface CommandItem {
  id: string;
  category: 'recent' | 'actions' | 'navigation' | 'episodes' | 'characters';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  onSelect: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: Universe;
  episodes: Episode[];
  selectedEpisodeId: string;
  onSelectEpisode: (id: string) => void;
  onSelectView: (view: NavView) => void;
  onQuickCompile: () => void;
  onOpenAIAssistant: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  universe,
  episodes,
  selectedEpisodeId,
  onSelectEpisode,
  onSelectView,
  onQuickCompile,
  onOpenAIAssistant,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeEpisode = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command list
  const commands: CommandItem[] = [
    // Primary Actions
    {
      id: 'act_compile',
      category: 'actions',
      title: `Compile "${activeEpisode?.title || 'Current Episode'}"`,
      subtitle: 'Run deterministic compilation into Production IR Manifest',
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      badge: 'Execute',
      onSelect: () => {
        onQuickCompile();
        onClose();
      },
    },
    {
      id: 'act_ai_assist',
      category: 'actions',
      title: 'Open AI Script Assistant',
      subtitle: 'Ideate script beats, critique DNA, or refine dialogue with Gemini',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      badge: 'AI Gemini',
      onSelect: () => {
        onOpenAIAssistant();
        onClose();
      },
    },
    {
      id: 'act_run_qa',
      category: 'actions',
      title: 'Open QA Quality Gates Console',
      subtitle: 'Inspect identity embeddings, landmark drift, and audio LUFS',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        onSelectView('qa');
        onClose();
      },
    },
    {
      id: 'act_open_compositor',
      category: 'actions',
      title: 'Open Studio Compositor & Player',
      subtitle: 'Multi-track timeline preview and deterministic rendering',
      icon: <Play className="w-4 h-4 text-blue-400" />,
      onSelect: () => {
        onSelectView('compositor');
        onClose();
      },
    },

    // Navigation
    {
      id: 'nav_dashboard',
      category: 'navigation',
      title: 'Go to Command Center Dashboard',
      subtitle: 'Overview of universe metrics, active cache, and productions',
      icon: <Layers className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('dashboard');
        onClose();
      },
    },
    {
      id: 'nav_episodes',
      category: 'navigation',
      title: 'Go to Episode Editor',
      subtitle: 'Edit scenes, script dialogue, and shot blueprints',
      icon: <Film className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('episodes');
        onClose();
      },
    },
    {
      id: 'nav_shot_designer',
      category: 'navigation',
      title: 'Go to Shot Designer Inspector',
      subtitle: 'Fine-tune camera framing, emotion, and motion drivers',
      icon: <Sliders className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('shot_designer');
        onClose();
      },
    },
    {
      id: 'nav_xsheet',
      category: 'navigation',
      title: 'Go to Exposure Sheet (X-Sheet)',
      subtitle: 'Traditional 24fps/60fps frame-by-frame animation sheet',
      icon: <Clock className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('exposure_sheet');
        onClose();
      },
    },
    {
      id: 'nav_characters',
      category: 'navigation',
      title: 'Go to Character Studio',
      subtitle: 'Manage canonical character DNA, pose libraries, and versions',
      icon: <User className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('characters');
        onClose();
      },
    },
    {
      id: 'nav_universe',
      category: 'navigation',
      title: 'Go to Universe World Builder',
      subtitle: 'Locations, props, production rules, and recipes',
      icon: <Layers className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('universe');
        onClose();
      },
    },
    {
      id: 'nav_assets',
      category: 'navigation',
      title: 'Go to Asset Lineage Library',
      subtitle: 'Content-addressable SHA256 storage and provenance',
      icon: <FolderOpen className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('assets');
        onClose();
      },
    },
    {
      id: 'nav_diffs',
      category: 'navigation',
      title: 'Go to Character Version Diff View',
      subtitle: 'Compare visual and parameter snapshots side-by-side',
      icon: <GitCompare className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('diffs');
        onClose();
      },
    },
    {
      id: 'nav_providers',
      category: 'navigation',
      title: 'Go to Provider Registry & Policies',
      subtitle: 'Capability routing, fallback engines, and latency settings',
      icon: <Sliders className="w-4 h-4 text-zinc-400" />,
      onSelect: () => {
        onSelectView('settings');
        onClose();
      },
    },

    // Episode Switchers
    ...episodes.map((ep) => ({
      id: `ep_${ep.id}`,
      category: 'episodes' as const,
      title: ep.title,
      subtitle: `Episode • ${ep.scenes.reduce((acc, s) => acc + s.shots.length, 0)} shots • ${ep.targetDuration}s (${ep.aspectRatio})`,
      icon: <Film className="w-4 h-4 text-indigo-400" />,
      badge: ep.id === selectedEpisodeId ? 'Current' : 'Switch',
      onSelect: () => {
        onSelectEpisode(ep.id);
        onSelectView('episodes');
        onClose();
      },
    })),

    // Character Profiles
    ...universe.characters.map((char) => {
      const activeVersion =
        char.versions?.find((v) => v.version === char.currentVersion) || char.versions?.[0];
      const voiceId =
        activeVersion?.voiceProfile?.providerVoiceId ||
        activeVersion?.voiceProfile?.voiceName ||
        'Standard Synthetic';
      const isLocked = activeVersion?.isLocked ?? false;

      return {
        id: `char_${char.id}`,
        category: 'characters' as const,
        title: `${char.name} (${char.currentVersion || 'v1.0'})`,
        subtitle: `Canonical Character • Archetype: ${char.archetype || 'Actor'} • Voice: ${voiceId}`,
        icon: <User className="w-4 h-4 text-emerald-400" />,
        badge: isLocked ? 'Locked' : 'Draft',
        onSelect: () => {
          onSelectView('characters');
          onClose();
        },
      };
    }),
  ];

  // Filter commands by query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Handle Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0F1115] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-[#12141A]">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search actions, navigation, episodes, characters, manifests (Type or use ↑↓)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 p-1 mr-1"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 bg-zinc-800/90 text-zinc-400 border border-zinc-700/60 rounded">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-900/60 space-y-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No matching commands or entities found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={cmd.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800/80 text-zinc-400'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium tracking-tight truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        {cmd.badge && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                              cmd.badge === 'Execute' || cmd.badge === 'AI Gemini'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{cmd.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono capitalize hidden sm:inline">
                      {cmd.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-zinc-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#12141A] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">↑</kbd>
              <kbd className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 ml-1">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-zinc-500">TSICVIDIA Intelligence Bar</span>
        </div>
      </div>
    </div>
  );
};
