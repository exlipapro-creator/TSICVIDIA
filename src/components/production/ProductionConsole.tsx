import React, { useState } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  DollarSign,
  Download,
  FileCode2,
  Layers,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Eye,
  Film,
} from 'lucide-react';
import { ProductionDAGNode, ProductionJob, ProductionManifest, Universe } from '../../types';
import confetti from 'canvas-confetti';
import { audioSynthesizer } from '../../lib/audioSynthesizer';

interface ProductionConsoleProps {
  universe: Universe;
  manifest: ProductionManifest | null;
  activeJob: ProductionJob | null;
  onExecuteProduction: (manifest: ProductionManifest) => void;
  onOpenReproducibilityReport: (manifest: ProductionManifest) => void;
}

export const ProductionConsole: React.FC<ProductionConsoleProps> = ({
  universe,
  manifest,
  activeJob,
  onExecuteProduction,
  onOpenReproducibilityReport,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dag' | 'lineage' | 'manifest_json'>('dag');

  if (!manifest) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        No compiled production manifest found. Open an episode and click "Compile Production IR".
      </div>
    );
  }

  const selectedNode = manifest.executionGraph.find((n) => n.id === selectedNodeId) || manifest.executionGraph[0];

  const handleStartExecution = () => {
    audioSynthesizer.playStudioChime('compile');
    onExecuteProduction(manifest);
  };

  const handleDownloadManifest = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${manifest.manifestId}.manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              PRODUCTION IR CONSOLE
            </span>
            <span className="text-xs text-zinc-500 font-mono truncate max-w-md">
              {manifest.manifestHash}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Production Compilation Manifest <span className="text-zinc-500 font-normal">({manifest.manifestId})</span>
          </h1>
        </div>

        {/* Execution & Report Triggers */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenReproducibilityReport(manifest)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reproducibility Report</span>
          </button>

          <button
            onClick={handleDownloadManifest}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
            title="Download JSON IR"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export IR</span>
          </button>

          <button
            onClick={handleStartExecution}
            disabled={activeJob?.status === 'RUNNING'}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
              activeJob?.status === 'RUNNING'
                ? 'bg-amber-600/50 text-white cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className="w-4 h-4 fill-current stroke-none" />
            <span>{activeJob?.status === 'RUNNING' ? 'Executing DAG...' : 'Execute DAG Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Production Metrics & Cost Estimation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase">ESTIMATED COST</span>
          <div className="text-2xl font-light text-white flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            <span>${manifest.estimatedCost.total.toFixed(3)}</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            Visual: ${manifest.estimatedCost.visual} • Voice: ${manifest.estimatedCost.voice}
          </div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase">CACHE SAVINGS</span>
          <div className="text-2xl font-light text-emerald-400 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>+${manifest.estimatedCost.estimatedCacheSavings.toFixed(3)}</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            ~38% Artifact Reuse
          </div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase">DAG NODES</span>
          <div className="text-2xl font-light text-white">
            {manifest.executionGraph.length} Nodes
          </div>
          <div className="text-[10px] text-zinc-500">
            {manifest.shots.length} Shots • 1 Master Render
          </div>
        </div>

        <div className="p-5 bg-[#121215] border border-zinc-800 rounded-[32px] space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase">VERSION LOCKS</span>
          <div className="text-2xl font-light text-emerald-400">
            {Object.keys(manifest.characterBindings).length} Active Locks
          </div>
          <div className="text-[10px] text-zinc-500">
            Milo (v3.2) • Zara (v2.1)
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('dag')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'dag'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Directed Acyclic Graph (DAG)
          </button>
          <button
            onClick={() => setActiveTab('lineage')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'lineage'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Lineage Inspector
          </button>
          <button
            onClick={() => setActiveTab('manifest_json')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'manifest_json'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Raw Production IR JSON
          </button>
        </div>
      </div>

      {/* TAB 1: DAG Execution Graph Visualizer */}
      {activeTab === 'dag' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive DAG Node Flow */}
          <div className="lg:col-span-8 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-semibold uppercase">
                Execution Pipeline Flow ({manifest.executionGraph.length} Steps)
              </span>
              <span className="text-emerald-400 font-semibold">
                {activeJob?.status || 'QUEUED'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {manifest.executionGraph.map((node, nIdx) => {
                const isSelected = node.id === selectedNodeId;
                const isRunning = node.status === 'RUNNING';
                const isCompleted = node.status === 'COMPLETED' || !activeJob;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-2xl border text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800/60 border-indigo-500 text-white shadow-md'
                        : 'bg-zinc-800/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                          {nIdx + 1}
                        </span>
                        <span className="font-medium text-white">
                          {node.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {node.cacheHit && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                            CACHE HIT
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                            node.status === 'COMPLETED' || (!activeJob && node.status !== 'FAILED')
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : node.status === 'RUNNING'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : node.status === 'RETRYING'
                              ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                              : node.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {node.status === 'COMPLETED' || (!activeJob && node.status !== 'FAILED')
                            ? 'COMPLETED'
                            : node.status}
                        </span>
                      </div>
                    </div>

                    {node.errorMessage && (
                      <div className="text-[10px] text-rose-400 mt-1 pl-7 font-mono">
                        Error: {node.errorMessage}
                      </div>
                    )}

                    {node.cacheKey && (
                      <div className="text-[10px] text-zinc-500 mt-1 truncate pl-7">
                        Key: {node.cacheKey}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Node Details & Parameters */}
          <div className="lg:col-span-4 bg-[#121215] border border-zinc-800 rounded-[32px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold uppercase">Node Metadata</span>
              <span className="text-[10px] text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedNode.type}</span>
            </div>

            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px]">NODE ID:</span>
                <div className="text-white font-medium">{selectedNode.id}</div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px]">STATUS:</span>
                <div className="text-zinc-200 font-semibold">{selectedNode.status}</div>
              </div>

              {selectedNode.errorMessage && (
                <div>
                  <span className="text-rose-400 text-[10px]">FAILURE REASON:</span>
                  <div className="text-rose-300 text-[11px]">{selectedNode.errorMessage}</div>
                </div>
              )}

              <div>
                <span className="text-zinc-500 text-[10px]">DEPENDENCIES:</span>
                <div className="text-zinc-300">
                  {selectedNode.dependencies.length > 0
                    ? selectedNode.dependencies.join(', ')
                    : 'None (Root Node)'}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px]">ESTIMATED COST:</span>
                <div className="text-emerald-400 font-semibold">
                  ${selectedNode.cost?.toFixed(3) || '0.000'}
                </div>
              </div>

              {selectedNode.cacheKey && (
                <div>
                  <span className="text-zinc-500 text-[10px]">CACHE KEY (SHA-256):</span>
                  <div className="text-zinc-400 break-all text-[11px]">
                    {selectedNode.cacheKey}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Policy Routing */}
            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-1.5 text-xs font-mono">
              <span className="text-zinc-500 text-[10px]">ROUTED PROVIDER ADAPTER:</span>
              <div className="text-white font-semibold">
                {selectedNode.type === 'base_image'
                  ? manifest.providerAssignments.visual.provider
                  : selectedNode.type === 'voice_synthesis'
                  ? manifest.providerAssignments.voice.provider
                  : selectedNode.type === 'motion_clip'
                  ? manifest.providerAssignments.motion.provider
                  : 'TSICVIDIA Master Compositor'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Asset Lineage Inspector */}
      {activeTab === 'lineage' && (
        <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 md:p-8 space-y-5 shadow-xl">
          <div>
            <h2 className="text-lg font-light text-white">
              Deterministic Asset Lineage Traceability
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Every rendered pixel is traceable back to its canonical character version, pose vector, voice hash, and provider adapter.
            </p>
          </div>

          <div className="p-5 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Film className="w-4 h-4" />
              <span>Final Video: output/production_master_1080x1920.mp4</span>
            </div>
            <div className="pl-6 border-l-2 border-zinc-800 space-y-3 text-zinc-300">
              <div>
                <span className="text-zinc-500">↳ Scene 01:</span> Opening & Hook at the Rack
              </div>
              <div className="pl-6 border-l-2 border-zinc-800 space-y-2">
                <div>
                  <span className="text-zinc-500">↳ Shot 01 (shot_001):</span> "Rule number one of modern fitness..."
                </div>
                <div className="pl-6 border-l-2 border-zinc-800 space-y-1.5 text-[11px] text-zinc-400">
                  <div>
                    • Animated Motion Clip: <span className="text-white font-medium">LivePortrait Adapter v1.2</span>
                  </div>
                  <div>
                    • Base Visual: <span className="text-white font-medium">Flux.1-Dev-Adapter (Seed: 1042)</span>
                  </div>
                  <div>
                    • Spoken Dialogue Audio: <span className="text-white font-medium">ElevenLabs Milo Vance Voice Profile (sha256:88fa29e81)</span>
                  </div>
                  <div>
                    • Canonical Character Lock: <span className="text-emerald-400 font-medium">Milo Vance @ v3.2</span>
                  </div>
                  <div>
                    • Pose Vector: <span className="text-white font-medium">bench_slouch_02</span> • Expression: <span className="text-white font-medium">deadpan_01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Raw Manifest JSON */}
      {activeTab === 'manifest_json' && (
        <div className="bg-[#09090B] border border-zinc-800 rounded-[32px] p-6 shadow-xl">
          <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px]">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
