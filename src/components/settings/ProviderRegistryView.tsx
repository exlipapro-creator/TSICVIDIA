import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Cpu,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  Server,
  Lock,
  RefreshCw,
  Clock,
  Sparkles,
  Volume2,
  Film,
  FileCode,
  Layers,
  Check,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { ExecutionPolicy } from '../../types';
import { ProviderHealthReport } from '../../lib/providers/types';

export const ProviderRegistryView: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<ExecutionPolicy>('balanced');
  const [healthReports, setHealthReports] = useState<ProviderHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingProvider, setVerifyingProvider] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    providerId: string;
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/providers/health');
      if (res.ok) {
        const data = await res.json();
        if (data.providers) {
          setHealthReports(data.providers);
        }
      }
    } catch (err) {
      console.error('Failed to fetch provider health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleVerifyProvider = async (providerId: string) => {
    try {
      setVerifyingProvider(providerId);
      setVerificationFeedback(null);
      const res = await fetch(`/api/providers/${providerId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setVerificationFeedback({
          providerId,
          success: true,
          message: `Live verification PASSED (${data.durationMs}ms) — ${data.executionMode}`,
          details: data,
        });
      } else {
        setVerificationFeedback({
          providerId,
          success: false,
          message: data.error || 'Verification failed',
          details: data,
        });
      }
      // Refresh list to update timestamps and statuses
      await fetchHealth();
    } catch (err: any) {
      setVerificationFeedback({
        providerId,
        success: false,
        message: err.message || 'Verification network error',
      });
    } finally {
      setVerifyingProvider(null);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'LIVE_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[10px] font-mono font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LIVE VERIFIED
          </span>
        );
      case 'LOCALLY_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-cyan-400 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-[10px] font-mono font-medium">
            <Server className="w-3 h-3 text-cyan-400" /> LOCALLY VERIFIED
          </span>
        );
      case 'BALANCE_EXHAUSTED':
        return (
          <span className="inline-flex items-center gap-1 text-rose-400 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded-full text-[10px] font-mono font-medium">
            <XCircle className="w-3 h-3 text-rose-400" /> BALANCE EXHAUSTED ($0.00)
          </span>
        );
      case 'NOT_CONFIGURED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-400 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/25 rounded-full text-[10px] font-mono font-medium">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> NOT CONFIGURED
          </span>
        );
    }
  };

  const getExecutionModeBadge = (mode: string) => {
    switch (mode) {
      case 'REAL_GENERATED_ASSET':
        return (
          <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded text-[9px] font-mono">
            REAL_GENERATED_ASSET
          </span>
        );
      case 'MASTER_RENDER':
        return (
          <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded text-[9px] font-mono">
            MASTER_RENDER
          </span>
        );
      case 'SIMULATED_PROVIDER':
        return (
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[9px] font-mono">
            SIMULATED_PROVIDER
          </span>
        );
      case 'FAILED_PROVIDER':
        return (
          <span className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded text-[9px] font-mono">
            FAILED_PROVIDER
          </span>
        );
      case 'UNCONFIGURED_PROVIDER':
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded text-[9px] font-mono">
            UNCONFIGURED_PROVIDER
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'intelligence':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'visual':
        return <Film className="w-4 h-4 text-purple-400" />;
      case 'voice':
        return <Volume2 className="w-4 h-4 text-cyan-400" />;
      case 'motion':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'render':
        return <Layers className="w-4 h-4 text-amber-400" />;
      default:
        return <Cpu className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              INFRASTRUCTURE REGISTRY
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Deterministic Provider Pipeline & Truthful Certification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Provider Routing & Execution Matrix
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            TSICVIDIA maintains strict separation between canonical creative state and interchangeable AI generation backends. Every route reports its exact, truthful execution mode without simulated success.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-mono text-zinc-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Matrix
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono transition-all ${
            verificationFeedback.success
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {verificationFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{verificationFeedback.message}</span>
            </div>
            {verificationFeedback.details?.durationMs && (
              <span className="text-[10px] opacity-75 font-mono">
                {verificationFeedback.details.durationMs}ms
              </span>
            )}
          </div>
          {verificationFeedback.details?.sha256 && (
            <div className="mt-2 text-[10px] text-zinc-400 font-mono">
              Asset CAS: {verificationFeedback.details.sha256}
            </div>
          )}
        </div>
      )}

      {/* Live Provider Health Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Live Provider Health & Certification Status
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Current runtime status of all 6 external and local pipeline backends
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            6 Registered Adapters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthReports.map((p) => {
            const isVerifying = verifyingProvider === p.id;
            return (
              <div
                key={p.id}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700/80 transition-all rounded-[28px] p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Icon & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                        {getCategoryIcon(p.category)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white tracking-tight">
                          {p.name}
                        </h3>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {p.model}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Status & Execution Mode */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {getVerificationBadge(p.verificationStatus)}
                    {getExecutionModeBadge(p.executionMode)}
                  </div>

                  {/* Technical Summary Details */}
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed pt-1">
                    {p.details}
                  </p>

                  {/* Route Summary */}
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800/90 space-y-1">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">
                      Execution Route
                    </div>
                    <div className="text-[11px] font-mono text-zinc-300 break-words">
                      {p.routeSummary}
                    </div>
                  </div>

                  {/* Credential Status Row */}
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-zinc-800/80">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-zinc-500" />
                      {p.credentialEnvVar}:
                    </span>
                    <span
                      className={`font-semibold ${
                        p.hasCredential ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {p.hasCredential ? 'CONFIGURED' : 'MISSING'}
                    </span>
                  </div>

                  {/* Error if present */}
                  {p.lastError && (
                    <div className="p-2 bg-rose-950/20 border border-rose-900/40 rounded-xl text-[10px] font-mono text-rose-400 space-y-0.5">
                      <div className="font-semibold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Diagnostics:
                      </div>
                      <div>{p.lastError}</div>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => handleVerifyProvider(p.id)}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/70 rounded-xl text-xs font-mono text-white transition-colors"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        Verifying Live Connection...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        Run Live Verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Selection Cards */}
      <div className="space-y-3 pt-4 border-t border-zinc-800/80">
        <label className="text-xs font-mono font-semibold text-white uppercase flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Active Pipeline Execution Policy
        </label>
        <p className="text-xs text-zinc-400">
          Determines compiler optimization targets across latency, VRAM budgets, and provider step counts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs pt-1">
          {[
            {
              id: 'balanced' as ExecutionPolicy,
              title: 'Balanced',
              desc: 'Optimal tradeoff between speed, fidelity, and cost.',
              cost: '~$0.045 / shot',
            },
            {
              id: 'quality_first' as ExecutionPolicy,
              title: 'Quality First',
              desc: 'Maximum resolution, high step diffusion, highest voice stability.',
              cost: '~$0.082 / shot',
            },
            {
              id: 'speed_first' as ExecutionPolicy,
              title: 'Speed First',
              desc: 'Turbo diffusion models, lower inference latency for quick reviews.',
              cost: '~$0.021 / shot',
            },
            {
              id: 'budget_first' as ExecutionPolicy,
              title: 'Budget First',
              desc: 'Aggressive asset reuse and cached keyframe recycling.',
              cost: '~$0.012 / shot',
            },
          ].map((pol) => {
            const isSel = selectedPolicy === pol.id;
            return (
              <div
                key={pol.id}
                onClick={() => setSelectedPolicy(pol.id)}
                className={`p-5 rounded-[28px] border transition-all cursor-pointer space-y-2 shadow-xl ${
                  isSel
                    ? 'bg-zinc-800/40 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                    : 'bg-[#121215] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{pol.title}</span>
                  {isSel && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-zinc-300 font-sans">{pol.desc}</p>
                <div className="text-[10px] text-emerald-400 pt-1 font-mono">
                  {pol.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
