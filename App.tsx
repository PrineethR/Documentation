import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BlockCard from './components/BlockCard';
import AddBlockModal from './components/AddBlockModal';
import EditBlockModal from './components/EditBlockModal';
import ChannelSettingsModal from './components/ChannelSettingsModal';
import VerticalSettingsModal from './components/VerticalSettingsModal';
import { AppState, Block, BlockType, Channel } from './types';
import { loadState, saveState, exportData } from './services/storageService';
import { findConnections } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialAddContent, setInitialAddContent] = useState<{content: string, type: BlockType} | null>(null);

  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editingVertical, setEditingVertical] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectionInsight, setConnectionInsight] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Persist state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Global Paste Listener for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        // If we are editing text inputs, ignore text pastes, but maybe still capture images?
        // To be safe, if a modal is open, we usually let the modal handle it. 
        // But if it's an image, standard textareas won't catch it. 
        // Let's allow image pasting globally unless we are in the Add/Edit modal already handling it.
        
        if (e.clipboardData?.items) {
            for (const item of e.clipboardData.items) {
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            setInitialAddContent({ content: base64, type: 'image' });
                            setIsAddModalOpen(true);
                        };
                        reader.readAsDataURL(blob);
                    }
                    return; // Stop after first image
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const activeChannel = useMemo(() => 
    state.channels.find(c => c.id === state.activeChannelId), 
  [state.channels, state.activeChannelId]);

  const uniqueVerticals = useMemo(() => {
    const s = new Set<string>();
    state.channels.forEach(c => {
      if (c.vertical) s.add(c.vertical);
    });
    return Array.from(s).sort();
  }, [state.channels]);

  const filteredBlocks = useMemo(() => {
    let blocks = state.blocks;

    // Filter by Channel
    if (state.activeChannelId) {
      blocks = blocks.filter(b => b.channelId === state.activeChannelId);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      blocks = blocks.filter(b => 
        b.content.toLowerCase().includes(q) || 
        b.title?.toLowerCase().includes(q) || 
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by Date DESC (Create copy to avoid mutation)
    return [...blocks].sort((a, b) => b.createdAt - a.createdAt);
  }, [state.blocks, state.activeChannelId, searchQuery]);

  const handleAddBlock = (content: string, type: BlockType, aiData?: { title: string, summary: string, tags: string[] }) => {
    const newBlock: Block = {
      id: `b_${Date.now()}`,
      createdAt: Date.now(),
      type,
      content,
      channelId: state.activeChannelId || state.channels[0].id, // Default to first channel if 'All' is selected
      tags: aiData?.tags || [],
      title: aiData?.title,
      description: aiData?.summary,
    };

    setState(prev => ({
      ...prev,
      blocks: [newBlock, ...prev.blocks]
    }));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
    }));
  };

  const handleDeleteBlock = (blockId: string) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
  };

  const handleCreateChannel = (name: string, vertical?: string) => {
    const newChannel = {
      id: `c_${Date.now()}`,
      title: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      vertical,
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel],
      activeChannelId: newChannel.id
    }));
  };

  const handleUpdateChannel = (id: string, updates: Partial<Channel>) => {
    setState(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const handleDeleteChannel = (id: string) => {
    setState(prev => ({
      ...prev,
      // Reset active channel if deleted
      activeChannelId: prev.activeChannelId === id ? null : prev.activeChannelId,
      // Remove channel
      channels: prev.channels.filter(c => c.id !== id),
      blocks: prev.blocks.filter(b => b.channelId !== id)
    }));
  };

  const handleRenameVertical = (oldName: string, newName: string) => {
    setState(prev => ({
        ...prev,
        channels: prev.channels.map(c => 
            c.vertical === oldName ? { ...c, vertical: newName } : c
        )
    }));
  };

  const handleDeleteVertical = (name: string) => {
      // Dissolve: Set vertical to undefined for all channels in this vertical
      setState(prev => ({
          ...prev,
          channels: prev.channels.map(c => 
              c.vertical === name ? { ...c, vertical: undefined } : c
          )
      }));
  };

  const handleConnect = async () => {
    if (filteredBlocks.length === 0) return;
    setIsConnecting(true);
    setConnectionInsight(null);

    // Prepare context: just title and content preview
    const context = filteredBlocks.slice(0, 15).map(b => 
        `[${b.type}] ${b.title || 'Untitled'}: ${b.content.substring(0, 200)}`
    );

    const insight = await findConnections(
        "Find a hidden theme or interesting connection between these items.",
        context
    );

    setConnectionInsight(insight);
    setIsConnecting(false);
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 font-sans relative text-gray-200">
      <Sidebar
        channels={state.channels}
        activeChannelId={state.activeChannelId}
        onSelectChannel={(id) => setState(prev => ({ ...prev, activeChannelId: id }))}
        onCreateChannel={handleCreateChannel}
        onEditChannel={setEditingChannel}
        onEditVertical={setEditingVertical}
        onExport={() => exportData(state)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 md:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-20 mt-14 md:mt-0 font-mono">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                 type="text" 
                 placeholder="Search blocks..." 
                 className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:bg-neutral-800 focus:border-gray-500 transition-colors text-white placeholder-gray-600 rounded-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={handleConnect}
                disabled={isConnecting || filteredBlocks.length < 2}
                className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-30"
                title="Ask AI to find connections in this view"
             >
                <Sparkles size={16} className={isConnecting ? "animate-spin" : ""} />
                {isConnecting ? "Thinking..." : "Connect"}
             </button>

             <div className="h-6 w-px bg-neutral-800 hidden sm:block"></div>

             <button 
               onClick={() => { setInitialAddContent(null); setIsAddModalOpen(true); }}
               className="bg-white hover:bg-gray-200 text-black px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase transition-all shadow-sm hover:shadow-md"
             >
               <Plus size={16} />
               <span className="hidden sm:inline">Add Block</span>
             </button>
          </div>
        </header>
        
        {/* Insight Banner */}
        {connectionInsight && (
            <div className="bg-purple-900/30 border-b border-purple-800 p-4 text-sm text-purple-200 flex justify-between items-start gap-4 animate-in slide-in-from-top-2 font-mono">
                <div>
                    <span className="font-bold mr-2 uppercase text-purple-400">AI Connection:</span>
                    {connectionInsight}
                </div>
                <button onClick={() => setConnectionInsight(null)} className="text-purple-400 hover:text-purple-200">
                    <span className="sr-only">Close</span>
                    ×
                </button>
            </div>
        )}

        {/* Grid Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-950">
          {filteredBlocks.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono">
                <div className="mb-4 p-4 bg-neutral-900 rounded-full">
                    <Plus size={24} className="opacity-50" />
                </div>
                <p>No blocks found.</p>
                <p className="text-xs mt-2 uppercase">Paste an image (Ctrl+V) or click Add Block.</p>
             </div>
          ) : (
            <div className="columns-1 md:columns-2 gap-8 max-w-full mx-auto space-y-8">
                {filteredBlocks.map(block => (
                <BlockCard 
                    key={block.id} 
                    block={block} 
                    onClick={(b) => setEditingBlock(b)} 
                />
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Global Modals - Rendered at root with keys to force fresh instances */}
      <AddBlockModal 
        key={isAddModalOpen ? 'open' : 'closed'} 
        isOpen={isAddModalOpen} 
        initialData={initialAddContent}
        onClose={() => { setIsAddModalOpen(false); setInitialAddContent(null); }}
        onAdd={handleAddBlock}
        activeChannelName={activeChannel ? activeChannel.title : 'All'}
      />

      <EditBlockModal
        key={editingBlock?.id || 'edit-block'}
        isOpen={!!editingBlock}
        block={editingBlock}
        onClose={() => setEditingBlock(null)}
        onUpdate={handleUpdateBlock}
        onDelete={handleDeleteBlock}
        channels={state.channels}
      />

      <ChannelSettingsModal 
        key={editingChannel?.id || 'edit-channel'}
        isOpen={!!editingChannel}
        channel={editingChannel}
        onClose={() => setEditingChannel(null)}
        onUpdate={handleUpdateChannel}
        onDelete={handleDeleteChannel}
        existingVerticals={uniqueVerticals}
      />
      
      <VerticalSettingsModal
        key={editingVertical || 'edit-vertical'}
        isOpen={!!editingVertical}
        verticalName={editingVertical}
        onClose={() => setEditingVertical(null)}
        onRename={handleRenameVertical}
        onDelete={handleDeleteVertical}
      />
    </div>
  );
};

export default App;