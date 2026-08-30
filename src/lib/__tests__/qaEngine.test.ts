import { describe, it, expect } from 'vitest';
import { evaluateShotQA, generateStructuredQAEvidence } from '../qaEngine';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';

describe('QA Engine & Quality Gates', () => {
  const shot = INITIAL_EPISODES[0].scenes[0].shots[0];
  const char = CANONICAL_UNIVERSE.characters[0];

  const params = {
    shotId: shot.id,
    characterName: char.name,
    characterVersion: shot.characterVersion,
    poseId: shot.poseId,
    expressionId: shot.expressionId,
    dialogue: shot.dialogue,
    motionPreset: shot.motionPreset,
    duration: shot.duration,
  };

  it('evaluates shot QA against character profile with numeric metrics', () => {
    const result = evaluateShotQA(params);
    expect(['PASS', 'WARNING', 'FAIL']).toContain(result.overallStatus);
    expect(typeof result.identityScore).toBe('number');
    expect(result.identityStatus).toBeDefined();
    expect(result.audioMetrics).toBeDefined();
    expect(typeof result.audioMetrics.lufs).toBe('number');
  });

  it('generates structured QA evidence with recommendations', () => {
    const evidence = generateStructuredQAEvidence(params);
    expect(evidence.shotId).toBe(shot.id);
    expect(evidence.timestamp).toBeDefined();
    expect(evidence.identity.score).toBeGreaterThan(0.8);
    expect(evidence.motion).toBeDefined();
    expect(evidence.audio.status).toBe('PASS');
  });
});
