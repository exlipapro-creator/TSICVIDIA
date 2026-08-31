/**
 * TSICVIDIA Provider Adapters Registry & Factory
 */

export * from './types';
export * from './baseAdapter';
export * from './visualAdapter';
export * from './voiceAdapter';
export * from './motionAdapter';
export * from './renderAdapter';

import { FluxVisualAdapter } from './visualAdapter';
import { ElevenLabsVoiceAdapter } from './voiceAdapter';
import { LivePortraitMotionAdapter } from './motionAdapter';
import { FFmpegRenderAdapter } from './renderAdapter';
import { IProviderAdapter } from './types';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private adapters = new Map<string, IProviderAdapter>();

  private constructor() {
    this.register(new FluxVisualAdapter(false));
    this.register(new ElevenLabsVoiceAdapter(false));
    this.register(new LivePortraitMotionAdapter(false));
    this.register(new FFmpegRenderAdapter(true));
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(adapter: IProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public get<T extends IProviderAdapter = IProviderAdapter>(id: string): T | undefined {
    return this.adapters.get(id) as T | undefined;
  }

  public getAll(): IProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getByCategory(category: 'visual' | 'voice' | 'motion' | 'render' | 'llm'): IProviderAdapter[] {
    return this.getAll().filter((a) => a.category === category);
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
