import { describe, it, expect } from 'vitest';
import { analyzeShotDelta, getShotArtifactBreakdown } from '../invalidationEngine';
import { Shot } from '../../types';

const baseShot: Shot = {
  id: 'shot_test_01',
  shotNumber: 1,
  characterId: 'char_milo',
  characterVersion: 'v3.2',
  poseId: 'pose_bench_slouch',
  expressionId: 'exp_deadpan',
  action: 'resting on bench',
  locationId: 'loc_cyber_gym',
  camera: 'medium / eye-level',
  dialogue: 'First original dialogue line.',
  emotion: 'deadpan',
  duration: 4.0,
  motionPreset: 'talking_neutral',
  propIds: [],
  referenceAssetHashes: ['sha256:88fa29e81'],
  seed: 1042,
  status: 'READY',
  primaryProvider: 'Flux.1-Dev-Adapter',
  fallbackStrategy: 'static_pose_animation',
};

describe('Automated Dependency Invalidation Engine', () => {
  it('identifies uncompiled state when no previous shot exists', () => {
    const delta = analyzeShotDelta(null, baseShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toEqual(['visual', 'audio', 'motion', 'qa', 'compositor']);
  });

  it('detects that dialogue change invalidates audio/motion/qa/compositor but preserves visual asset', () => {
    const modifiedShot: Shot = {
      ...baseShot,
      dialogue: 'Updated dialogue text for the actor.',
    };

    const delta = analyzeShotDelta(baseShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('audio');
    expect(delta.affectedLayers).toContain('motion');
    expect(delta.affectedLayers).toContain('compositor');
    expect(delta.preservedLayers).toContain('visual');

    const breakdown = getShotArtifactBreakdown(modifiedShot, delta);
    expect(breakdown.characterVisual.status).toBe('CACHED');
    expect(breakdown.voiceAudio.status).toBe('STALE');
  });

  it('detects that pose change invalidates visual but preserves dialogue audio', () => {
    const modifiedShot: Shot = {
      ...baseShot,
      poseId: 'pose_standing_cross_arms',
    };

    const delta = analyzeShotDelta(baseShot, modifiedShot);
    expect(delta.isStale).toBe(true);
    expect(delta.affectedLayers).toContain('visual');
    expect(delta.preservedLayers).toContain('audio');

    const breakdown = getShotArtifactBreakdown(modifiedShot, delta);
    expect(breakdown.characterVisual.status).toBe('STALE');
    expect(breakdown.voiceAudio.status).toBe('CACHED');
  });
});
