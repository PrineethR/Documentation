import React, { useState, useMemo } from 'react';
import { Channel } from '../types';
import { Plus, Download, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string | null) => void;
  onCreateChannel: (name: string, vertical?: string) => void;
  onExport: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  channels, 
  activeChannelId, 
  onSelectChannel, 
  onCreateChannel,
  onExport,
  mobileOpen,
  setMobileOpen
}) => {
  const [newChannelInput, setNewChannelInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [collapsedVerticals, setCollapsedVerticals] = useState<Set<string>>(new Set());

  // Group channels by vertical
  const groupedChannels = useMemo(() => {
    const groups: Record<string, Channel[]> = {};
    const noVertical: Channel[] = [];

    channels.forEach(ch => {
      if (ch.vertical) {
        if (!groups[ch.vertical]) groups[ch.vertical] = [];
        groups[ch.vertical].push(ch);
      } else {
        noVertical.push(ch);
      }
    });

    // Sort verticals alphabetically
    const sortedVerticals = Object.keys(groups).sort();
    
    return { groups, sortedVerticals, noVertical };
  }, [channels]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelInput.trim()) {
      // Parse "Vertical / Channel" syntax
      const parts = newChannelInput.split('/');
      let name = parts[0].trim();
      let vertical: string | undefined = undefined;

      if (parts.length > 1) {
        vertical = parts[0].trim();
        name = parts.slice(1).join('/').trim();
      }

      if (name) {
        onCreateChannel(name, vertical);
        setNewChannelInput('');
        setIsCreating(false);
      }
    }
  };

  const toggleVertical = (vertical: string) => {
    setCollapsedVerticals(prev => {
        const next = new Set(prev);
        if (next.has(vertical)) {
            next.delete(vertical);
        } else {
            next.add(vertical);
        }
        return next;
    });
  };

  const content = (
    <div className="flex flex-col h-full text-gray-800 bg-gray-50/50 border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          My Stash
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">Personal Index v1.1</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
            <button
            onClick={() => { onSelectChannel(null); setMobileOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeChannelId === null 
                ? 'bg-white shadow-sm border border-gray-200 text-black' 
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
            >
            All Blocks
            </button>
        </div>

        {/* Ungrouped Channels */}
        {groupedChannels.noVertical.length > 0 && (
            <div className="space-y-1">
                <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    General
                </div>
                {groupedChannels.noVertical.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => { onSelectChannel(channel.id); setMobileOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        activeChannelId === channel.id 
                            ? 'bg-white shadow-sm border border-gray-200 text-black font-medium' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                    >
                        {channel.title}
                    </button>
                ))}
            </div>
        )}

        {/* Verticals */}
        {groupedChannels.sortedVerticals.map(vertical => (
            <div key={vertical} className="space-y-1">
                 <button 
                    onClick={() => toggleVertical(vertical)}
                    className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 group"
                 >
                    <span>{vertical}</span>
                    {collapsedVerticals.has(vertical) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                 </button>
                 
                 {!collapsedVerticals.has(vertical) && groupedChannels.groups[vertical].map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => { onSelectChannel(channel.id); setMobileOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        activeChannelId === channel.id 
                            ? 'bg-white shadow-sm border border-gray-200 text-black font-medium' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                        }`}
                    >
                        {channel.title}
                    </button>
                 ))}
            </div>
        ))}
        
        {/* Creation UI */}
        <div className="pt-2 border-t border-gray-100 mt-4">
            {!isCreating ? (
                 <button 
                 onClick={() => setIsCreating(true)} 
                 className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-2"
               >
                 <Plus size={14} /> New Channel...
               </button>
            ) : (
                <form onSubmit={handleCreate} className="px-2">
                    <input
                    autoFocus
                    type="text"
                    value={newChannelInput}
                    onChange={(e) => setNewChannelInput(e.target.value)}
                    placeholder="Group / Name..."
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black mb-1"
                    title="Type 'Name' or 'Vertical / Name'"
                    />
                    <div className="flex gap-2 text-[10px] text-gray-400 px-1">
                        <span>Tip: Use "Group / Name"</span>
                        <button type="button" onClick={() => setIsCreating(false)} className="ml-auto hover:text-black">Cancel</button>
                    </div>
                </form>
            )}
        </div>

      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-black transition-colors py-2 border border-transparent hover:border-gray-200 rounded"
        >
            <Download size={14} /> Export Data
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4 justify-between">
          <div className="font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            My Stash
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0">
        {content}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-900/50" onClick={() => setMobileOpen(false)}>
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                {content}
            </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;