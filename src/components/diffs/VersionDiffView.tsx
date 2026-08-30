import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Layers,
  Code2,
} from 'lucide-react';
import { Character, CharacterVersion, Universe } from '../../types';

interface VersionDiffViewProps {
  universe: Universe;
}

export const VersionDiffView: React.FC<VersionDiffViewProps> = ({ universe }) => {
  const selectedChar = universe.characters[0];
  const [v1Name, setV1Name] = useState<string>('v3.1');
  const [v2Name, setV2Name] = useState<string>('v3.2');

  const v1 = selectedChar?.versions.find((v) => v.version === v1Name) || selectedChar?.versions[1] || selectedChar?.versions[0];
  const v2 = selectedChar?.versions.find((v) => v.version === v2Name) || selectedChar?.versions[0] || selectedChar?.versions[1];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              DETERMINISTIC VERSION DIFF
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Inspect Visual & Voice Divergence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Character Version Comparison
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Compare changes across character iterations to prevent unintended drift.
          </p>
        </div>

        {/* Version selectors */}
        <div className="flex items-center gap-3 bg-[#121215] border border-zinc-800 px-4 py-2.5 rounded-2xl text-xs font-mono">
          <span className="text-zinc-500">Comparing:</span>
          <span className="text-amber-400 font-semibold">{v1?.version}</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-emerald-400 font-semibold">{v2?.version}</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version 1 */}
        <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                BASELINE: {v1?.version}
              </span>
              <div className="text-[10px] font-mono text-zinc-500">
                Created: {v1 ? new Date(v1.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full">
              LOCKED
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">WARDROBE:</span>
              <p className="text-zinc-200 font-sans text-xs">{v1?.visualDna.wardrobe}</p>
            </div>

            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">VOICE STABILITY:</span>
              <div className="text-zinc-200 font-semibold">
                {v1?.voiceProfile?.stability !== undefined ? (v1.voiceProfile.stability * 100).toFixed(0) : 0}%
              </div>
            </div>

            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">REGISTERED POSES:</span>
              <div className="text-zinc-200 font-semibold">
                {v1?.poseLibrary.length || 0} Poses
              </div>
            </div>
          </div>
        </div>

        {/* Version 2 */}
        <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                TARGET: {v2?.version}
              </span>
              <div className="text-[10px] font-mono text-zinc-500">
                Created: {v2 ? new Date(v2.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
              CANONICAL ACTIVE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-zinc-500 text-[10px]">WARDROBE (MODIFIED):</span>
              <p className="text-emerald-300 font-sans text-xs">{v2?.visualDna.wardrobe}</p>
            </div>

            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-zinc-500 text-[10px]">VOICE STABILITY (INCREASED):</span>
              <div className="text-emerald-400 font-semibold">
                {v2?.voiceProfile?.stability !== undefined ? (v2.voiceProfile.stability * 100).toFixed(0) : 0}% (+6%)
              </div>
            </div>

            <div className="p-4 bg-zinc-800/20 rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-zinc-500 text-[10px]">REGISTERED POSES:</span>
              <div className="text-emerald-400 font-semibold">
                {v2?.poseLibrary.length || 0} Poses (+1 Pointing Forward)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
