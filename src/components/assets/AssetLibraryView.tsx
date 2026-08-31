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
  Copy,
  Info,
  GitBranch,
} from 'lucide-react';
import { Asset, Universe } from '../../types';

interface AssetLibraryViewProps {
  universe: Universe;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({ universe }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const mockAssets: Asset[] = [
    {
      id: 'ast_master_render_01',
      hash: 'sha256:ee812974a91b28c894e772f912c9381b_master_ep01',
      type: 'video',
      name: 'Episode 01 — Master Render (1080x1920 30FPS H.264)',
      url: '',
      sizeBytes: 18450100,
      createdAt: new Date().toISOString(),
      provider: 'TSICVIDIA-FFmpeg-Master-Pipeline',
      lineage: {
        characterId: 'char_milo',
        characterVersion: 'v3.2',
        promptHash: 'sha256:manifest_gym_ego_v3.2',
      },
    },
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
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.hash.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
            Cached: <span className="text-emerald-400 font-medium">24.12 MB</span>
          </div>
          <div>
            Total Artifacts: <span className="text-white font-medium">{mockAssets.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-zinc-800 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
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
            placeholder="Search hash, name, version..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-800/40 border border-zinc-700/60 text-xs text-white pl-9 pr-3.5 py-2 rounded-xl focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-[32px] p-5 transition-all space-y-3 font-mono text-xs shadow-xl cursor-pointer"
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
              <div className="flex items-center justify-between text-zinc-500">
                <span>SHA-256 HASH:</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHash(asset.hash);
                  }}
                  className="text-zinc-400 hover:text-white"
                  title="Copy SHA-256"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-emerald-400 break-all">{asset.hash}</div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2.5">
              <span>{asset.provider}</span>
              <span className="text-zinc-300">{asset.lineage?.characterVersion || 'Global'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Asset Lineage Drawer / Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#121215] border border-zinc-800 rounded-[32px] max-w-xl w-full p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-white font-semibold uppercase flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Asset Provenance & Lineage
              </span>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-zinc-500 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-zinc-500 text-[10px]">ASSET NAME:</span>
                <div className="text-white font-sans text-sm">{selectedAsset.name}</div>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">CONTENT HASH:</span>
                <div className="text-emerald-400 break-all">{selectedAsset.hash}</div>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">GENERATED BY PROVIDER:</span>
                <div className="text-white">{selectedAsset.provider}</div>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">BOUND CHARACTER VERSION:</span>
                <div className="text-indigo-400">{selectedAsset.lineage?.characterVersion || 'None (Canonical Global)'}</div>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">FILE SIZE:</span>
                <div className="text-zinc-300">{(selectedAsset.sizeBytes / 1024 / 1024).toFixed(2)} MB ({selectedAsset.sizeBytes.toLocaleString()} bytes)</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAsset(null)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
