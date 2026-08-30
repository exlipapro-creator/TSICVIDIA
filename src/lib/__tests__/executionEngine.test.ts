import { describe, it, expect } from 'vitest';
import { ExecutionEngine } from '../executionEngine';
import { compileEpisodeToManifest } from '../compiler';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';
import { ProductionJob } from '../../types';

describe('Execution Engine & DAG State Machine', () => {
  const manifest = compileEpisodeToManifest(INITIAL_EPISODES[0], CANONICAL_UNIVERSE, {
    policy: 'balanced',
  });

  it('executes production DAG and transitions node states to COMPLETED', async () => {
    const engine = new ExecutionEngine();
    const progressUpdates: ProductionJob[] = [];

    const resultJob = await engine.executeManifest(
      manifest,
      (job) => {
        progressUpdates.push({ ...job });
      },
      { simulatedLatencyFactor: 0.05 } // Fast execution for test
    );

    expect(resultJob.status).toBe('COMPLETED');
    expect(resultJob.progressPercent).toBe(100);
    expect(resultJob.cacheHits).toBeGreaterThan(0);
    expect(progressUpdates.length).toBeGreaterThan(3);
  });

  it('handles simulated node failure and marks job status as FAILED', async () => {
    const engine = new ExecutionEngine();
    const targetFailNodeId = manifest.executionGraph[1].id;

    const resultJob = await engine.executeManifest(
      manifest,
      () => {},
      { failNodeId: targetFailNodeId, simulatedLatencyFactor: 0.05 }
    );

    expect(resultJob.status).toBe('FAILED');
    expect(resultJob.qaSummary.failCount).toBeGreaterThan(0);
  });

  it('retries individual failed node successfully', async () => {
    const engine = new ExecutionEngine();
    const node = { ...manifest.executionGraph[0], status: 'FAILED' as const, errorMessage: 'Network timeout' };

    const retriedNode = await engine.retryNode(node, () => {});
    expect(retriedNode.status).toBe('COMPLETED');
    expect(retriedNode.errorMessage).toBeUndefined();
  });
});
