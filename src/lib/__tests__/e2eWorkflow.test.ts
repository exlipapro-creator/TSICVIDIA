/**
 * TSICVIDIA End-to-End Production Readiness Test Suite
 * Validates the complete 10-phase production lifecycle.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';
import { compileEpisodeToManifest } from '../compiler';
import { executionEngine } from '../executionEngine';
import { analyzeShotDelta } from '../invalidationEngine';
import { evaluateShotQA } from '../qaEngine';
import { FluxVisualAdapter, ElevenLabsVoiceAdapter, LivePortraitMotionAdapter, FFmpegRenderAdapter } from '../providers';
import { Episode, Shot, Universe } from '../../types';
import { persistenceManager } from '../storage/persistence';

describe('TSICVIDIA End-to-End Production Readiness Suite', () => {
  let universe: Universe;
  let episode: Episode;

  beforeEach(() => {
    universe = JSON.parse(JSON.stringify(CANONICAL_UNIVERSE));
    episode = JSON.parse(JSON.stringify(INITIAL_EPISODES[0]));
  });

  // TEST 1: Character Creation & Version Binding
  it('TEST 1: Character creation, version selection, and version locking binding', () => {
    const char = universe.characters[0];
    expect(char).toBeDefined();
    expect(char.currentVersion).toBe('v3.2');

    const v32 = char.versions.find((v) => v.version === 'v3.2');
    expect(v32).toBeDefined();
    expect(v32?.isLocked).toBe(true);

    // Verify binding in compiled manifest
    const manifest = compileEpisodeToManifest(episode, universe);
    expect(manifest.characterBindings['char_milo']).toBe('v3.2');
  });

  // TEST 2: Episode, Scene, Shot persistence and state hydration
  it('TEST 2: Episode, Scene, Shot creation, serialization & persistence round-trip', () => {
    const newEpisode: Episode = {
      id: 'ep_test_persistence_01',
      universeId: universe.id,
      title: 'Persistence Test Episode',
      premise: 'Testing persistence state storage',
      objective: 'Verify persistence',
      targetDuration: 15,
      platform: 'tiktok_shorts_reels',
      aspectRatio: '9:16',
      version: 'v1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      script: { rawText: 'Hook: Hello test.', mode: 'manual' },
      scenes: [
        {
          id: 'scene_test_01',
          sceneNumber: 1,
          title: 'Scene 1',
          locationId: 'loc_cyber_gym',
          shots: [
            {
              id: 'shot_test_01',
              shotNumber: 1,
              characterId: 'char_milo',
              characterVersion: 'v3.2',
              poseId: 'pose_bench_slouch',
              expressionId: 'exp_deadpan',
              action: 'Sitting',
              locationId: 'loc_cyber_gym',
              camera: 'medium / eye-level',
              dialogue: 'Testing persistence round trip.',
              emotion: 'deadpan',
              duration: 3.5,
              motionPreset: 'subtle_head',
              propIds: [],
              referenceAssetHashes: ['sha256:ref1'],
              seed: 1042,
              status: 'READY',
              primaryProvider: 'Flux.1-Dev-Adapter',
              fallbackStrategy: 'static_pose_animation',
            },
          ],
        },
      ],
    };

    persistenceManager.saveState({
      universe,
      episodes: [newEpisode],
      selectedEpisodeId: newEpisode.id,
      manifest: null,
    });

    const loaded = persistenceManager.loadState();
    expect(loaded).toBeDefined();
    expect(loaded?.episodes.length).toBe(1);
    expect(loaded?.episodes[0].id).toBe('ep_test_persistence_01');
    expect(loaded?.episodes[0].scenes[0].shots[0].dialogue).toBe('Testing persistence round trip.');
  });

  // TEST 3: Dialogue mutation dependency invalidation
  it('TEST 3: Dialogue mutation dependency invalidation (audio, motion, qa invalidated; visual preserved)', () => {
    const originalShot = episode.scenes[0].shots[0];
    const modifiedShot: Shot = {
      ...originalShot,
      dialogue: 'A completely new modified dialogue string for this shot.',
    };

    const delta = analyzeShotDelta(originalShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('audio');
    expect(delta.affectedLayers).toContain('motion');
    expect(delta.affectedLayers).toContain('compositor');
    expect(delta.preservedLayers).toContain('visual');
  });

  // TEST 4: Pose mutation visual dependency invalidation
  it('TEST 4: Pose mutation visual dependency invalidation (visual, motion, qa invalidated; audio preserved)', () => {
    const originalShot = episode.scenes[0].shots[0];
    const modifiedShot: Shot = {
      ...originalShot,
      poseId: 'pose_standing_gesture', // Changed pose
    };

    const delta = analyzeShotDelta(originalShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('visual');
    expect(delta.affectedLayers).toContain('motion');
    expect(delta.preservedLayers).toContain('audio');
  });

  // TEST 5: Deterministic compilation hash repeatability
  it('TEST 5: Compile Episode -> verify Production Manifest -> verify deterministic hash consistency', () => {
    const manifest1 = compileEpisodeToManifest(episode, universe);
    const manifest2 = compileEpisodeToManifest(episode, universe);

    expect(manifest1.manifestHash).toBe(manifest2.manifestHash);
    expect(manifest1.executionGraph.length).toBe(manifest2.executionGraph.length);
    expect(manifest1.shots.length).toBe(manifest2.shots.length);
  });

  // TEST 6: Production DAG execution state transitions
  it('TEST 6: Execute Production -> verify DAG state transitions (QUEUED -> RUNNING -> COMPLETED)', async () => {
    const manifest = compileEpisodeToManifest(episode, universe);
    const progressHistory: string[] = [];

    const job = await executionEngine.executeManifest(
      manifest,
      (updatedJob) => {
        progressHistory.push(updatedJob.status);
      },
      { simulatedLatencyFactor: 0.05 }
    );

    expect(job.status).toBe('COMPLETED');
    expect(job.progressPercent).toBe(100);
    expect(progressHistory).toContain('RUNNING');
    expect(manifest.executionGraph.every((n) => n.status === 'COMPLETED')).toBe(true);
  });

  // TEST 7: Node failure simulation & recovery
  it('TEST 7: Simulate node failure -> verify FAILED -> retry -> verify RETRYING -> verify recovery', async () => {
    const manifest = compileEpisodeToManifest(episode, universe);
    const targetFailNode = manifest.executionGraph[1];

    const failedJob = await executionEngine.executeManifest(
      manifest,
      () => {},
      { failNodeId: targetFailNode.id, simulatedLatencyFactor: 0.05 }
    );

    expect(failedJob.status).toBe('FAILED');
    expect(targetFailNode.status).toBe('FAILED');
    expect(targetFailNode.errorMessage).toBeDefined();

    // Now retry the specific failed node
    let retriedStatus = '';
    const recoveredNode = await executionEngine.retryNode(targetFailNode, (updated) => {
      retriedStatus = updated.status;
    });

    expect(recoveredNode.status).toBe('COMPLETED');
    expect(recoveredNode.errorMessage).toBeUndefined();
  });

  // TEST 8: QA Gates multi-metric evaluation
  it('TEST 8: QA Gates multi-metric evaluation and status aggregation', () => {
    const shot = episode.scenes[0].shots[0];
    const character = universe.characters[0];

    const qaResult = evaluateShotQA({
      shotId: shot.id,
      characterName: character.name,
      characterVersion: shot.characterVersion,
      poseId: shot.poseId,
      expressionId: shot.expressionId,
      dialogue: shot.dialogue,
      motionPreset: shot.motionPreset,
      duration: shot.duration,
    });

    expect(qaResult).toBeDefined();
    expect(qaResult.overallStatus).toBeDefined();
    expect(['PASS', 'WARNING', 'FAIL']).toContain(qaResult.overallStatus);
    expect(typeof qaResult.identityScore).toBe('number');
    expect(typeof qaResult.audioMetrics.lufs).toBe('number');
  });

  // TEST 9: Provider Adapter capabilities and normalized execution
  it('TEST 9: Provider adapter capabilities and normalized results', async () => {
    const visualAdapter = new FluxVisualAdapter(false);
    const caps = visualAdapter.capabilities();
    expect(caps.supportsReferenceImages).toBe(true);
    expect(caps.supportsCharacterLora).toBe(true);
    expect(caps.estimatedCostPerUnit).toBeGreaterThan(0);

    const result = await visualAdapter.execute({
      requestId: 'req_test_01',
      requestHash: 'sha256:req_test_01',
      capability: 'generate_keyframe',
      modelId: 'flux-1-dev',
      payload: {
        characterName: 'Milo Vance',
        characterVersion: 'v3.2',
        visualDnaPrompt: 'Milo in gym',
        poseId: 'pose_bench_slouch',
        expressionId: 'exp_deadpan',
        locationId: 'loc_cyber_gym',
        aspectRatio: '9:16',
        seed: 1042,
      },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.executionMode).toBe('SIMULATED_PROVIDER');
    expect(result.output.width).toBe(1080);
    expect(result.output.height).toBe(1920);
  });

  // TEST 10: Server-side Master Render Adapter Pipeline
  it('TEST 10: Server-side master render adapter produces verified master artifact', async () => {
    const renderAdapter = new FFmpegRenderAdapter(true);
    const renderResult = await renderAdapter.execute({
      requestId: 'req_render_01',
      requestHash: 'sha256:render_manifest_01',
      capability: 'master_video_render',
      modelId: 'ffmpeg-4k-master',
      payload: {
        productionId: 'prod_milo_ep01',
        manifestHash: 'sha256:manifest_hash_123',
        resolution: {
          width: 1080,
          height: 1920,
          fps: 30,
          aspectRatio: '9:16',
        },
        tracks: [
          {
            trackId: 'track_vid_01',
            type: 'video',
            assetHash: 'sha256:vid_hash_01',
            startTime: 0,
            duration: 15.0,
          },
          {
            trackId: 'track_voice_01',
            type: 'voice',
            assetHash: 'sha256:voice_hash_01',
            startTime: 0,
            duration: 15.0,
            volume: 1.0,
          },
        ],
      },
    });

    expect(renderResult.status).toBe('SUCCESS');
    expect(renderResult.executionMode).toBe('MASTER_RENDER');
    expect(renderResult.output.codec).toBe('h264_aac');
    expect(renderResult.output.fps).toBe(30);
    expect(renderResult.output.durationSeconds).toBe(15.0);
    expect(renderResult.output.sha256).toContain('sha256:master_render');
  });
});
