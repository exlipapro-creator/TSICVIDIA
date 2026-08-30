import React, { useState } from 'react';
import {
  FolderKanban,
  HardDrive,
  CheckCircle2,
  FileImage,
  FileAudio,
  Film,
  Zap,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Asset, Universe } from '../../types';

interface AssetLibraryViewProps {
  universe: Universe;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({ universe }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mockAssets: Asset[] = [
    {
      id: 'ast_img_milo_01',
      hash: 'sha256:88fa29e81b2c4d5e6f7a8b9c0d1e2f3a',
      type: 'image',
      name: 'Milo Vance Canonical Keyframe (Bench Slouch)',
      url: universe.characters[0]?.avatarUrl,
      sizeBytes: 1420580,
      createdAt: new Date().toISOString(),
      provider: 'Flux.1-Dev-Adapter',
      lineage: {
        characterId: 'char_milo',
        characterVersion: 'v3.2',
        promptHash: 'sha256:prompt_9281',
      },
    },
    {
      id: 'ast_audio_milo_dialogue_01',
      hash: 'sha256:c18b76a09918731d102eac3f84892c90',
      type: 'audio',
      name: 'Milo Spoken Line ("Rule number one of modern fitness...")',
      url: '',
      sizeBytes: 412800,
      createdAt: new Date().toISOString(),
      provider: 'ElevenLabs Engine',
      lineage: {
        characterId: 'char_milo',
        characterVersion: 'v3.2',
        promptHash: 'sha256:audio_milo_prompt',
      },
    },
    {
      id: 'ast_vid_milo_01',
      hash: 'sha256:ee812974a91b28c894e772f912c9381b',
      type: 'video',
      name: 'Milo Motion Video Clip (LivePortrait Talking)',
      url: '',
      sizeBytes: 3840100,
      createdAt: new Date().toISOString(),
      provider: 'LivePortrait-Adapter',
      lineage: {
        characterId: 'char_milo',
        characterVersion: 'v3.2',
      },
    },
  ];

  const filtered = mockAssets.filter((a) => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              CONTENT-ADDRESSABLE STORAGE
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Immutable SHA-256 Provenance Hashes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#FAFAFA] tracking-tight mt-1.5">
            Asset Library & Execution Provenance
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Every rendered artifact is uniquely indexed and cached by its cryptographic input signature.
          </p>
        </div>

        {/* Global Storage Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono bg-[#121215] border border-zinc-800 px-4 py-2.5 rounded-2xl text-zinc-300">
          <div>
            Cached: <span className="text-emerald-400 font-medium">5.67 MB</span>
          </div>
          <div>
            Total Artifacts: <span className="text-white font-medium">{mockAssets.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {['all', 'image', 'audio', 'video'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase font-mono transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search hash or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-800/40 border border-zinc-700/60 text-xs text-white pl-9 pr-3.5 py-2 rounded-xl focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-[32px] p-5 transition-all space-y-3 font-mono text-xs shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {asset.type === 'image' && <FileImage className="w-4 h-4 text-indigo-400" />}
                {asset.type === 'audio' && <FileAudio className="w-4 h-4 text-purple-400" />}
                {asset.type === 'video' && <Film className="w-4 h-4 text-emerald-400" />}
                <span className="font-semibold text-white uppercase text-[11px]">{asset.type}</span>
              </div>
              <span className="text-[10px] text-zinc-500">
                {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            <div className="font-sans font-medium text-zinc-200 text-xs line-clamp-2">
              {asset.name}
            </div>

            <div className="p-3 bg-zinc-800/20 rounded-2xl border border-zinc-800 space-y-1 text-[10px]">
              <div className="text-zinc-500">SHA-256 HASH:</div>
              <div className="text-emerald-400 break-all">{asset.hash}</div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2.5">
              <span>{asset.provider}</span>
              <span className="text-zinc-300">{asset.lineage?.characterVersion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
