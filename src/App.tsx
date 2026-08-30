import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CharacterStudio } from './components/characters/CharacterStudio';
import { EpisodeEditor } from './components/episodes/EpisodeEditor';
import { ProductionConsole } from './components/production/ProductionConsole';
import { QAGatesConsole } from './components/qa/QAGatesConsole';
import { StudioCompositorPlayer } from './components/player/StudioCompositorPlayer';
import { UniverseView } from './components/universe/UniverseView';
import { AssetLibraryView } from './components/assets/AssetLibraryView';
import { VersionDiffView } from './components/diffs/VersionDiffView';
import { ProviderRegistryView } from './components/settings/ProviderRegistryView';
import { ShotDesignerView } from './components/episodes/ShotDesignerView';
import { ExposureSheetView } from './components/animation/ExposureSheetView';
import { DiffModal } from './components/modals/DiffModal';
import { ReproducibilityReportModal } from './components/modals/ReproducibilityReportModal';
import { AIAssistantDrawer } from './components/modals/AIAssistantDrawer';
import { CANONICAL_UNIVERSE, INITIAL_EPISODES } from './lib/mockData';
import { Character, Episode, ProductionJob, ProductionManifest, ProductionRecipe, Shot, Universe } from './types';
import { compileEpisodeToManifest } from './lib/compiler';
import { executionEngine } from './lib/executionEngine';
import { audioSynthesizer } from './lib/audioSynthesizer';

export default function App() {
  const [universe, setUniverse] = useState<Universe>(CANONICAL_UNIVERSE);
  const [episodes, setEpisodes] = useState<Episode[]>(INITIAL_EPISODES);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(INITIAL_EPISODES[0]?.id || 'ep_gym_ego');
  const [activeView, setActiveView] = useState<NavView>('dashboard');

  // Active Manifest & Job State
  const initialManifest = compileEpisodeToManifest(INITIAL_EPISODES[0], CANONICAL_UNIVERSE);
  const [manifest, setManifest] = useState<ProductionManifest | null>(initialManifest);
  const [activeJob, setActiveJob] = useState<ProductionJob | null>(null);

  // Modals state
  const [diffModalData, setDiffModalData] = useState<{
    isOpen: boolean;
    character: Character | null;
    v1: string;
    v2: string;
  }>({
    isOpen: false,
    character: null,
    v1: 'v3.1',
    v2: 'v3.2',
  });

  const [reproModalOpen, setReproModalOpen] = useState<boolean>(false);
  const [aiDrawerData, setAiDrawerData] = useState<{
    isOpen: boolean;
    prompt: string;
    type: string;
  }>({
    isOpen: false,
    prompt: '',
    type: 'script_generation',
  });

  const selectedEpisode = episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];

  // Handler: Compile Episode to Manifest
  const handleCompileEpisode = (episode: Episode) => {
    audioSynthesizer.playStudioChime('compile');
    const compiled = compileEpisodeToManifest(episode, universe, { policy: 'balanced' });
    setManifest(compiled);
    setActiveView('productions');
  };

  // Handler: Execute Production DAG Job
  const handleExecuteProduction = (targetManifest: ProductionManifest) => {
    executionEngine.executeManifest(targetManifest, (updatedJob) => {
      setActiveJob(updatedJob);
      if (updatedJob.status === 'COMPLETED') {
        audioSynthesizer.playStudioChime('render_done');
      }
    });
  };

  // Handler: Update Shot directly from Shot Designer
  const handleUpdateShot = (updatedShot: Shot) => {
    const updatedScenes = selectedEpisode.scenes.map((scene) => ({
      ...scene,
      shots: scene.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s)),
    }));
    const updatedEp = { ...selectedEpisode, scenes: updatedScenes, updatedAt: new Date().toISOString() };
    setEpisodes(episodes.map((e) => (e.id === updatedEp.id ? updatedEp : e)));
  };

  // Handler: Instantiate Episode from Production Recipe
  const handleCreateEpisodeFromRecipe = (recipe: ProductionRecipe) => {
    const newEpId = `ep_recipe_${Date.now()}`;
    const newEpisode: Episode = {
      id: newEpId,
      universeId: universe.id,
      title: `${recipe.name} — #${episodes.length + 1}`,
      premise: `Structured episode compiled from the ${recipe.name} recipe blueprint.`,
      objective: recipe.description,
      targetDuration: recipe.targetDuration,
      platform: 'tiktok_shorts_reels',
      aspectRatio: '9:16',
      version: 'v1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      script: {
        rawText: recipe.structure.map((s) => `[${s.stage.toUpperCase()}]: ${s.guideline}`).join('\n'),
        mode: 'recipe',
        recipeId: recipe.id,
      },
      scenes: [
        {
          id: `scene_01_${Date.now()}`,
          sceneNumber: 1,
          title: 'Scene 1 — Recipe Blueprint',
          locationId: universe.locations[0]?.id || 'loc_cyber_gym',
          timeOfDay: 'dusk',
          mood: 'satirical',
          shots: recipe.structure.map((stage, idx) => ({
            id: `shot_rec_${idx + 1}_${Date.now()}`,
            shotNumber: idx + 1,
            characterId: universe.characters[0]?.id || 'char_milo',
            characterVersion: universe.characters[0]?.currentVersion || 'v3.2',
            poseId: universe.characters[0]?.versions[0]?.poseLibrary[0]?.id || 'pose_bench_slouch',
            expressionId: universe.characters[0]?.versions[0]?.expressionLibrary[0]?.id || 'exp_deadpan',
            action: stage.label,
            locationId: universe.locations[0]?.id || 'loc_cyber_gym',
            camera: stage.suggestedCamera,
            dialogue: stage.guideline,
            emotion: stage.suggestedEmotion,
            duration: Number((recipe.targetDuration * stage.durationRatio).toFixed(1)),
            motionPreset: 'talking_neutral',
            propIds: [],
            referenceAssetHashes: ['sha256:88fa29e81'],
            seed: 1000 + idx * 7,
            status: 'DRAFT',
            primaryProvider: 'Flux.1-Dev-Adapter',
            fallbackStrategy: 'static_pose_animation',
          })),
        },
      ],
    };

    setEpisodes([newEpisode, ...episodes]);
    setSelectedEpisodeId(newEpisode.id);
    setActiveView('episodes');
  };

  return (
    <div className="flex h-screen w-screen bg-[#08090B] text-slate-100 font-['Inter',sans-serif] overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        episodeCount={episodes.length}
        characterCount={universe.characters.length}
        activeProductionsCount={activeJob && activeJob.status === 'RUNNING' ? 1 : 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          universe={universe}
          episodes={episodes}
          selectedEpisodeId={selectedEpisodeId}
          activeJob={activeJob}
          onSelectEpisode={setSelectedEpisodeId}
          onSelectView={setActiveView}
          onQuickCompile={() => handleCompileEpisode(selectedEpisode)}
          onOpenSearch={() => setActiveView('assets')}
          onOpenAIAssistant={() =>
            setAiDrawerData({
              isOpen: true,
              prompt: `Refine episode "${selectedEpisode?.title || 'Episode'}"`,
              type: 'script_generation',
            })
          }
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto bg-[#08090B]">
          {activeView === 'dashboard' && (
            <DashboardView
              universe={universe}
              episodes={episodes}
              activeJob={activeJob}
              onSelectEpisode={(id) => {
                setSelectedEpisodeId(id);
                setActiveView('episodes');
              }}
              onSelectView={setActiveView}
              onTriggerCompile={(id) => {
                const ep = episodes.find((e) => e.id === id) || episodes[0];
                handleCompileEpisode(ep);
              }}
            />
          )}

          {activeView === 'episodes' && (
            <EpisodeEditor
              universe={universe}
              episodes={episodes}
              selectedEpisodeId={selectedEpisodeId}
              onSelectEpisode={setSelectedEpisodeId}
              onUpdateEpisode={(updated) => {
                setEpisodes(episodes.map((e) => (e.id === updated.id ? updated : e)));
              }}
              onCompileManifest={handleCompileEpisode}
              onOpenAssistantWithPrompt={(prompt, type) =>
                setAiDrawerData({ isOpen: true, prompt, type })
              }
            />
          )}

          {activeView === 'shot_designer' && (
            <ShotDesignerView
              universe={universe}
              selectedEpisode={selectedEpisode}
              onUpdateShot={handleUpdateShot}
              onCompileShot={() => handleCompileEpisode(selectedEpisode)}
            />
          )}

          {activeView === 'exposure_sheet' && (
            <ExposureSheetView
              universe={universe}
              selectedEpisode={selectedEpisode}
              onOpenShotDesigner={() => setActiveView('shot_designer')}
            />
          )}

          {activeView === 'characters' && (
            <CharacterStudio
              universe={universe}
              onUpdateUniverse={setUniverse}
              onOpenDiffModal={(char, v1, v2) =>
                setDiffModalData({
                  isOpen: true,
                  character: char,
                  v1,
                  v2,
                })
              }
            />
          )}

          {activeView === 'productions' && (
            <ProductionConsole
              universe={universe}
              manifest={manifest}
              activeJob={activeJob}
              onExecuteProduction={handleExecuteProduction}
              onOpenReproducibilityReport={() => setReproModalOpen(true)}
            />
          )}

          {activeView === 'qa' && (
            <QAGatesConsole universe={universe} episodes={episodes} />
          )}

          {activeView === 'compositor' && (
            <StudioCompositorPlayer universe={universe} episode={selectedEpisode} />
          )}

          {activeView === 'universe' && (
            <UniverseView
              universe={universe}
              onUpdateUniverse={setUniverse}
              onCreateEpisodeFromRecipe={handleCreateEpisodeFromRecipe}
            />
          )}

          {activeView === 'assets' && <AssetLibraryView universe={universe} />}

          {activeView === 'diffs' && <VersionDiffView universe={universe} />}

          {activeView === 'settings' && <ProviderRegistryView />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <DiffModal
        isOpen={diffModalData.isOpen}
        character={diffModalData.character}
        v1Version={diffModalData.v1}
        v2Version={diffModalData.v2}
        onClose={() => setDiffModalData({ ...diffModalData, isOpen: false })}
      />

      <ReproducibilityReportModal
        isOpen={reproModalOpen}
        manifest={manifest}
        onClose={() => setReproModalOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={aiDrawerData.isOpen}
        universe={universe}
        episode={selectedEpisode}
        initialPrompt={aiDrawerData.prompt}
        initialType={aiDrawerData.type}
        onClose={() => setAiDrawerData({ ...aiDrawerData, isOpen: false })}
        onApplyChanges={(newText) => {
          setEpisodes(
            episodes.map((e) =>
              e.id === selectedEpisodeId
                ? {
                    ...e,
                    script: { ...e.script, rawText: newText },
                  }
                : e
            )
          );
        }}
      />
    </div>
  );
}
