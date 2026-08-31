/**
 * TSICVIDIA Job Execution Engine & State Machine
 * Deterministic execution of compiled production manifests.
 */

import {
  JobStatus,
  ProductionDAGNode,
  ProductionJob,
  ProductionManifest,
} from '../types';

export class ExecutionEngine {
  private currentJob: ProductionJob | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private cancelRequested: boolean = false;

  public getCurrentJob(): ProductionJob | null {
    return this.currentJob;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
    }
  }

  public async executeManifest(
    manifest: ProductionManifest,
    onProgressUpdate: (job: ProductionJob, updatedNode?: ProductionDAGNode) => void,
    options?: { failNodeId?: string; simulatedLatencyFactor?: number }
  ): Promise<ProductionJob> {
    this.isRunning = true;
    this.isPaused = false;
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

    // Mark all initial nodes as QUEUED
    for (const node of graph) {
      node.status = 'QUEUED';
    }

    const latencyFactor = options?.simulatedLatencyFactor ?? 1;

    for (let i = 0; i < graph.length; i++) {
      // Pause polling loop
      while (this.isPaused && !this.cancelRequested) {
        await new Promise((r) => setTimeout(r, 100));
      }

      if (this.cancelRequested) {
        job.status = 'FAILED';
        for (let j = i; j < graph.length; j++) {
          if (graph[j].status === 'QUEUED' || graph[j].status === 'RUNNING') {
            graph[j].status = 'FAILED';
            graph[j].errorMessage = 'Execution cancelled by user.';
          }
        }
        onProgressUpdate(job);
        break;
      }

      const node = graph[i];
      node.status = 'RUNNING';
      job.progressPercent = Math.min(95, Math.round(((i + 1) / graph.length) * 90) + 5);
      onProgressUpdate(job, node);

      // Check simulated failure option
      if (options?.failNodeId && node.id === options.failNodeId) {
        node.status = 'FAILED';
        node.errorMessage = `Simulated provider error on node ${node.id}`;
        job.status = 'FAILED';
        job.qaSummary.failCount++;
        onProgressUpdate(job, node);
        this.isRunning = false;
        return job;
      }

      // Determine deterministic cache hit vs generation
      const isCacheHit = i % 3 === 0 || node.type === 'character_lock';
      if (isCacheHit) {
        job.cacheHits++;
      } else {
        job.cacheMisses++;
        job.actualCost += node.cost || 0.01;
      }

      const executionDelayMs = Math.max(10, Math.round((isCacheHit ? 80 : 200) * latencyFactor));
      await new Promise((r) => setTimeout(r, executionDelayMs));

      node.status = 'COMPLETED';
      node.cacheHit = isCacheHit;
      node.durationMs = executionDelayMs;

      if (node.type === 'composite_shot') {
        job.completedShots++;
      }

      if (node.type === 'qa_check') {
        job.qaSummary.passCount++;
      }

      onProgressUpdate(job, node);
    }

    if (!this.cancelRequested && job.status !== 'FAILED') {
      job.status = 'COMPLETED';
      job.progressPercent = 100;
      job.completedAt = new Date().toISOString();
      job.finalRenderUrl = 'output/production_master_1080x1920.mp4';
      job.thumbnailUrl = manifest.shots[0]?.generatedArtifacts?.baseImageUrl || 'assets/thumbnail.webp';
      onProgressUpdate(job);
    }

    this.isRunning = false;
    this.isPaused = false;
    return job;
  }

  /**
   * Retry a specific failed node
   */
  public async retryNode(
    node: ProductionDAGNode,
    onProgressUpdate: (updatedNode: ProductionDAGNode) => void
  ): Promise<ProductionDAGNode> {
    node.status = 'RETRYING';
    onProgressUpdate(node);

    await new Promise((r) => setTimeout(r, 200));

    node.status = 'COMPLETED';
    node.errorMessage = undefined;
    node.durationMs = 200;
    node.cacheHit = false;
    onProgressUpdate(node);

    return node;
  }

  /**
   * Retry all failed nodes across the graph
   */
  public async retryFailedNodes(
    manifest: ProductionManifest,
    onProgressUpdate: (job: ProductionJob, updatedNode?: ProductionDAGNode) => void
  ): Promise<ProductionJob> {
    const failedNodes = manifest.executionGraph.filter((n) => n.status === 'FAILED');
    if (this.currentJob) {
      this.currentJob.status = 'RUNNING';
      onProgressUpdate(this.currentJob);
    }

    for (const node of failedNodes) {
      await this.retryNode(node, (updated) => {
        if (this.currentJob) {
          onProgressUpdate(this.currentJob, updated);
        }
      });
    }

    const allCompleted = manifest.executionGraph.every((n) => n.status === 'COMPLETED');
    if (this.currentJob && allCompleted) {
      this.currentJob.status = 'COMPLETED';
      this.currentJob.progressPercent = 100;
      this.currentJob.completedAt = new Date().toISOString();
      onProgressUpdate(this.currentJob);
    }

    return this.currentJob || ({} as ProductionJob);
  }

  public cancel() {
    this.cancelRequested = true;
    this.isRunning = false;
    this.isPaused = false;
  }
}

export const executionEngine = new ExecutionEngine();

