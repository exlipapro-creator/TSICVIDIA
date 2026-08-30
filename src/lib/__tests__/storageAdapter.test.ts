import { describe, it, expect } from 'vitest';
import { MemoryStorageAdapter } from '../storage/storageAdapter';
import { PersistenceManager } from '../storage/persistence';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';

describe('Storage and Persistence Layer', () => {
  it('MemoryStorageAdapter stores, retrieves, checks, and deletes typed objects', () => {
    const memory = new MemoryStorageAdapter();
    memory.set('test_key', { hello: 'world', count: 42 });

    expect(memory.has('test_key')).toBe(true);
    const val = memory.get<{ hello: string; count: number }>('test_key');
    expect(val).toEqual({ hello: 'world', count: 42 });

    memory.remove('test_key');
    expect(memory.has('test_key')).toBe(false);
    expect(memory.get('test_key')).toBeNull();
  });

  it('PersistenceManager serializes and restores entire workspace state', () => {
    const memory = new MemoryStorageAdapter();
    const manager = new PersistenceManager(memory);

    const testState = {
      universe: CANONICAL_UNIVERSE,
      episodes: INITIAL_EPISODES,
      selectedEpisodeId: INITIAL_EPISODES[0].id,
      manifest: null,
    };

    manager.saveState(testState);
    const restored = manager.loadState();

    expect(restored).not.toBeNull();
    expect(restored?.universe.id).toBe(CANONICAL_UNIVERSE.id);
    expect(restored?.episodes.length).toBe(INITIAL_EPISODES.length);
    expect(restored?.selectedEpisodeId).toBe(INITIAL_EPISODES[0].id);
  });
});
