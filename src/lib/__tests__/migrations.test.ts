import { describe, it, expect } from 'vitest';
import { migrateToCurrentSchema, sanitizeAndRepairState } from '../storage/migrations';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';

describe('Storage Schema Migrations and Repair Engine', () => {
  it('repairs null, undefined, or primitive corrupted state safely', () => {
    const fromNull = migrateToCurrentSchema(null);
    expect(fromNull).not.toBeNull();
    expect(fromNull?.version).toBe(1);
    expect(fromNull?.universe.id).toBe(CANONICAL_UNIVERSE.id);
    expect(fromNull?.episodes.length).toBe(INITIAL_EPISODES.length);

    const fromString = migrateToCurrentSchema('corrupted_string');
    expect(fromString).not.toBeNull();
    expect(fromString?.universe.characters.length).toBeGreaterThan(0);
  });

  it('preserves valid v1 schema with user modifications', () => {
    const customEpisode = {
      ...INITIAL_EPISODES[0],
      title: 'Custom User Episode Title',
    };

    const validV1 = {
      version: 1,
      updatedAt: '2026-08-28T12:00:00Z',
      universe: CANONICAL_UNIVERSE,
      episodes: [customEpisode],
      selectedEpisodeId: customEpisode.id,
      manifest: null,
      settings: { executionPolicy: 'quality_first' as const },
    };

    const migrated = migrateToCurrentSchema(validV1);
    expect(migrated).not.toBeNull();
    expect(migrated?.episodes[0].title).toBe('Custom User Episode Title');
    expect(migrated?.settings.executionPolicy).toBe('quality_first');
  });

  it('repairs partial schema missing episodes or characters', () => {
    const partialRaw = {
      universe: { id: 'custom_uni', characters: [] }, // empty characters -> should repair
      episodes: null, // missing episodes -> should repair
      selectedEpisodeId: 'broken_id',
    };

    const repaired = sanitizeAndRepairState(partialRaw);
    expect(repaired.universe.characters.length).toBeGreaterThan(0);
    expect(repaired.episodes.length).toBeGreaterThan(0);
    expect(repaired.selectedEpisodeId).toBe(repaired.episodes[0].id);
  });
});
