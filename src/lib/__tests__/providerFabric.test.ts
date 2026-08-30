import { describe, it, expect } from 'vitest';
import { providerFabric } from '../providerFabric';

describe('Provider Fabric & Capability Negotiation Engine', () => {
  it('negotiates optimal visual provider based on reference image capability', () => {
    const result = providerFabric.negotiate({
      capability: 'visual.generate',
      needsReferenceImage: true,
      needsPoseControl: true,
    });

    expect(result.selectedProvider).toBeDefined();
    expect(result.selectedProvider.type).toBe('visual');
    expect(result.selectedProvider.capabilities.supportsReferenceImages).toBe(true);
    expect(result.estimatedCost).toBeGreaterThan(0);
    expect(result.reasoning).toContain('Flux');
  });

  it('selects audio provider for voice synthesis', () => {
    const result = providerFabric.negotiate({
      capability: 'voice.synthesize',
    });

    expect(result.selectedProvider.type).toBe('voice');
    expect(result.estimatedCost).toBeDefined();
  });

  it('adjusts provider scoring based on execution policies', () => {
    const qualityResult = providerFabric.negotiate(
      { capability: 'visual.generate', needsReferenceImage: true },
      'quality_first'
    );
    const speedResult = providerFabric.negotiate(
      { capability: 'visual.generate' },
      'speed_first'
    );
    const budgetResult = providerFabric.negotiate(
      { capability: 'visual.generate' },
      'budget_first'
    );

    expect(qualityResult.selectedProvider).toBeDefined();
    expect(speedResult.selectedProvider).toBeDefined();
    expect(budgetResult.selectedProvider).toBeDefined();
  });

  it('executes capability with automated execution envelope', async () => {
    const output = await providerFabric.execute(
      { capability: 'voice.synthesize' },
      { text: 'Sample dialogue line' },
      'balanced'
    );

    expect(output.status).toBe('SUCCESS');
    expect(output.providerId).toBeDefined();
    expect(output.payloadOutput.text).toBe('Sample dialogue line');
    expect(output.policyApplied).toBe('balanced');
  });
});
