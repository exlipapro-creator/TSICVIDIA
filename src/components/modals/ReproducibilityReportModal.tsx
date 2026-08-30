import React from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, Download, Terminal, Lock } from 'lucide-react';
import { ProductionManifest } from '../../types';

interface ReproducibilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: ProductionManifest | null;
}

export const ReproducibilityReportModal: React.FC<ReproducibilityReportModalProps> = ({
  isOpen,
  onClose,
  manifest,
}) => {
  if (!isOpen || !manifest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#10141A] border border-[#263143] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#141922] border-b border-[#222A38] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Deterministic Reproducibility & Audit Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Manifest: {manifest.manifestId}
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {/* Certificate Badge */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% REPRODUCIBLE DETERMINISTIC BUILD</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Every shot in this production was compiled with deterministic random seeds, immutable character version locks, and content-addressable SHA-256 prompt hashes. Running this manifest anywhere yields identical video output.
            </p>
          </div>

          {/* Compilation Signatures */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#0B0E13] rounded-xl border border-[#1C222E] space-y-1">
              <span className="text-slate-400 text-[10px]">MANIFEST SHA-256 FINGERPRINT:</span>
              <div className="text-emerald-400 text-[11px] break-all">{manifest.manifestHash}</div>
            </div>

            <div className="p-3.5 bg-[#0B0E13] rounded-xl border border-[#1C222E] space-y-1">
              <span className="text-slate-400 text-[10px]">COMPILER ENGINE VERSION:</span>
              <div className="text-white text-[11px] font-bold">TSICVIDIA IR v2024.11-RELEASE</div>
            </div>
          </div>

          {/* Character Locks Checklist */}
          <div className="p-4 bg-[#0B0E13] rounded-xl border border-[#1C222E] space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <Lock className="w-4 h-4 text-[#FF9F24]" />
              <span>Locked Character Dependencies</span>
            </div>
            <div className="space-y-1 text-slate-300">
              {Object.entries(manifest.characterBindings).map(([charId, ver]) => (
                <div key={charId} className="flex items-center justify-between py-1 border-b border-[#171D27]">
                  <span>Character: <strong className="text-white">{charId}</strong></span>
                  <span className="text-emerald-400 font-bold">{ver} (Locked)</span>
                </div>
              ))}
            </div>
          </div>

          {/* CLI Invocation Command */}
          <div className="p-4 bg-[#080A0D] rounded-xl border border-[#1C222E] space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Terminal className="w-3.5 h-3.5 text-[#FF9F24]" />
                CLI Recompilation Command:
              </span>
              <span>bash</span>
            </div>
            <pre className="text-emerald-400 text-[11px] p-2 bg-[#050608] rounded border border-white/5 overflow-x-auto">
              {`tsicvidia compile --manifest ${manifest.manifestId} --policy balanced --strict-seed --output dist/`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#141922] border-t border-[#222A38] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222B3B] hover:bg-[#2C374A] text-white rounded-xl text-xs font-semibold font-mono transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
