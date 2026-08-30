import { describe, it, expect } from 'vitest';
import {
  compileEpisodeToManifest,
  generateDeterministicHash,
  calculateShotCacheKey,
  canonicalizeObject,
} from '../compiler';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';
import { Episode } from '../../types';

describe('Deterministic Compiler Engine', () => {
  it('canonicalizes nested objects with invariant key ordering', () => {
    const objA = { z: 1, a: 2, m: { nestedZ: 'last', nestedA: 'first' } };
    const objB = { a: 2, m: { nestedA: 'first', nestedZ: 'last' }, z: 1 };

    expect(canonicalizeObject(objA)).toBe(canonicalizeObject(objB));
    expect(canonicalizeObject(objA)).toBe('{"a":2,"m":{"nestedA":"first","nestedZ":"last"},"z":1}');
  });

  it('produces identical shot cache keys regardless of argument construction order', () => {
    const key1 = calculateShotCacheKey({
      characterVersion: 'v3.2',
      poseId: 'pose_bench_slouch',
      expressionId: 'exp_deadpan',
      locationId: 'loc_cyber_gym',
      dialogue: 'Dialogue line here',
      voiceProfile: 'canonical_profile_char_milo',
      provider: 'Flux.1-Dev-Adapter',
      model: 'flux-dev-q8',
      seed: 1042,
      resolution: '1080x1920',
    });

    const key2 = calculateShotCacheKey({
      resolution: '1080x1920',
      seed: 1042,
      model: 'flux-dev-q8',
      provider: 'Flux.1-Dev-Adapter',
      voiceProfile: 'canonical_profile_char_milo',
      dialogue: 'Dialogue line here',
      locationId: 'loc_cyber_gym',
      expressionId: 'exp_deadpan',
      poseId: 'pose_bench_slouch',
      characterVersion: 'v3.2',
    });

    expect(key1).toBe(key2);
  });

  it('produces identical deterministic hash and manifest structure for identical inputs', () => {
    const ep1 = INITIAL_EPISODES[0];
    const manifestA = compileEpisodeToManifest(ep1, CANONICAL_UNIVERSE, { policy: 'balanced' });
    const manifestB = compileEpisodeToManifest(ep1, CANONICAL_UNIVERSE, { policy: 'balanced' });

    expect(manifestA.manifestHash).toBe(manifestB.manifestHash);
    expect(manifestA.executionGraph.length).toBe(manifestB.executionGraph.length);
    expect(manifestA.shots.length).toBe(manifestB.shots.length);
  });

  it('generates different hash when dialogue content changes', () => {
    const epOriginal = INITIAL_EPISODES[0];
    const epModified: Episode = {
      ...epOriginal,
      scenes: epOriginal.scenes.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              shots: s.shots.map((sh, sidx) =>
                sidx === 0 ? { ...sh, dialogue: 'Completely altered dialogue line.' } : sh
              ),
            }
          : s
      ),
    };

    const manifestOriginal = compileEpisodeToManifest(epOriginal, CANONICAL_UNIVERSE);
    const manifestModified = compileEpisodeToManifest(epModified, CANONICAL_UNIVERSE);

    expect(manifestOriginal.manifestHash).not.toBe(manifestModified.manifestHash);
  });

  it('computes stable SHA-256 simulation hashes', () => {
    const str = 'canonical_test_input_123';
    const hash1 = generateDeterministicHash(str);
    const hash2 = generateDeterministicHash(str);

    expect(hash1).toBe(hash2);
    expect(hash1.startsWith('sha256:')).toBe(true);
  });
});
