/**
 * TSICVIDIA Storage Schema Migrations & Sanitization
 */

import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from '../mockData';

export interface PersistedSchemaV1 {
  version: 1;
  updatedAt: string;
  universe: any;
  episodes: any[];
  selectedEpisodeId: string;
  manifest: any | null;
  settings: {
    theme?: string;
    executionPolicy?: 'balanced' | 'quality_first' | 'speed_first' | 'budget_first';
    providerKeys?: Record<string, string>;
  };
}

export function sanitizeAndRepairState(raw: any): PersistedSchemaV1 {
  const universe = raw?.universe && Array.isArray(raw.universe.characters) && raw.universe.characters.length > 0
    ? raw.universe
    : CANONICAL_UNIVERSE;

  const episodes = Array.isArray(raw?.episodes) && raw.episodes.length > 0
    ? raw.episodes
    : INITIAL_EPISODES;

  const selectedEpisodeId = raw?.selectedEpisodeId && episodes.some((e: any) => e.id === raw.selectedEpisodeId)
    ? raw.selectedEpisodeId
    : episodes[0]?.id || '';

  const manifest = raw?.manifest && typeof raw.manifest === 'object' && raw.manifest.manifestId
    ? raw.manifest
    : null;

  const settings = {
    executionPolicy: raw?.settings?.executionPolicy || 'balanced',
    theme: raw?.settings?.theme || 'dark',
    providerKeys: raw?.settings?.providerKeys || {},
  };

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    universe,
    episodes,
    selectedEpisodeId,
    manifest,
    settings,
  };
}

export function migrateToCurrentSchema(raw: any): PersistedSchemaV1 | null {
  if (!raw || typeof raw !== 'object') {
    return sanitizeAndRepairState(null);
  }

  // If valid v1
  if (
    raw.version === 1 &&
    raw.universe &&
    Array.isArray(raw.universe.characters) &&
    raw.universe.characters.length > 0 &&
    Array.isArray(raw.episodes) &&
    raw.episodes.length > 0
  ) {
    return {
      version: 1,
      updatedAt: raw.updatedAt || new Date().toISOString(),
      universe: raw.universe,
      episodes: raw.episodes,
      selectedEpisodeId: raw.selectedEpisodeId || raw.episodes[0]?.id || '',
      manifest: raw.manifest || null,
      settings: raw.settings || { executionPolicy: 'balanced' },
    };
  }

  // Handle unversioned legacy or partial/corrupted structures
  return sanitizeAndRepairState(raw);
}

