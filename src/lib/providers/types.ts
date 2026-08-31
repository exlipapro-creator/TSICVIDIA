/**
 * TSICVIDIA Provider Adapter Types & Interfaces
 * Keeps domain models (Character, Episode, Shot, Manifest) provider-agnostic.
 */

export type ProviderExecutionMode =
  | 'REAL_GENERATED_ASSET'
  | 'SIMULATED_PROVIDER'
  | 'CACHED_ASSET'
  | 'MASTER_RENDER'
  | 'UNCONFIGURED_PROVIDER'
  | 'FAILED_PROVIDER'
  | 'LOCAL_PREVIEW'
  | 'REMOTE_EXECUTION';

export type ProviderVerificationStatus =
  | 'LIVE_VERIFIED'
  | 'LOCALLY_VERIFIED'
  | 'NOT_CONFIGURED'
  | 'BALANCE_EXHAUSTED'
  | 'FAILED'
  | 'ARCHITECTURE_READY';

export interface ProviderHealthReport {
  id: string;
  name: string;
  category: 'visual' | 'voice' | 'motion' | 'render' | 'llm' | 'intelligence';
  model: string;
  verificationStatus: ProviderVerificationStatus;
  executionMode: ProviderExecutionMode;
  hasCredential: boolean;
  credentialEnvVar: string;
  lastVerifiedAt?: string;
  lastLatencyMs?: number;
  lastError?: string;
  details?: string;
  routeSummary: string;
}

export interface ProviderCapabilities {
  supportsReferenceImages: boolean;
  supportsCharacterLora: boolean;
  supportsSeed: boolean;
  supportsPoseControl: boolean;
  supportsExpressionControl: boolean;
  supportsAudioDriving: boolean;
  supportsVisemes: boolean;
  supportsStreaming: boolean;
  supportsAsyncGeneration: boolean;
  maxResolution: string;
  estimatedCostPerUnit: number;
  estimatedLatencyMs: number;
  supportedMimeTypes: string[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: 'visual' | 'voice' | 'motion' | 'render' | 'llm';
  endpoint?: string;
  hasCredentials: boolean;
  timeoutMs: number;
  maxRetries: number;
  rateLimitPerMinute: number;
}

export interface ProviderRequest<TPayload = any> {
  requestId: string;
  requestHash: string;
  capability: string;
  modelId: string;
  payload: TPayload;
  seed?: number;
  timeoutMs?: number;
  priority?: 'high' | 'normal' | 'low';
}

export interface NormalizedProviderResult<TOutput = any> {
  status: 'SUCCESS' | 'FAILED' | 'CACHED' | 'QUEUED' | 'RUNNING';
  providerId: string;
  modelId: string;
  assetId: string;
  output: TOutput;
  metadata: Record<string, any>;
  usage: {
    units: number;
    metric: string;
  };
  cost: number;
  durationMs: number;
  requestHash: string;
  providerRequestId: string;
  executionMode: ProviderExecutionMode;
  warnings?: string[];
  error?: string;
}

export interface IProviderAdapter<TPayload = any, TOutput = any> {
  id: string;
  name: string;
  category: 'visual' | 'voice' | 'motion' | 'render' | 'llm';
  
  capabilities(): ProviderCapabilities;
  validateRequest(req: ProviderRequest<TPayload>): { valid: boolean; errors?: string[] };
  estimate(req: ProviderRequest<TPayload>): { estimatedCost: number; estimatedLatencyMs: number };
  execute(req: ProviderRequest<TPayload>): Promise<NormalizedProviderResult<TOutput>>;
  cancel(requestId: string): Promise<boolean>;
  getStatus(requestId: string): Promise<'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'>;
  normalizeResult(rawResult: any, req: ProviderRequest<TPayload>, durationMs: number): NormalizedProviderResult<TOutput>;
}
