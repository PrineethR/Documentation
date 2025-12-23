import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BlockCard from './components/BlockCard';
import AddBlockModal from './components/AddBlockModal';
import { AppState, Block, BlockType } from './types';
import { loadState, saveState, exportData } from './services/storageService';
import { findConnections } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectionInsight, setConnectionInsight] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Persist state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeChannel = useMemo(() => 
    state.channels.find(c => c.id === state.activeChannelId), 
  [state.channels, state.activeChannelId]);

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

    // Sort by Date DESC
    return blocks.sort((a, b) => b.createdAt - a.createdAt);
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
    <div className="flex min-h-screen bg-white">
      <Sidebar
        channels={state.channels}
        activeChannelId={state.activeChannelId}
        onSelectChannel={(id) => setState(prev => ({ ...prev, activeChannelId: id }))}
        onCreateChannel={handleCreateChannel}
        onExport={() => exportData(state)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 md:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white/90 backdrop-blur-md sticky top-0 z-20 mt-14 md:mt-0">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search blocks..." 
                 className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={handleConnect}
                disabled={isConnecting || filteredBlocks.length < 2}
                className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-30"
                title="Ask AI to find connections in this view"
             >
                <Sparkles size={16} className={isConnecting ? "animate-spin" : ""} />
                {isConnecting ? "Thinking..." : "Connect"}
             </button>

             <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="bg-black hover:bg-gray-800 text-white rounded-full p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow-md"
             >
               <Plus size={18} />
               <span className="hidden sm:inline">Add Block</span>
             </button>
          </div>
        </header>
        
        {/* Insight Banner */}
        {connectionInsight && (
            <div className="bg-purple-50 border-b border-purple-100 p-4 text-sm text-purple-900 flex justify-between items-start gap-4 animate-in slide-in-from-top-2">
                <div>
                    <span className="font-bold mr-2">AI Connection:</span>
                    {connectionInsight}
                </div>
                <button onClick={() => setConnectionInsight(null)} className="text-purple-400 hover:text-purple-700">
                    <span className="sr-only">Close</span>
                    ×
                </button>
            </div>
        )}

        {/* Grid Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {filteredBlocks.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="mb-4 p-4 bg-gray-100 rounded-full">
                    <Plus size={24} className="opacity-50" />
                </div>
                <p>No blocks found.</p>
                <p className="text-sm">Add some content to get started.</p>
             </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto space-y-6">
                {filteredBlocks.map(block => (
                <BlockCard 
                    key={block.id} 
                    block={block} 
                    onClick={(b) => console.log('View block', b)} 
                />
                ))}
            </div>
          )}
        </div>
      </main>

      <AddBlockModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBlock}
        activeChannelName={activeChannel ? activeChannel.title : 'All'}
      />
    </div>
  );
};

export default App;