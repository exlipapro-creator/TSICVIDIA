import React from 'react';
import { X, GitCompare, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Character } from '../../types';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  v1Version: string;
  v2Version: string;
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  character,
  v1Version,
  v2Version,
}) => {
  if (!isOpen || !character) return null;

  const v1 = character.versions.find((v) => v.version === v1Version) || character.versions[1] || character.versions[0];
  const v2 = character.versions.find((v) => v.version === v2Version) || character.versions[0] || character.versions[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#10141A] border border-[#263143] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#141922] border-b border-[#222A38] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-5 h-5 text-[#FF9F24]" />
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Version Diff: {character.name} ({v1?.version} vs {v2?.version})
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Visual DNA & Voice Parameter Audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1F2736] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Version 1 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 border-b border-[#1E2532] pb-2">
                <span>PREVIOUS VERSION: {v1?.version}</span>
                <span className="text-[10px] text-slate-400">Locked Baseline</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-[#0B0E13] rounded-xl border border-[#1C222E]">
                  <span className="text-slate-400 text-[10px]">HAIR & STYLING:</span>
                  <div className="text-slate-200 mt-0.5">{v1?.visualDna.hair}</div>
                </div>

                <div className="p-3 bg-[#0B0E13] rounded-xl border border-[#1C222E]">
                  <span className="text-slate-400 text-[10px]">WARDROBE:</span>
                  <div className="text-slate-200 mt-0.5">{v1?.visualDna.wardrobe}</div>
                </div>

                <div className="p-3 bg-[#0B0E13] rounded-xl border border-[#1C222E]">
                  <span className="text-slate-400 text-[10px]">VOICE STABILITY:</span>
                  <div className="text-slate-200 mt-0.5">
                    {v1?.voiceProfile?.stability !== undefined ? (v1.voiceProfile.stability * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Version 2 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-b border-[#1E2532] pb-2">
                <span>TARGET VERSION: {v2?.version}</span>
                <span className="text-[10px] text-emerald-400">Canonical Active</span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-[#0B0E13] rounded-xl border border-emerald-500/30">
                  <span className="text-slate-400 text-[10px]">HAIR & STYLING:</span>
                  <div className="text-emerald-300 mt-0.5">{v2?.visualDna.hair}</div>
                </div>

                <div className="p-3 bg-[#0B0E13] rounded-xl border border-emerald-500/30">
                  <span className="text-slate-400 text-[10px]">WARDROBE (UPDATED):</span>
                  <div className="text-emerald-300 mt-0.5">{v2?.visualDna.wardrobe}</div>
                </div>

                <div className="p-3 bg-[#0B0E13] rounded-xl border border-emerald-500/30">
                  <span className="text-slate-400 text-[10px]">VOICE STABILITY (BOOSTED):</span>
                  <div className="text-emerald-300 mt-0.5">
                    {v2?.voiceProfile?.stability !== undefined ? (v2.voiceProfile.stability * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#141922] border-t border-[#222A38] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222B3B] hover:bg-[#2C374A] text-white rounded-xl text-xs font-semibold font-mono transition-colors cursor-pointer"
          >
            Close Diff Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
