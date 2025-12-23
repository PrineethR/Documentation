import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Channel } from '../types';

interface ChannelSettingsModalProps {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Channel>) => void;
  onDelete: (id: string) => void;
  existingVerticals: string[];
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ 
  channel, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  existingVerticals 
}) => {
  const [title, setTitle] = useState('');
  const [vertical, setVertical] = useState('');
  const [newVertical, setNewVertical] = useState('');
  const [isNewVerticalMode, setIsNewVerticalMode] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (channel) {
      setTitle(channel.title);
      setVertical(channel.vertical || 'General');
      setIsNewVerticalMode(false);
      setNewVertical('');
      setIsConfirmingDelete(false);
    }
  }, [channel]);

  const handleSave = () => {
    if (!channel) return;
    
    let finalVertical = vertical === 'General' ? undefined : vertical;
    if (isNewVerticalMode && newVertical.trim()) {
        finalVertical = newVertical.trim();
    }

    onUpdate(channel.id, {
      title,
      vertical: finalVertical,
      slug: title.toLowerCase().replace(/\s+/g, '-')
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!channel) return;
    onDelete(channel.id);
    onClose();
  };

  if (!isOpen || !channel) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono" onClick={onClose}>
      <div 
        className="bg-neutral-900 border border-neutral-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            Channel Settings
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
            <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Name</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 text-sm bg-neutral-950 border border-neutral-800 focus:border-neutral-500 focus:outline-none text-white"
                    disabled={isConfirmingDelete}
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Vertical (Group)</label>
                
                {!isNewVerticalMode ? (
                    <div className="flex gap-2">
                         <select 
                            value={vertical} 
                            onChange={(e) => {
                                if (e.target.value === '__NEW__') {
                                    setIsNewVerticalMode(true);
                                } else {
                                    setVertical(e.target.value);
                                }
                            }}
                            className="w-full p-2 text-sm bg-neutral-950 border border-neutral-800 focus:border-neutral-500 focus:outline-none text-white"
                            disabled={isConfirmingDelete}
                        >
                            <option value="General">General (None)</option>
                            {existingVerticals.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                            <option value="__NEW__">[+ New Vertical]</option>
                        </select>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            autoFocus
                            placeholder="New Vertical Name"
                            value={newVertical}
                            onChange={(e) => setNewVertical(e.target.value)}
                            className="w-full p-2 text-sm bg-neutral-950 border border-neutral-800 focus:border-neutral-500 focus:outline-none text-white"
                            disabled={isConfirmingDelete}
                        />
                        <button 
                            type="button"
                            onClick={() => setIsNewVerticalMode(false)}
                            className="text-xs underline text-neutral-500 hover:text-white"
                            disabled={isConfirmingDelete}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800">
          {isConfirmingDelete ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-2 border border-red-900/30">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold uppercase">Are you sure?</span>
                </div>
                <p className="text-xs text-neutral-500">
                    This will delete the channel <strong>"{channel.title}"</strong> and all blocks inside it. This cannot be undone.
                </p>
                <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="flex-1 py-2 text-xs font-bold uppercase bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleConfirmDelete}
                      className="flex-1 py-2 text-xs font-bold uppercase bg-red-700 text-white hover:bg-red-600 transition-colors"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
                <button 
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text-red-500 hover:text-red-400 flex items-center gap-2 text-xs font-bold uppercase"
                >
                    <Trash2 size={14} /> Delete
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!title.trim()}
                    className="bg-white text-black px-6 py-2 text-xs font-bold uppercase hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <Save size={14} /> Save
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;