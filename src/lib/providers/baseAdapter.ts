/**
 * TSICVIDIA Base Provider Adapter
 * Common lifecycle, validation, timeout guards, and error normalization.
 */

import {
  IProviderAdapter,
  NormalizedProviderResult,
  ProviderCapabilities,
  ProviderConfig,
  ProviderExecutionMode,
  ProviderRequest,
} from './types';

export abstract class BaseProviderAdapter<TPayload = any, TOutput = any>
  implements IProviderAdapter<TPayload, TOutput>
{
  public readonly id: string;
  public readonly name: string;
  public readonly category: 'visual' | 'voice' | 'motion' | 'render' | 'llm';
  protected config: ProviderConfig;
  protected activeRequests = new Map<string, { status: 'RUNNING' | 'COMPLETED' | 'FAILED'; startTime: number }>();

  constructor(config: ProviderConfig) {
    this.id = config.id;
    this.name = config.name;
    this.category = config.category;
    this.config = config;
  }

  public abstract capabilities(): ProviderCapabilities;

  public validateRequest(req: ProviderRequest<TPayload>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    if (!req.requestId) errors.push('Missing requestId');
    if (!req.payload) errors.push('Missing payload');
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  public estimate(req: ProviderRequest<TPayload>): { estimatedCost: number; estimatedLatencyMs: number } {
    const caps = this.capabilities();
    return {
      estimatedCost: caps.estimatedCostPerUnit,
      estimatedLatencyMs: caps.estimatedLatencyMs,
    };
  }

  public async cancel(requestId: string): Promise<boolean> {
    const active = this.activeRequests.get(requestId);
    if (active && active.status === 'RUNNING') {
      active.status = 'FAILED';
      this.activeRequests.set(requestId, active);
      return true;
    }
    return false;
  }

  public async getStatus(requestId: string): Promise<'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'> {
    const active = this.activeRequests.get(requestId);
    return active ? active.status : 'IDLE';
  }

  public abstract execute(req: ProviderRequest<TPayload>): Promise<NormalizedProviderResult<TOutput>>;

  public normalizeResult(
    rawResult: any,
    req: ProviderRequest<TPayload>,
    durationMs: number
  ): NormalizedProviderResult<TOutput> {
    const mode: ProviderExecutionMode = this.config.hasCredentials
      ? 'REAL_GENERATED_ASSET'
      : 'SIMULATED_PROVIDER';

    return {
      status: 'SUCCESS',
      providerId: this.id,
      modelId: req.modelId || 'default',
      assetId: `ast_${this.id}_${Date.now()}`,
      output: rawResult,
      metadata: {
        raw: rawResult,
        hasLiveCredentials: this.config.hasCredentials,
      },
      usage: {
        units: 1,
        metric: 'unit',
      },
      cost: this.capabilities().estimatedCostPerUnit,
      durationMs,
      requestHash: req.requestHash || 'sha256:unknown',
      providerRequestId: `req_${this.id}_${Math.random().toString(36).substring(2, 9)}`,
      executionMode: mode,
    };
  }
}
