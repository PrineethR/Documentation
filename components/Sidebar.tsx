import React, { useState, useMemo } from 'react';
import { Channel } from '../types';
import { Plus, Download, Menu, X, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string | null) => void;
  onCreateChannel: (name: string, vertical?: string) => void;
  onEditChannel: (channel: Channel) => void;
  onEditVertical: (vertical: string) => void;
  onExport: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  channels, 
  activeChannelId, 
  onSelectChannel, 
  onCreateChannel,
  onEditChannel,
  onEditVertical,
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

    const sortedVerticals = Object.keys(groups).sort();
    return { groups, sortedVerticals, noVertical };
  }, [channels]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelInput.trim()) {
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
    <div className="flex flex-col h-full text-gray-300 bg-neutral-900 border-r border-neutral-800 font-mono">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          My Stash
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Personal Index v1.2</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        <div className="space-y-1">
            <button
            onClick={() => { onSelectChannel(null); setMobileOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm font-bold uppercase transition-colors border border-transparent ${
                activeChannelId === null 
                ? 'bg-neutral-800 border-neutral-700 text-white' 
                : 'text-neutral-500 hover:text-white hover:border-neutral-800'
            }`}
            >
            All Blocks
            </button>
        </div>

        {groupedChannels.noVertical.length > 0 && (
            <div className="space-y-1">
                <div className="px-3 text-xs font-bold text-neutral-600 uppercase tracking-widest mb-2 mt-4">
                    General
                </div>
                {groupedChannels.noVertical.map(channel => (
                    <div key={channel.id} className="group flex items-center">
                        <button
                            onClick={() => { onSelectChannel(channel.id); setMobileOpen(false); }}
                            className={`flex-grow text-left px-3 py-1.5 text-sm transition-colors truncate ${
                            activeChannelId === channel.id 
                                ? 'text-white font-bold bg-neutral-800 border border-neutral-700' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                        >
                            {channel.title}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditChannel(channel); }}
                            className="p-1.5 text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Settings size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )}

        {groupedChannels.sortedVerticals.map(vertical => (
            <div key={vertical} className="space-y-1 mt-4">
                 <div className="flex items-center justify-between group px-1">
                     <button 
                        onClick={() => toggleVertical(vertical)}
                        className="flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-widest hover:text-white flex-grow text-left py-1"
                     >
                        {collapsedVerticals.has(vertical) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        <span>{vertical}</span>
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); onEditVertical(vertical); }}
                        className="p-1 text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                         <Settings size={10} />
                     </button>
                 </div>
                 
                 {!collapsedVerticals.has(vertical) && groupedChannels.groups[vertical].map(channel => (
                    <div key={channel.id} className="group flex items-center">
                        <button
                            onClick={() => { onSelectChannel(channel.id); setMobileOpen(false); }}
                            className={`flex-grow text-left px-3 py-1.5 text-sm transition-colors truncate ${
                            activeChannelId === channel.id 
                                ? 'text-white font-bold bg-neutral-800 border border-neutral-700' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                            }`}
                        >
                            {channel.title}
                        </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onEditChannel(channel); }}
                            className="p-1.5 text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Settings size={12} />
                        </button>
                    </div>
                 ))}
            </div>
        ))}
        
        <div className="pt-2 border-t border-neutral-800 mt-6">
            {!isCreating ? (
                 <button 
                 onClick={() => setIsCreating(true)} 
                 className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-neutral-500 hover:text-white transition-colors flex items-center gap-2"
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
                    className="w-full text-sm px-3 py-2 border border-neutral-600 rounded-none focus:outline-none focus:border-white bg-neutral-800 text-white mb-1 placeholder:normal-case font-normal"
                    />
                    <div className="flex gap-2 text-[10px] text-neutral-500 px-1">
                        <button type="button" onClick={() => setIsCreating(false)} className="hover:text-white">Cancel</button>
                        <span className="ml-auto">Enter to save</span>
                    </div>
                </form>
            )}
        </div>

      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button 
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase text-neutral-500 hover:text-white transition-colors py-2 border border-transparent hover:border-neutral-800"
        >
            <Download size={14} /> Export Data
        </button>
      </div>

    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-neutral-900 border-b border-neutral-800 z-40 flex items-center px-4 justify-between font-mono text-white">
          <div className="font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            My Stash
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
      </div>

      <div className="hidden md:block w-64 h-screen fixed left-0 top-0">
        {content}
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/80" onClick={() => setMobileOpen(false)}>
            <div className="absolute top-0 bottom-0 left-0 w-64 bg-neutral-900 shadow-xl" onClick={e => e.stopPropagation()}>
                {content}
            </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;