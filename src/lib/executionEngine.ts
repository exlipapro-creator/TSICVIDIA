/**
 * TSICVIDIA Job Execution Engine & State Machine
 * Deterministic execution of compiled production manifests.
 */

import {
  JobStatus,
  ProductionDAGNode,
  ProductionJob,
  ProductionManifest,
  ShotQAResult,
} from '../types';

export class ExecutionEngine {
  private currentJob: ProductionJob | null = null;
  private isRunning: boolean = false;
  private cancelRequested: boolean = false;

  public async executeManifest(
    manifest: ProductionManifest,
    onProgressUpdate: (job: ProductionJob, updatedNode?: ProductionDAGNode) => void
  ): Promise<ProductionJob> {
    this.isRunning = true;
    this.cancelRequested = false;

    const totalShots = manifest.shots.length;
    const job: ProductionJob = {
      id: 'PROD_JOB_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      manifestId: manifest.manifestId,
      episodeId: manifest.episodeId,
      status: 'RUNNING',
      progressPercent: 5,
      startedAt: new Date().toISOString(),
      totalShots,
      completedShots: 0,
      cacheHits: 0,
      cacheMisses: 0,
      regenerations: 0,
      qaSummary: {
        passCount: 0,
        warningCount: 0,
        failCount: 0,
      },
      activeDegradations: [],
      actualCost: 0,
    };

    this.currentJob = job;
    onProgressUpdate(job);

    const graph = [...manifest.executionGraph];
    let completedCount = 0;

    // Process nodes sequentially or topologically
    for (let i = 0; i < graph.length; i++) {
      if (this.cancelRequested) {
        job.status = 'FAILED';
        onProgressUpdate(job);
        break;
      }

      const node = graph[i];
      node.status = 'RUNNING';
      job.progressPercent = Math.min(95, Math.round(((i + 1) / graph.length) * 90) + 5);
      onProgressUpdate(job, node);

      // Simulate realistic execution timing & caching
      const isCacheHit = i % 3 === 0 || node.type === 'character_lock';
      if (isCacheHit) {
        job.cacheHits++;
      } else {
        job.cacheMisses++;
        job.actualCost += node.cost || 0.01;
      }

      const executionDelayMs = isCacheHit ? 180 : 350;
      await new Promise((r) => setTimeout(r, executionDelayMs));

      node.status = 'COMPLETED';
      node.cacheHit = isCacheHit;
      node.durationMs = executionDelayMs;

      if (node.type === 'composite_shot') {
        job.completedShots++;
        completedCount++;
      }

      if (node.type === 'qa_check') {
        job.qaSummary.passCount++;
      }

      onProgressUpdate(job, node);
    }

    if (!this.cancelRequested) {
      job.status = 'COMPLETED';
      job.progressPercent = 100;
      job.completedAt = new Date().toISOString();
      job.finalRenderUrl = 'output/production_master_1080x1920.mp4';
      job.thumbnailUrl = manifest.shots[0]?.generatedArtifacts?.baseImageUrl || 'assets/thumbnail.webp';
      onProgressUpdate(job);
    }

    this.isRunning = false;
    return job;
  }

  public cancel() {
    this.cancelRequested = true;
    this.isRunning = false;
  }
}

export const executionEngine = new ExecutionEngine();
