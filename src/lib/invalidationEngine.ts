/**
 * TSICVIDIA Automated Dependency Invalidation Engine
 * Calculates fine-grained dependency impact when creative parameters mutate.
 */

import { Shot, Character } from '../types';

export type ArtifactStatus = 'VALID' | 'STALE' | 'BUILDING' | 'FAILED' | 'CACHED' | 'BLOCKED';

export type InvalidationReason =
  | 'dialogue_text_updated'
  | 'voice_emotion_updated'
  | 'character_pose_updated'
  | 'character_expression_updated'
  | 'character_version_updated'
  | 'camera_framing_updated'
  | 'motion_driver_updated'
  | 'seed_changed'
  | 'initial_uncompiled';

export interface ShotArtifactBreakdown {
  shotId: string;
  characterVisual: {
    status: ArtifactStatus;
    reason?: InvalidationReason;
    lastUpdated: string;
  };
  voiceAudio: {
    status: ArtifactStatus;
    reason?: InvalidationReason;
    lastUpdated: string;
  };
  motionSynthesis: {
    status: ArtifactStatus;
    reason?: InvalidationReason;
    lastUpdated: string;
  };
  qualityGate: {
    status: ArtifactStatus;
    reason?: InvalidationReason;
    lastUpdated: string;
  };
  compositorTrack: {
    status: ArtifactStatus;
    reason?: InvalidationReason;
    lastUpdated: string;
  };
}

export interface InvalidationAnalysis {
  shotId: string;
  isStale: boolean;
  affectedLayers: Array<'visual' | 'audio' | 'motion' | 'qa' | 'compositor'>;
  preservedLayers: Array<'visual' | 'audio' | 'motion' | 'qa' | 'compositor'>;
  reasons: InvalidationReason[];
  summaryMessage: string;
}

/**
 * Compare two shot states and determine which exact compilation layers are affected vs preserved.
 */
export function analyzeShotDelta(prevShot: Shot | null | undefined, nextShot: Shot): InvalidationAnalysis {
  if (!prevShot) {
    return {
      shotId: nextShot.id,
      isStale: true,
      affectedLayers: ['visual', 'audio', 'motion', 'qa', 'compositor'],
      preservedLayers: [],
      reasons: ['initial_uncompiled'],
      summaryMessage: 'New uncompiled shot specification.',
    };
  }

  const affected = new Set<'visual' | 'audio' | 'motion' | 'qa' | 'compositor'>();
  const reasons: InvalidationReason[] = [];

  // Check Dialogue / Emotion Changes
  const dialogueChanged = prevShot.dialogue !== nextShot.dialogue;
  const emotionChanged = prevShot.emotion !== nextShot.emotion;
  if (dialogueChanged || emotionChanged) {
    affected.add('audio');
    affected.add('motion');
    affected.add('qa');
    affected.add('compositor');
    reasons.push(dialogueChanged ? 'dialogue_text_updated' : 'voice_emotion_updated');
  }

  // Check Visual / Pose / Expression / Character Version Changes
  const poseChanged = prevShot.poseId !== nextShot.poseId;
  const expressionChanged = prevShot.expressionId !== nextShot.expressionId;
  const versionChanged = prevShot.characterVersion !== nextShot.characterVersion;
  const charIdChanged = prevShot.characterId !== nextShot.characterId;

  if (poseChanged || expressionChanged || versionChanged || charIdChanged) {
    affected.add('visual');
    affected.add('motion');
    affected.add('qa');
    affected.add('compositor');
    if (poseChanged) reasons.push('character_pose_updated');
    if (expressionChanged) reasons.push('character_expression_updated');
    if (versionChanged || charIdChanged) reasons.push('character_version_updated');
  }

  // Check Camera Changes
  const cameraChanged =
    typeof prevShot.camera === 'string' && typeof nextShot.camera === 'string'
      ? prevShot.camera !== nextShot.camera
      : JSON.stringify(prevShot.camera) !== JSON.stringify(nextShot.camera);

  if (cameraChanged) {
    affected.add('compositor');
    reasons.push('camera_framing_updated');
  }

  // Check Motion Preset
  const motionChanged = prevShot.motionPreset !== nextShot.motionPreset;
  if (motionChanged) {
    affected.add('motion');
    affected.add('qa');
    affected.add('compositor');
    reasons.push('motion_driver_updated');
  }

  // Check Seed Changes
  if (prevShot.seed !== nextShot.seed) {
    affected.add('visual');
    affected.add('motion');
    affected.add('qa');
    affected.add('compositor');
    reasons.push('seed_changed');
  }

  const allLayers: Array<'visual' | 'audio' | 'motion' | 'qa' | 'compositor'> = [
    'visual',
    'audio',
    'motion',
    'qa',
    'compositor',
  ];
  const affectedList = Array.from(affected);
  const preservedList = allLayers.filter((l) => !affected.has(l));

  let summaryMessage = 'All dependent artifacts are up to date.';
  if (affectedList.length > 0) {
    if (dialogueChanged && !poseChanged && !expressionChanged) {
      summaryMessage = 'Dialogue changed: Audio, Motion, & Composite invalidated. Base visual remains cached.';
    } else if (poseChanged && !dialogueChanged) {
      summaryMessage = 'Pose changed: Visual asset invalidated. Dialogue audio remains safely cached.';
    } else {
      summaryMessage = `Artifacts invalidated: ${affectedList.join(', ')}. Preserved: ${
        preservedList.length > 0 ? preservedList.join(', ') : 'none'
      }.`;
    }
  }

  return {
    shotId: nextShot.id,
    isStale: affectedList.length > 0,
    affectedLayers: affectedList,
    preservedLayers: preservedList,
    reasons,
    summaryMessage,
  };
}

/**
 * Generate fine-grained artifact breakdown for UI inspection.
 */
export function getShotArtifactBreakdown(
  shot: Shot,
  analysis?: InvalidationAnalysis
): ShotArtifactBreakdown {
  const now = new Date().toLocaleTimeString();

  if (!analysis || !analysis.isStale) {
    return {
      shotId: shot.id,
      characterVisual: { status: 'VALID', lastUpdated: now },
      voiceAudio: { status: 'VALID', lastUpdated: now },
      motionSynthesis: { status: 'VALID', lastUpdated: now },
      qualityGate: { status: 'VALID', lastUpdated: now },
      compositorTrack: { status: 'VALID', lastUpdated: now },
    };
  }

  const has = (layer: 'visual' | 'audio' | 'motion' | 'qa' | 'compositor') =>
    analysis.affectedLayers.includes(layer);

  const primaryReason = analysis.reasons[0] || 'dialogue_text_updated';

  return {
    shotId: shot.id,
    characterVisual: {
      status: has('visual') ? 'STALE' : 'CACHED',
      reason: has('visual') ? primaryReason : undefined,
      lastUpdated: now,
    },
    voiceAudio: {
      status: has('audio') ? 'STALE' : 'CACHED',
      reason: has('audio') ? primaryReason : undefined,
      lastUpdated: now,
    },
    motionSynthesis: {
      status: has('motion') ? 'STALE' : 'CACHED',
      reason: has('motion') ? primaryReason : undefined,
      lastUpdated: now,
    },
    qualityGate: {
      status: has('qa') ? 'STALE' : 'VALID',
      reason: has('qa') ? primaryReason : undefined,
      lastUpdated: now,
    },
    compositorTrack: {
      status: has('compositor') ? 'STALE' : 'VALID',
      reason: has('compositor') ? primaryReason : undefined,
      lastUpdated: now,
    },
  };
}
