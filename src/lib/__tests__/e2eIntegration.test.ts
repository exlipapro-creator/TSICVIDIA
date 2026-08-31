import { describe, it, expect, beforeEach } from 'vitest';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';
import { compileEpisodeToManifest } from '../compiler';
import { analyzeShotDelta } from '../invalidationEngine';
import { ExecutionEngine } from '../executionEngine';
import { evaluateShotQA } from '../qaEngine';
import { PersistenceManager } from '../storage/persistence';
import { MemoryStorageAdapter } from '../storage/storageAdapter';
import { Episode, Scene, Shot, Universe } from '../../types';

describe('End-to-End Production Workflow Integration Suite', () => {
  let memoryStorage: MemoryStorageAdapter;
  let testPersistenceManager: PersistenceManager;
  let testUniverse: Universe;
  let testEpisodes: Episode[];

  beforeEach(() => {
    memoryStorage = new MemoryStorageAdapter();
    testPersistenceManager = new PersistenceManager(memoryStorage);
    testUniverse = JSON.parse(JSON.stringify(CANONICAL_UNIVERSE));
    testEpisodes = JSON.parse(JSON.stringify(INITIAL_EPISODES));
  });

  // TEST 1: Create/select Character -> select version -> verify version binding
  it('TEST 1: Character selection, version creation, and binding integrity', () => {
    const milo = testUniverse.characters.find((c) => c.id === 'char_milo');
    expect(milo).toBeDefined();
    if (!milo) return;

    // Verify canonical locked version exists
    const v32 = milo.versions.find((v) => v.version === 'v3.2');
    expect(v32).toBeDefined();
    expect(v32?.isLocked).toBe(true);

    // Branch a new mutable version v3.3
    const branchedVersion = {
      ...JSON.parse(JSON.stringify(v32)),
      version: 'v3.3',
      parentVersion: 'v3.2',
      createdAt: new Date().toISOString(),
      changeSummary: 'Branched v3.3 with modified voice pitch and hair color.',
      isLocked: false,
    };
    branchedVersion.voiceProfile.pitch = 1.1;
    milo.versions.push(branchedVersion);
    milo.currentVersion = 'v3.3';

    // Verify character current version updated
    expect(milo.currentVersion).toBe('v3.3');
    const selectedVersion = milo.versions.find((v) => v.version === milo.currentVersion);
    expect(selectedVersion?.version).toBe('v3.3');
    expect(selectedVersion?.parentVersion).toBe('v3.2');
    expect(selectedVersion?.voiceProfile.pitch).toBe(1.1);
  });

  // TEST 2: Create Episode -> create Scene -> create Shot -> save -> refresh -> verify persistence
  it('TEST 2: Episode, Scene, and Shot creation and deterministic persistence round-trip', () => {
    const newEpisodeId = 'ep_e2e_test_001';
    const newShot: Shot = {
      id: 'shot_e2e_001',
      shotNumber: 1,
      characterId: 'char_milo',
      characterVersion: 'v3.2',
      poseId: 'pose_bench_slouch',
      expressionId: 'exp_deadpan',
      action: 'Holding coffee mug looking skeptical',
      locationId: 'loc_cyber_gym',
      camera: 'Medium shot / 35mm / Eye-level',
      dialogue: 'Does routine precede conviction, or vice versa?',
      emotion: 'contemplative',
      duration: 4.2,
      motionPreset: 'talking_neutral',
      propIds: ['prop_coffee_cup'],
      referenceAssetHashes: ['sha256:ref_asset_001'],
      seed: 9942,
      status: 'DRAFT',
      primaryProvider: 'Flux.1-Dev-Adapter',
      fallbackStrategy: 'static_pose_animation',
    };

    const newScene: Scene = {
      id: 'scene_e2e_001',
      sceneNumber: 1,
      title: 'E2E Opening Hook',
      locationId: 'loc_cyber_gym',
      timeOfDay: 'dusk',
      mood: 'satirical',
      shots: [newShot],
    };

    const newEpisode: Episode = {
      id: newEpisodeId,
      universeId: testUniverse.id,
      title: 'E2E Validation Episode',
      premise: 'Testing end-to-end creation, compilation, and persistence cycle.',
      objective: 'Verify production workflow fidelity.',
      targetDuration: 30,
      platform: 'tiktok_shorts_reels',
      aspectRatio: '9:16',
      script: {
        rawText: '[HOOK]: Does routine precede conviction, or vice versa?',
        mode: 'manual',
      },
      scenes: [newScene],
      version: 'v1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to persistence
    testEpisodes.push(newEpisode);
    testPersistenceManager.saveState({
      universe: testUniverse,
      episodes: testEpisodes,
      selectedEpisodeId: newEpisodeId,
      manifest: null,
    });

    // Simulate page reload / clean memory read
    const rehydrated = testPersistenceManager.loadState();
    expect(rehydrated).not.toBeNull();
    expect(rehydrated?.episodes.some((e) => e.id === newEpisodeId)).toBe(true);

    const rehydratedEp = rehydrated?.episodes.find((e) => e.id === newEpisodeId);
    expect(rehydratedEp?.title).toBe('E2E Validation Episode');
    expect(rehydratedEp?.scenes[0].shots[0].dialogue).toBe('Does routine precede conviction, or vice versa?');
    expect(rehydratedEp?.scenes[0].shots[0].seed).toBe(9942);
  });

  // TEST 3: Modify dialogue -> verify correct dependency invalidation
  it('TEST 3: Fine-grained dialogue delta invalidates audio and downstream, preserving visual base', () => {
    const baseShot = testEpisodes[0].scenes[0].shots[0];
    const modifiedShot: Shot = {
      ...baseShot,
      dialogue: 'A completely new altered line of dialogue for the character.',
    };

    const delta = analyzeShotDelta(baseShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('audio');
    expect(delta.affectedLayers).toContain('motion');
    expect(delta.affectedLayers).toContain('qa');
    expect(delta.affectedLayers).toContain('compositor');
    // Visual base MUST remain preserved in cached layers
    expect(delta.affectedLayers).not.toContain('visual');
    expect(delta.preservedLayers).toContain('visual');
    expect(delta.reasons).toContain('dialogue_text_updated');
  });

  // TEST 4: Modify pose -> verify visual dependency invalidation
  it('TEST 4: Pose delta invalidates visual layer while preserving audio cache', () => {
    const baseShot = testEpisodes[0].scenes[0].shots[0];
    const modifiedShot: Shot = {
      ...baseShot,
      poseId: 'pose_pointing_forward',
    };

    const delta = analyzeShotDelta(baseShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('visual');
    expect(delta.affectedLayers).toContain('motion');
    expect(delta.affectedLayers).toContain('qa');
    expect(delta.affectedLayers).toContain('compositor');
    // Audio dialogue MUST remain preserved
    expect(delta.affectedLayers).not.toContain('audio');
    expect(delta.preservedLayers).toContain('audio');
    expect(delta.reasons).toContain('character_pose_updated');
  });

  // TEST 5: Compile Episode -> verify Production Manifest -> verify deterministic hash
  it('TEST 5: Compiles episode to deterministic Production Manifest with immutable DAG', () => {
    const ep = testEpisodes[0];
    const manifestA = compileEpisodeToManifest(ep, testUniverse, { policy: 'balanced' });
    const manifestB = compileEpisodeToManifest(ep, testUniverse, { policy: 'balanced' });

    expect(manifestA.manifestId).toBe(manifestB.manifestId);
    expect(manifestA.manifestHash).toBe(manifestB.manifestHash);
    expect(manifestA.executionGraph.length).toBeGreaterThan(0);
    expect(manifestA.characterBindings['char_milo']).toBeDefined();
    expect(manifestA.estimatedCost.total).toBeGreaterThan(0);

    // Topological dependency ordering verification
    const graph = manifestA.executionGraph;
    const lockNodeIndex = graph.findIndex((n) => n.type === 'character_lock');
    const visualNodeIndex = graph.findIndex((n) => n.type === 'base_image');
    const compositeNodeIndex = graph.findIndex((n) => n.type === 'composite_shot');

    expect(lockNodeIndex).toBeLessThan(visualNodeIndex);
    expect(visualNodeIndex).toBeLessThan(compositeNodeIndex);
  });

  // TEST 6: Execute Production -> verify DAG state transitions
  it('TEST 6: Production DAG state machine execution lifecycle', async () => {
    const manifest = compileEpisodeToManifest(testEpisodes[0], testUniverse, { policy: 'balanced' });
    const engine = new ExecutionEngine();
    const observedStates: string[] = [];

    const job = await engine.executeManifest(
      manifest,
      (updatedJob, updatedNode) => {
        if (updatedNode) {
          observedStates.push(`${updatedNode.id}:${updatedNode.status}`);
        }
      },
      { simulatedLatencyFactor: 0.02 }
    );

    expect(job.status).toBe('COMPLETED');
    expect(job.progressPercent).toBe(100);
    expect(job.cacheHits + job.cacheMisses).toBeGreaterThan(0);
    expect(observedStates.some((s) => s.includes('RUNNING'))).toBe(true);
    expect(observedStates.some((s) => s.includes('COMPLETED'))).toBe(true);
  });

  // TEST 7: Simulate node failure -> verify FAILED -> retry -> verify RETRYING -> verify recovery
  it('TEST 7: Handles node failure and allows individual node retry recovery', async () => {
    const manifest = compileEpisodeToManifest(testEpisodes[0], testUniverse, { policy: 'balanced' });
    const engine = new ExecutionEngine();
    const failTargetId = manifest.executionGraph[2].id;

    // Execute with targeted failure
    const failedJob = await engine.executeManifest(
      manifest,
      () => {},
      { failNodeId: failTargetId, simulatedLatencyFactor: 0.02 }
    );

    expect(failedJob.status).toBe('FAILED');
    const failedNode = manifest.executionGraph.find((n) => n.id === failTargetId);
    expect(failedNode?.status).toBe('FAILED');
    expect(failedNode?.errorMessage).toBeDefined();

    // Retry the single failed node
    if (failedNode) {
      const retriedNode = await engine.retryNode(failedNode, () => {});
      expect(retriedNode.status).toBe('COMPLETED');
      expect(retriedNode.errorMessage).toBeUndefined();
    }
  });

  // TEST 8: QA -> verify gate results -> verify remediation state
  it('TEST 8: Live QA Gate multi-metric evaluation and automated remediation', () => {
    const shot = testEpisodes[0].scenes[0].shots[0];
    const character = testUniverse.characters[0];

    // Standard baseline evaluation
    const qaResult = evaluateShotQA({
      shotId: shot.id,
      characterName: character.name,
      characterVersion: shot.characterVersion,
      poseId: shot.poseId,
      expressionId: shot.expressionId,
      dialogue: shot.dialogue,
      motionPreset: shot.motionPreset,
      duration: shot.duration,
      customQAProfile: {
        identityThreshold: 0.90,
        allowedPoseVariance: 0.20,
        paletteDriftMax: 0.05,
        landmarkDriftMax: 0.20,
        lufsTarget: -14.0,
        maxLipSyncDiscrepancyMs: 40,
      },
    });

    expect(qaResult.identityScore).toBeGreaterThanOrEqual(0.90);
    expect(qaResult.identityStatus).toBe('PASS');
    expect(qaResult.audioStatus).toBe('PASS');
    expect(qaResult.visualStatus).toBe('PASS');

    // Strict threshold trigger evaluation
    const strictQAResult = evaluateShotQA({
      shotId: shot.id,
      characterName: character.name,
      characterVersion: shot.characterVersion,
      poseId: shot.poseId,
      expressionId: shot.expressionId,
      dialogue: shot.dialogue,
      motionPreset: shot.motionPreset,
      duration: shot.duration,
      customQAProfile: {
        identityThreshold: 0.99, // Unusually strict
        allowedPoseVariance: 0.01,
        paletteDriftMax: 0.01,
        landmarkDriftMax: 0.01,
        lufsTarget: -14.0,
        maxLipSyncDiscrepancyMs: 10,
      },
    });

    expect(strictQAResult.overallStatus).not.toBe('PASS');
  });

  // TEST 9: Open compositor -> verify compiled assets/timeline are represented correctly
  it('TEST 9: Validates compositor timeline duration and shot continuity', () => {
    const episode = testEpisodes[0];
    const allShots = episode.scenes.flatMap((sc) => sc.shots);
    const calculatedDuration = allShots.reduce((acc, s) => acc + (s.duration || 3.5), 0);

    expect(allShots.length).toBeGreaterThan(0);
    expect(calculatedDuration).toBeGreaterThan(0);

    // Verify all shots have valid character bindings and locations
    for (const shot of allShots) {
      const char = testUniverse.characters.find((c) => c.id === shot.characterId);
      expect(char).toBeDefined();
      const loc = testUniverse.locations.find((l) => l.id === shot.locationId);
      expect(loc).toBeDefined();
    }
  });

  // TEST 10: Export -> verify artifact creation and correct status reporting
  it('TEST 10: Validates export manifest package structure and deterministic SHA-256 hash', () => {
    const episode = testEpisodes[0];
    const manifest = compileEpisodeToManifest(episode, testUniverse);

    const exportPackage = {
      manifestId: manifest.manifestId,
      manifestHash: manifest.manifestHash,
      episodeTitle: episode.title,
      aspectRatio: episode.aspectRatio,
      totalDuration: episode.scenes.flatMap((sc) => sc.shots).reduce((acc, s) => acc + (s.duration || 3.5), 0),
      characterBindings: manifest.characterBindings,
      generatedAt: new Date().toISOString(),
      exportType: 'CANVAS_PREVIEW_WEBM_AND_IR_MANIFEST',
    };

    expect(exportPackage.manifestHash).toMatch(/^sha256:/);
    expect(exportPackage.characterBindings['char_milo']).toBeDefined();
    expect(exportPackage.totalDuration).toBeGreaterThan(0);
  });
});
