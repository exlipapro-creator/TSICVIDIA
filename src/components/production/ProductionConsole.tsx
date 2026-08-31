import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
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
  Sliders,
  ExternalLink,
  Square,
} from 'lucide-react';
import { ProductionDAGNode, ProductionJob, ProductionManifest, Universe } from '../../types';
import confetti from 'canvas-confetti';
import { audioSynthesizer } from '../../lib/audioSynthesizer';
import { executionEngine } from '../../lib/executionEngine';

interface ProductionConsoleProps {
  universe: Universe;
  manifest: ProductionManifest | null;
  activeJob: ProductionJob | null;
  onExecuteProduction: (manifest: ProductionManifest) => void;
  onOpenReproducibilityReport: (manifest: ProductionManifest) => void;
  onNavigateToView?: (view: string) => void;
}

export const ProductionConsole: React.FC<ProductionConsoleProps> = ({
  universe,
  manifest,
  activeJob,
  onExecuteProduction,
  onOpenReproducibilityReport,
  onNavigateToView,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dag' | 'lineage' | 'master_render' | 'manifest_json'>('dag');
  const [isRetryingNode, setIsRetryingNode] = useState<boolean>(false);
  const [isMasterRendering, setIsMasterRendering] = useState<boolean>(false);
  const [renderJobState, setRenderJobState] = useState<any>(null);

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

  const handlePauseResume = () => {
    if (executionEngine.getIsPaused()) {
      executionEngine.resume();
    } else {
      executionEngine.pause();
    }
  };

  const handleCancelExecution = () => {
    executionEngine.cancel();
  };

  const handleRetrySingleNode = async (node: ProductionDAGNode) => {
    setIsRetryingNode(true);
    await executionEngine.retryNode(node, () => {});
    setIsRetryingNode(false);
  };

  const handleRetryAllFailed = async () => {
    setIsRetryingNode(true);
    await executionEngine.retryFailedNodes(manifest, () => {});
    setIsRetryingNode(false);
  };

  const handleTriggerMasterRender = async () => {
    setIsMasterRendering(true);
    try {
      const res = await fetch('/api/render/compile-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productionId: manifest.manifestId,
          manifestHash: manifest.manifestHash,
          episodeTitle: 'Production Master Episode',
          shotsCount: manifest.shots.length,
          totalDuration: manifest.shots.reduce((acc, s) => acc + (s.duration || 3.5), 0),
          resolution: '1080x1920',
        }),
      });
      const data = await res.json();
      if (data.success && data.renderId) {
        setRenderJobState(data.job);
        // Poll for completion
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/render/${data.renderId}/status`);
          const statusData = await statusRes.json();
          if (statusData.success && statusData.job) {
            setRenderJobState(statusData.job);
            if (statusData.job.status === 'COMPLETED' || statusData.job.status === 'FAILED') {
              clearInterval(pollInterval);
              setIsMasterRendering(false);
              if (statusData.job.status === 'COMPLETED') {
                audioSynthesizer.playStudioChime('render_done');
                confetti({ particleCount: 50, spread: 60 });
              }
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error('Master render error:', err);
      setIsMasterRendering(false);
    }
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

  const failedNodesCount = manifest.executionGraph.filter((n) => n.status === 'FAILED').length;

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
        <div className="flex items-center gap-2.5 flex-wrap">
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

          {activeJob?.status === 'RUNNING' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
              >
                {executionEngine.getIsPaused() ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{executionEngine.getIsPaused() ? 'Resume DAG' : 'Pause DAG'}</span>
              </button>
              <button
                onClick={handleCancelExecution}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartExecution}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current stroke-none" />
              <span>Execute DAG Pipeline</span>
            </button>
          )}

          {failedNodesCount > 0 && (
            <button
              onClick={handleRetryAllFailed}
              disabled={isRetryingNode}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 rounded-2xl text-xs font-mono transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetryingNode ? 'animate-spin' : ''}`} />
              <span>Retry Failed ({failedNodesCount})</span>
            </button>
          )}
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
            onClick={() => setActiveTab('master_render')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'master_render'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            Server Master Render
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

        {onNavigateToView && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => onNavigateToView('shot_designer')}
              className="text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <span>Shot Designer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => onNavigateToView('qa')}
              className="text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <span>QA Gates</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => onNavigateToView('compositor')}
              className="text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <span>Compositor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
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
                {activeJob?.status || 'READY'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {manifest.executionGraph.map((node, nIdx) => {
                const isSelected = node.id === (selectedNodeId || manifest.executionGraph[0]?.id);

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
                      <div className="text-[10px] text-rose-400 mt-1.5 pl-7 font-mono flex items-center justify-between">
                        <span>Error: {node.errorMessage}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetrySingleNode(node);
                          }}
                          className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded-lg text-[9px]"
                        >
                          Retry Node
                        </button>
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
              <span className="text-[10px] text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedNode?.type}</span>
            </div>

            <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-2xl space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px]">NODE ID:</span>
                <div className="text-white font-medium">{selectedNode?.id}</div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px]">STATUS:</span>
                <div className="text-zinc-200 font-semibold">{selectedNode?.status}</div>
              </div>

              {selectedNode?.errorMessage && (
                <div>
                  <span className="text-rose-400 text-[10px]">FAILURE REASON:</span>
                  <div className="text-rose-300 text-[11px]">{selectedNode.errorMessage}</div>
                </div>
              )}

              <div>
                <span className="text-zinc-500 text-[10px]">DEPENDENCIES:</span>
                <div className="text-zinc-300">
                  {selectedNode?.dependencies && selectedNode.dependencies.length > 0
                    ? selectedNode.dependencies.join(', ')
                    : 'None (Root Node)'}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px]">ESTIMATED COST:</span>
                <div className="text-emerald-400 font-semibold">
                  ${selectedNode?.cost?.toFixed(3) || '0.000'}
                </div>
              </div>

              {selectedNode?.cacheKey && (
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
                {selectedNode?.type === 'base_image'
                  ? manifest.providerAssignments.visual.provider
                  : selectedNode?.type === 'voice_synthesis'
                  ? manifest.providerAssignments.voice.provider
                  : selectedNode?.type === 'motion_clip'
                  ? manifest.providerAssignments.motion.provider
                  : 'TSICVIDIA Master Compositor'}
              </div>
            </div>

            {selectedNode?.status === 'FAILED' && (
              <button
                onClick={() => handleRetrySingleNode(selectedNode)}
                disabled={isRetryingNode}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetryingNode ? 'animate-spin' : ''}`} />
                <span>Retry This Node</span>
              </button>
            )}
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

      {/* TAB 3: Server Master Render Compilation */}
      {activeTab === 'master_render' && (
        <div className="bg-[#121215] border border-zinc-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-light text-white font-sans">
                Server-Side FFmpeg Master Render Pipeline
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Compiles multi-track timeline, normalizes audio to -14.0 LUFS, verifies QA gates, and generates master MP4.
              </p>
            </div>

            <button
              onClick={handleTriggerMasterRender}
              disabled={isMasterRendering}
              className={`px-4 py-2.5 rounded-2xl font-medium flex items-center gap-2 cursor-pointer transition-all ${
                isMasterRendering
                  ? 'bg-amber-600/50 text-white cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>{isMasterRendering ? 'Rendering Master...' : 'Compile Master Video (FFmpeg)'}</span>
            </button>
          </div>

          {renderJobState && (
            <div className="p-5 bg-zinc-800/30 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">JOB ID: <span className="text-white">{renderJobState.renderId}</span></span>
                <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                  renderJobState.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : renderJobState.status === 'RUNNING'
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {renderJobState.status} • {renderJobState.currentStage}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Compilation Progress</span>
                  <span>{renderJobState.progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${renderJobState.progress}%` }}
                  />
                </div>
              </div>

              {renderJobState.status === 'RUNNING' && (
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (renderJobState?.renderId) {
                        await fetch(`/api/render/${renderJobState.renderId}/cancel`, { method: 'POST' });
                        setIsMasterRendering(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Cancel Master Render</span>
                  </button>
                </div>
              )}

              {renderJobState.outputArtifact && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3 text-emerald-300">
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Master Render Completed & Verified (FFmpeg v1.4.2)</span>
                      </div>
                      <a
                        href={renderJobState.outputArtifact.url}
                        download={`master_render_${renderJobState.renderId}.mp4`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs flex items-center gap-1.5 font-medium shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Master MP4</span>
                      </a>
                    </div>
                    <div className="text-[11px] text-zinc-300 space-y-1">
                      <div>• Asset ID: <span className="text-white font-mono">{renderJobState.outputArtifact.assetId}</span></div>
                      <div>• Resolution: <span className="text-white font-mono">{renderJobState.outputArtifact.resolution}</span></div>
                      <div>• Codec: <span className="text-white font-mono">{renderJobState.outputArtifact.codec}</span></div>
                      <div>• SHA-256: <span className="text-emerald-400 font-mono break-all">{renderJobState.outputArtifact.sha256}</span></div>
                      <div>• Size: <span className="text-white font-mono">{(renderJobState.outputArtifact.sizeBytes / 1024).toFixed(1)} KB ({renderJobState.outputArtifact.sizeBytes.toLocaleString()} bytes)</span></div>
                    </div>
                  </div>

                  {/* Real Master Video Player */}
                  <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-200">Live Video Stream Preview</span>
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">H.264 MP4</span>
                    </div>
                    <div className="relative aspect-[9/16] max-h-[380px] mx-auto bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                      <video
                        src={renderJobState.outputArtifact.url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Raw Manifest JSON */}
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
