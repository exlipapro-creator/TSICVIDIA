import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  FileCode2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Episode, Universe } from '../../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  universe: Universe;
  episode: Episode;
  initialPrompt?: string;
  initialType?: string;
  onApplyChanges?: (text: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  universe,
  episode,
  initialPrompt = '',
  initialType = 'script_generation',
  onApplyChanges,
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [type, setType] = useState<string>(initialType);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt,
          context: {
            universeName: universe?.name || 'Universe',
            episodeTitle: episode?.title || 'Episode',
            characters: (universe?.characters || []).map((c) => `${c.name} (${c.archetype})`),
          },
        }),
      });

      const data = await res.json();
      if (data.status === 'ok') {
        setResponse(data.content);
      } else {
        setResponse('AI generation failed. Please try again.');
      }
    } catch (err) {
      setResponse('Failed to reach backend AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#10141A] border-l border-[#263143] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-[#141922] border-b border-[#222A38] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#C4B5FD]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
              Structured Script & Scene AI
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Powered by Gemini 3.7 Flash
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2736] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Chat Area */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
        {/* Preset Prompt Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setType('script_generation');
                setPrompt('Write a punchy 4-part comedic script about Milo refusing to wipe down gym equipment.');
              }}
              className="px-2 py-1 bg-[#171D27] hover:bg-[#202938] border border-[#273346] text-slate-300 rounded-lg text-[11px] text-left transition-colors cursor-pointer"
            >
              🏋️ Gym Equipment Script
            </button>
            <button
              onClick={() => {
                setType('shot_suggestion');
                setPrompt('Suggest 4 camera shots and motion presets to build tension during a deadpan monologue.');
              }}
              className="px-2 py-1 bg-[#171D27] hover:bg-[#202938] border border-[#273346] text-slate-300 rounded-lg text-[11px] text-left transition-colors cursor-pointer"
            >
              🎬 Tension Camera Shots
            </button>
          </div>
        </div>

        {/* Input Box */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase">
            Creative Instructions:
          </label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate or refine..."
            className="w-full bg-[#0B0E13] border border-[#222A38] focus:border-[#8B5CF6] text-white p-3 rounded-xl focus:outline-none transition-colors text-xs font-sans"
          />

          <button
            onClick={handleRunAI}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#9D74FF] hover:to-[#7C3AED] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Script...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Structured AI Response</span>
              </>
            )}
          </button>
        </div>

        {/* Response Area */}
        {response && (
          <div className="p-4 bg-[#0B0E13] border border-[#232B3B] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Generated Proposition</span>
              </span>
            </div>

            <div className="text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-wrap">
              {response}
            </div>

            {onApplyChanges && (
              <button
                onClick={() => {
                  onApplyChanges(response);
                  onClose();
                }}
                className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Apply to Script Structure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
