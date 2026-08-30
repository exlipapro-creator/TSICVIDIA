/**
 * TSICVIDIA Production Compiler
 * Deterministic creative compilation over non-deterministic AI execution
 */

import {
  Character,
  Episode,
  ProductionDAGNode,
  ProductionManifest,
  Shot,
  Universe,
} from '../types';

/**
 * Deterministic hash simulation for browser and node environments
 */
export function generateDeterministicHash(input: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & hash2) + (hash1 >>> 0);
  return 'sha256:' + combined.toString(16).padStart(16, '0') + Math.abs(hash1).toString(16).padStart(16, '0') + Math.abs(hash2).toString(16).padStart(16, '0') + 'e4a9';
}

/**
 * Calculate deterministic shot cache key using all resolved dependencies
 */
export function calculateShotCacheKey(params: {
  characterVersion: string;
  poseId: string;
  expressionId: string;
  locationId: string;
  dialogue: string;
  voiceProfile: string;
  provider: string;
  model: string;
  seed: number;
  resolution: string;
}): string {
  const serialized = JSON.stringify({
    cv: params.characterVersion,
    pos: params.poseId,
    exp: params.expressionId,
    loc: params.locationId,
    dlg: params.dialogue.trim(),
    vp: params.voiceProfile,
    prv: params.provider,
    mdl: params.model,
    sd: params.seed,
    res: params.resolution,
  });
  return generateDeterministicHash(serialized);
}

/**
 * The Core TSICVIDIA Production Compiler
 */
export function compileEpisodeToManifest(
  episode: Episode,
  universe: Universe,
  options?: {
    visualProvider?: string;
    voiceProvider?: string;
    motionProvider?: string;
    policy?: 'quality_first' | 'balanced' | 'speed_first' | 'budget_first';
  }
): ProductionManifest {
  const policy = options?.policy || 'balanced';
  const visualProvider = options?.visualProvider || 'Flux.1-Dev-Adapter';
  const voiceProvider = options?.voiceProvider || 'ElevenLabs-Turbo-v2.5';
  const motionProvider = options?.motionProvider || 'LivePortrait-v1.2';

  // 1. Snapshot and resolve all character versions
  const characterBindings: Record<string, string> = {};
  universe.characters.forEach((char) => {
    characterBindings[char.id] = char.currentVersion || 'v1.0';
  });

  // 2. Flatten and resolve all shots
  const allShots: Shot[] = [];
  let shotCounter = 1;

  episode.scenes.forEach((scene) => {
    scene.shots.forEach((shot) => {
      const boundCharVersion = characterBindings[shot.characterId] || 'v1.0';
      const resolutionString = episode.aspectRatio === '9:16' ? '1080x1920' : episode.aspectRatio === '16:9' ? '1920x1080' : '1080x1080';
      
      const cacheKey = calculateShotCacheKey({
        characterVersion: boundCharVersion,
        poseId: shot.poseId,
        expressionId: shot.expressionId,
        locationId: shot.locationId || scene.locationId,
        dialogue: shot.dialogue,
        voiceProfile: 'canonical_profile_' + shot.characterId,
        provider: visualProvider,
        model: 'flux-dev-q8',
        seed: shot.seed || (1000 + shotCounter * 42),
        resolution: resolutionString,
      });

      allShots.push({
        ...shot,
        shotNumber: shotCounter++,
        characterVersion: boundCharVersion,
        resolvedCacheKey: cacheKey,
        primaryProvider: visualProvider,
        fallbackStrategy: shot.fallbackStrategy || 'static_pose_animation',
      });
    });
  });

  // 3. Construct Directed Acyclic Graph (DAG) for execution
  const executionGraph: ProductionDAGNode[] = [];

  // Root Node: Character Lock & Universe Resolution
  const rootNodeId = 'node_char_lock_universe';
  executionGraph.push({
    id: rootNodeId,
    type: 'character_lock',
    name: `Snapshot Universe "${universe?.name || 'Universe'}" & Character Locks`,
    dependencies: [],
    status: 'COMPLETED',
    durationMs: 45,
    cost: 0.0,
    cacheHit: true,
  });

  // Per-shot DAG Nodes
  const shotCompositeNodeIds: string[] = [];

  allShots.forEach((shot) => {
    const sId = shot.id;
    const baseImgNodeId = `node_base_img_${sId}`;
    const voiceNodeId = `node_voice_${sId}`;
    const motionNodeId = `node_motion_${sId}`;
    const qaNodeId = `node_qa_${sId}`;
    const compositeNodeId = `node_composite_${sId}`;

    // Base Image Generation Node
    executionGraph.push({
      id: baseImgNodeId,
      shotId: sId,
      type: 'base_image',
      name: `Generate Base Visual (Pose: ${shot.poseId}, Exp: ${shot.expressionId})`,
      dependencies: [rootNodeId],
      status: 'QUEUED',
      cacheKey: shot.resolvedCacheKey,
      cost: 0.024,
    });

    // Voice Synthesis Node
    executionGraph.push({
      id: voiceNodeId,
      shotId: sId,
      type: 'voice_synthesis',
      name: `Synthesize Voice (${shot.dialogue.slice(0, 24)}...)`,
      dependencies: [rootNodeId],
      status: 'QUEUED',
      cost: 0.015,
    });

    // Motion Synthesis Node (Depends on Base Image + Voice)
    executionGraph.push({
      id: motionNodeId,
      shotId: sId,
      type: 'motion_clip',
      name: `Motion Animation (${shot.motionPreset})`,
      dependencies: [baseImgNodeId, voiceNodeId],
      status: 'QUEUED',
      cost: 0.035,
    });

    // QA Check Node (Depends on Motion)
    executionGraph.push({
      id: qaNodeId,
      shotId: sId,
      type: 'qa_check',
      name: `QA Gates (Identity, Audio, Landmark Drift)`,
      dependencies: [motionNodeId],
      status: 'QUEUED',
      cost: 0.005,
    });

    // Shot Composite Node
    executionGraph.push({
      id: compositeNodeId,
      shotId: sId,
      type: 'composite_shot',
      name: `Composite Shot #${shot.shotNumber}`,
      dependencies: [qaNodeId],
      status: 'QUEUED',
      cost: 0.004,
    });

    shotCompositeNodeIds.push(compositeNodeId);
  });

  // Final Render Node (Depends on all composite shots)
  const finalRenderNodeId = 'node_final_render_export';
  executionGraph.push({
    id: finalRenderNodeId,
    type: 'final_render',
    name: `FFmpeg Multi-Track Master Compilation & Packaging`,
    dependencies: shotCompositeNodeIds,
    status: 'QUEUED',
    cost: 0.012,
  });

  // 4. Calculate Financial Costs and Cache Savings
  const shotCount = allShots.length;
  const rawVisualCost = shotCount * 0.024;
  const rawVoiceCost = shotCount * 0.015;
  const rawMotionCost = shotCount * 0.035;
  const rawRenderCost = 0.012 + shotCount * 0.004;
  
  // Estimate ~35% cache savings in typical re-runs
  const totalRaw = rawVisualCost + rawVoiceCost + rawMotionCost + rawRenderCost;
  const estimatedSavings = policy === 'budget_first' ? totalRaw * 0.55 : totalRaw * 0.38;

  // 5. Generate Manifest Hash (Intermediate Representation Fingerprint)
  const manifestPayload = {
    epId: episode.id,
    epVer: episode.version,
    uId: universe.id,
    bindings: characterBindings,
    shots: allShots.map((s) => ({ id: s.id, ck: s.resolvedCacheKey, dur: s.duration })),
    res: episode.aspectRatio,
  };
  const manifestHash = generateDeterministicHash(JSON.stringify(manifestPayload));

  const manifest: ProductionManifest = {
    manifestId: 'MANIFEST_' + manifestHash.slice(7, 19).toUpperCase(),
    schemaVersion: '2024-10-production-ir',
    episodeId: episode.id,
    episodeVersion: episode.version,
    universeId: universe.id,
    characterBindings,
    compilerVersion: 'TSICVIDIA-Compiler-v1.4.2-deterministic',
    compiledAt: new Date().toISOString(),
    manifestHash,
    resolution: {
      width: episode.aspectRatio === '9:16' ? 1080 : episode.aspectRatio === '16:9' ? 1920 : 1080,
      height: episode.aspectRatio === '9:16' ? 1920 : episode.aspectRatio === '16:9' ? 1080 : 1080,
      fps: 30,
      aspectRatio: episode.aspectRatio,
    },
    providerAssignments: {
      visual: { provider: visualProvider, model: 'flux-dev-q8' },
      voice: { provider: voiceProvider, model: 'eleven_multilingual_v2' },
      motion: { provider: motionProvider, model: 'liveportrait-portrait-fp16', fallback: 'static_pose_animation' },
      render: { provider: 'TSICVIDIA-FFmpeg-Compositor' },
    },
    executionGraph,
    shots: allShots,
    estimatedCost: {
      visual: Number(rawVisualCost.toFixed(3)),
      voice: Number(rawVoiceCost.toFixed(3)),
      motion: Number(rawMotionCost.toFixed(3)),
      render: Number(rawRenderCost.toFixed(3)),
      total: Number(totalRaw.toFixed(3)),
      estimatedCacheSavings: Number(estimatedSavings.toFixed(3)),
    },
    qaPolicy: {
      identityThreshold: 0.88,
      wardrobeThreshold: 0.85,
      faceThreshold: 0.90,
      audioLufsTarget: -14.0,
      motionMaxJitter: 0.08,
    },
  };

  return manifest;
}
