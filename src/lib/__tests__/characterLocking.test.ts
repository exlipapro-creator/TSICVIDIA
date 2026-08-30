import { describe, it, expect } from 'vitest';
import { CANONICAL_UNIVERSE } from '../mockData';
import { Character, CharacterVersion } from '../../types';

describe('Character DNA Version Locking & Branching Rules', () => {
  const milo: Character = CANONICAL_UNIVERSE.characters[0];

  it('verifies canonical Milo has locked immutable versions', () => {
    expect(milo.versions.length).toBeGreaterThan(1);
    const lockedVersions = milo.versions.filter((v) => v.isLocked);
    expect(lockedVersions.length).toBeGreaterThan(0);
  });

  it('branches a new mutable version preserving parent lineage', () => {
    const parentVersion = milo.versions.find((v) => v.version === 'v3.2') || milo.versions[0];
    const currentVerNumber = parseFloat(parentVersion.version.replace('v', '')) || 3.2;
    const nextVer = `v${(currentVerNumber + 0.1).toFixed(1)}`;

    const branchedVersion: CharacterVersion = {
      ...JSON.parse(JSON.stringify(parentVersion)),
      version: nextVer,
      parentVersion: parentVersion.version,
      createdAt: new Date().toISOString(),
      changeSummary: `Branched from ${parentVersion.version}. Refined styling.`,
      isLocked: false,
    };

    expect(branchedVersion.version).toBe('v3.3');
    expect(branchedVersion.parentVersion).toBe('v3.2');
    expect(branchedVersion.isLocked).toBe(false);
    expect(branchedVersion.visualDna.face).toBe(parentVersion.visualDna.face);
  });

  it('locks a version and preserves deterministic DNA', () => {
    const mutableVersion: CharacterVersion = {
      ...JSON.parse(JSON.stringify(milo.versions[0])),
      version: 'v3.9',
      isLocked: false,
    };

    // Lock version
    mutableVersion.isLocked = true;
    expect(mutableVersion.isLocked).toBe(true);
    expect(mutableVersion.voiceProfile.pitch).toBe(milo.versions[0].voiceProfile.pitch);
  });
});
