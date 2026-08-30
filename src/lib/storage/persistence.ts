/**
 * TSICVIDIA Domain Persistence Manager
 * Key: tsicvidia.persistence.v1
 */

import { defaultStorage, StorageAdapter } from './storageAdapter';
import { migrateToCurrentSchema, PersistedSchemaV1 } from './migrations';
import { Episode, ProductionManifest, Universe } from '../../types';

export const PERSISTENCE_KEY = 'persistence.v1';

export interface PersistentWorkspaceState {
  universe: Universe;
  episodes: Episode[];
  selectedEpisodeId: string;
  manifest: ProductionManifest | null;
  settings?: {
    executionPolicy?: 'balanced' | 'quality_first' | 'speed_first' | 'budget_first';
  };
}

export class PersistenceManager {
  private adapter: StorageAdapter;
  private saveTimeout: any = null;

  constructor(adapter: StorageAdapter = defaultStorage) {
    this.adapter = adapter;
  }

  loadState(): PersistentWorkspaceState | null {
    try {
      const raw = this.adapter.get<any>(PERSISTENCE_KEY);
      if (!raw) return null;

      const migrated = migrateToCurrentSchema(raw);
      if (!migrated) return null;

      return {
        universe: migrated.universe as Universe,
        episodes: migrated.episodes as Episode[],
        selectedEpisodeId: migrated.selectedEpisodeId,
        manifest: migrated.manifest as ProductionManifest | null,
        settings: migrated.settings,
      };
    } catch (err) {
      console.warn('[PersistenceManager] Load error:', err);
      return null;
    }
  }

  saveState(state: PersistentWorkspaceState): void {
    try {
      const payload: PersistedSchemaV1 = {
        version: 1,
        updatedAt: new Date().toISOString(),
        universe: state.universe,
        episodes: state.episodes,
        selectedEpisodeId: state.selectedEpisodeId,
        manifest: state.manifest,
        settings: state.settings || { executionPolicy: 'balanced' },
      };
      this.adapter.set(PERSISTENCE_KEY, payload);
    } catch (err) {
      console.warn('[PersistenceManager] Save error:', err);
    }
  }

  saveStateDebounced(state: PersistentWorkspaceState, delayMs = 600): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveState(state);
    }, delayMs);
  }

  clearWorkspace(): void {
    this.adapter.remove(PERSISTENCE_KEY);
  }
}

export const persistenceManager = new PersistenceManager();
