/**
 * TSICVIDIA Core Domain Types
 * Deterministic Creative Compilation Engine
 */

export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ExecutionPolicy = 'balanced' | 'quality_first' | 'speed_first' | 'budget_first';
export type JobStatus = 'DRAFT' | 'COMPILED' | 'QUEUED' | 'RUNNING' | 'VALIDATING' | 'READY' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'RETRYING' | 'BLOCKED';
export type QAStatus = 'PASS' | 'WARNING' | 'FAIL' | 'BLOCKED';
export type ProviderType = 'visual' | 'voice' | 'motion' | 'llm' | 'render';

export interface QualityGateResult {
  identity: { status: QAStatus; score: number };
  visual: { status: QAStatus; issues: string[] };
  audio: { status: QAStatus; lufs: number };
  motion: { status: QAStatus; jitter: number; remedy?: string };
  composite: { status: QAStatus; fps: number };
  overall: QAStatus;
}

export interface Asset {
  id: string;
  hash: string;
  type: 'image' | 'audio' | 'video' | 'pose' | 'expression';
  name: string;
  url?: string;
  sizeBytes: number;
  createdAt: string;
  provider: string;
  lineage?: {
    characterId?: string;
    characterVersion?: string;
    promptHash?: string;
  };
}

export interface VisualDNA {
  face: string;
  hair: string;
  hairColor: string;
  skin: string;
  eyes: string;
  eyeColor: string;
  bodyProportions: string;
  wardrobe: string;
  accessories: string[];
  artStyle: string;
  palette: string[];
  lineStyle: string;
  shading: string;
  visualConstraints: string[];
}

export interface VoiceProfile {
  provider: 'ElevenLabs' | 'GeminiTTS' | 'LocalTTS' | 'MockVoice';
  voiceId: string;
  voiceName: string;
  language: string;
  accent: string;
  pitch: number; // 0.5 - 1.5
  speakingSpeed: number; // 0.5 - 2.0
  emotionalProfile: string;
  stability: number; // 0 - 1
  similarityBoost: number; // 0 - 1
}

export interface PoseItem {
  id: string;
  name: string;
  canonicalImage: string;
  category: 'standing' | 'sitting' | 'action' | 'gesture' | 'idle';
  landmarks: string;
  semanticTags: string[];
  compatibleAngles: string[];
  compatibleWardrobe: string[];
}

export interface ExpressionItem {
  id: string;
  name: string;
  canonicalImage: string;
  emotion: 'neutral' | 'happy' | 'confused' | 'angry' | 'shocked' | 'sad' | 'suspicious' | 'deadpan' | 'smug';
  intensity: number; // 1 - 10
  semanticTags: string[];
}

export interface ReferenceAsset {
  id: string;
  type: 'front' | 'side' | 'three_quarter' | 'full_body' | 'expression_sheet' | 'pose_sheet' | 'wardrobe_sheet';
  url: string;
  hash: string;
}

export interface CharacterQAProfile {
  identityThreshold: number; // e.g. 0.88
  allowedPoseVariance: number; // e.g. 0.12
  paletteDriftMax: number; // e.g. 0.05
  landmarkDriftMax: number; // e.g. 0.08
  lufsTarget: number; // e.g. -14.0
  maxLipSyncDiscrepancyMs: number; // e.g. 40
}

export interface VectorLandmark {
  id: string;
  name: string;
  category: 'face_mesh' | 'skeleton_bone' | 'eyebrow' | 'jaw' | 'mouth_viseme' | 'eye_pupil';
  x: number; // 0.0 to 1.0 normalized
  y: number; // 0.0 to 1.0 normalized
  confidence: number;
}

export interface ProductionRecipe {
  id: string;
  name: string;
  category: 'comedy_short' | 'educational_breakdown' | 'philosophical_banter' | 'product_teardown' | 'story_monologue';
  description: string;
  targetDuration: number;
  structure: {
    stage: 'hook' | 'setup' | 'conflict' | 'observation' | 'punchline' | 'cta' | 'end_card';
    label: string;
    suggestedCamera: string;
    suggestedEmotion: string;
    durationRatio: number;
    guideline: string;
  }[];
}

export interface ExposureSheetFrame {
  frameNumber: number;
  timestampSec: number;
  shotId: string;
  audioPhoneme: string; // e.g. 'A', 'E', 'O', 'M', 'L', 'F/V', 'REST'
  dialogueSyllable: string;
  poseKey: string;
  faceViseme: string;
  cameraCue: string;
  propState: string;
  onionSkinActive?: boolean;
}

export interface TimelineTrackClip {
  id: string;
  trackId: string;
  name: string;
  startTime: number;
  duration: number;
  type: 'video' | 'character' | 'background' | 'prop' | 'camera' | 'caption' | 'voice' | 'music' | 'sfx' | 'lut';
  contentUrl?: string;
  assetHash?: string;
  text?: string;
  volume?: number;
  colorHex?: string;
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'character' | 'background' | 'prop' | 'camera' | 'caption' | 'voice' | 'music' | 'sfx' | 'lut';
  muted: boolean;
  locked: boolean;
  visible: boolean;
  color: string;
  clips: TimelineTrackClip[];
}

export interface StructuredQAEvidence {
  shotId: string;
  timestamp: string;
  overallStatus: QAStatus;
  
  identity: {
    score: number;
    threshold: number;
    cosineSimilarity: number;
    status: QAStatus;
    diagnosticNotes: string;
  };
  visual: {
    status: QAStatus;
    detectedArtifacts: string[];
    paletteConsistencyScore: number;
  };
  pose: {
    score: number;
    allowedVariance: number;
    status: QAStatus;
  };
  motion: {
    landmarkJitterIndex: number;
    maxAllowedJitter: number;
    failingFrames: number[];
    status: QAStatus;
    remedyApplied?: string;
  };
  audio: {
    lufs: number;
    targetLufs: number;
    peakDbfs: number;
    status: QAStatus;
  };
  lipSync: {
    visemeAlignmentScore: number;
    discrepancyMs: number;
    status: QAStatus;
  };
}

export interface CharacterVersion {
  version: string;
  characterId: string;
  parentVersion?: string;
  createdAt: string;
  changeSummary: string;
  visualDna: VisualDNA;
  voiceProfile: VoiceProfile;
  references: ReferenceAsset[];
  poseLibrary: PoseItem[];
  expressionLibrary: ExpressionItem[];
  qaProfile?: CharacterQAProfile;
  vectorLandmarks?: VectorLandmark[];
  isLocked: boolean;
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  ageBracket: string;
  archetype: string;
  personality: string;
  role: string;
  description: string;
  currentVersion: string;
  versions: CharacterVersion[];
  avatarUrl: string;
}

export interface LocationItem {
  id: string;
  name: string;
  description: string;
  category: 'interior' | 'exterior' | 'studio' | 'abstract';
  lighting: string;
  atmosphere: string;
  backgroundUrl: string;
  palette: string[];
}

export interface PropItem {
  id: string;
  name: string;
  category: string;
  description: string;
  canonicalImage: string;
}

export interface Universe {
  id: string;
  name: string;
  description: string;
  characters: Character[];
  locations: LocationItem[];
  props: PropItem[];
  lore: string[];
  visualStyle: string;
  rules: string[];
  recipes?: ProductionRecipe[];
}

export interface Shot {
  id: string;
  shotNumber: number;
  characterId: string;
  characterVersion: string;
  poseId: string;
  expressionId: string;
  action: string;
  locationId: string;
  camera: string; // e.g. "medium / eye-level", "close-up / dutch-angle"
  dialogue: string;
  emotion: string;
  duration: number; // seconds
  motionPreset: string; // e.g. "subtle_head", "hand_emphasis", "talking_neutral"
  propIds: string[];
  referenceAssetHashes: string[];
  seed: number;
  resolvedCacheKey?: string;
  status: JobStatus;
  primaryProvider: string;
  fallbackStrategy: 'static_pose_animation' | 'camera_motion_fallback' | 'alternative_motion_provider';
  generatedArtifacts?: {
    baseImageUrl?: string;
    audioUrl?: string;
    motionClipUrl?: string;
    qaResult?: ShotQAResult;
  };
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  locationId: string;
  timeOfDay?: string;
  mood?: string;
  shots: Shot[];
}

export interface EpisodeScript {
  rawText: string;
  mode: 'manual' | 'ai_assisted' | 'story_input' | 'template' | 'recipe';
  templateType?: 'commentary' | 'educational' | 'story' | 'character_comedy';
  recipeId?: string;
  structure?: {
    hook: string;
    setup: string;
    conflict: string;
    observation: string;
    punchline: string;
    cta: string;
  };
}

export interface Episode {
  id: string;
  universeId: string;
  title: string;
  premise: string;
  objective: string;
  targetDuration: number; // in seconds
  platform: 'tiktok_shorts_reels' | 'youtube_landscape' | 'instagram_square';
  aspectRatio: AspectRatio;
  script: EpisodeScript;
  scenes: Scene[];
  version: string;
  createdAt: string;
  updatedAt: string;
  productionId?: string;
}

export interface ProviderCapability {
  supportsReferenceImages: boolean;
  supportsCharacterLora: boolean;
  supportsSeed: boolean;
  supportsPoseControl: boolean;
  supportsExpressionControl: boolean;
  supportsAudioDriving: boolean;
  supportsVisemes: boolean;
  supportsStreaming: boolean;
  supportsAsyncGeneration: boolean;
  maxResolution: string;
  estimatedCostPerUnit: number;
  estimatedLatencyMs: number;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  type: ProviderType;
  models: string[];
  selectedModel: string;
  capabilities: ProviderCapability;
  isAvailable: boolean;
}

export interface ShotQAResult {
  identityStatus: QAStatus;
  identityScore: number; // 0 - 1.0
  identityDiagnostics?: string;
  
  visualStatus: QAStatus;
  visualArtifactsDetected: string[];
  
  audioStatus: QAStatus;
  audioMetrics: {
    peakDb: number;
    rmsDb: number;
    lufs: number;
    silenceDetected: boolean;
    clippingDetected: boolean;
  };
  
  motionStatus: QAStatus;
  motionDriftDetected: boolean;
  driftFrames?: string;
  remedyAction?: string;
  
  compositeStatus: QAStatus;
  overallStatus: QAStatus;
}

export interface ProductionDAGNode {
  id: string;
  type: 'character_lock' | 'base_image' | 'voice_synthesis' | 'motion_clip' | 'qa_check' | 'composite_shot' | 'final_render';
  name: string;
  dependencies: string[];
  status: JobStatus;
  durationMs?: number;
  cost?: number;
  cacheHit?: boolean;
  cacheKey?: string;
  errorMessage?: string;
  shotId?: string;
}

export interface ProductionManifest {
  manifestId: string;
  schemaVersion: '2024-10-production-ir';
  episodeId: string;
  episodeVersion: string;
  universeId: string;
  characterBindings: Record<string, string>; // characterId -> version
  compilerVersion: string;
  compiledAt: string;
  manifestHash: string;
  resolution: {
    width: number;
    height: number;
    fps: number;
    aspectRatio: AspectRatio;
  };
  providerAssignments: {
    visual: { provider: string; model: string };
    voice: { provider: string; model: string };
    motion: { provider: string; model: string; fallback: string };
    render: { provider: string };
  };
  executionGraph: ProductionDAGNode[];
  shots: Shot[];
  estimatedCost: {
    visual: number;
    voice: number;
    motion: number;
    render: number;
    total: number;
    estimatedCacheSavings: number;
  };
  qaPolicy: {
    identityThreshold: number;
    wardrobeThreshold: number;
    faceThreshold: number;
    audioLufsTarget: number;
    motionMaxJitter: number;
  };
}

export interface ProductionJob {
  id: string;
  manifestId: string;
  episodeId: string;
  status: JobStatus;
  progressPercent: number;
  startedAt: string;
  completedAt?: string;
  totalShots: number;
  completedShots: number;
  cacheHits: number;
  cacheMisses: number;
  regenerations: number;
  qaSummary: {
    passCount: number;
    warningCount: number;
    failCount: number;
  };
  activeDegradations: string[];
  finalRenderUrl?: string;
  thumbnailUrl?: string;
  actualCost: number;
}

export interface AssetLineageRecord {
  assetId: string;
  type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'POSE' | 'EXPRESSION' | 'FINAL_RENDER';
  version: string;
  hash: string;
  storageUri: string;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  provider: string;
  model: string;
  generationMetadata: Record<string, any>;
  parentAssets: string[];
  characterVersionRef?: string;
  cacheKey: string;
}

export interface ReproducibilityReport {
  productionId: string;
  characterVersion: string;
  episodeTitle: string;
  compilerVersion: string;
  manifestSha256: string;
  visualEngine: string;
  voiceEngine: string;
  motionEngine: string;
  renderEngine: string;
  totalAssets: number;
  cacheHits: number;
  regenerations: number;
  qaStatus: QAStatus;
  renderedAt: string;
  reproducibleCommand: string;
}
