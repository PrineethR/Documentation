import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';

interface VerticalSettingsModalProps {
  verticalName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const VerticalSettingsModal: React.FC<VerticalSettingsModalProps> = ({ 
  verticalName, 
  isOpen, 
  onClose, 
  onRename, 
  onDelete 
}) => {
  const [name, setName] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (verticalName) {
      setName(verticalName);
      setIsConfirmingDelete(false);
    }
  }, [verticalName]);

  const handleSave = () => {
    if (!verticalName || !name.trim()) return;
    if (name.trim() !== verticalName) {
        onRename(verticalName, name.trim());
    }
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!verticalName) return;
    onDelete(verticalName);
    onClose();
  };

  if (!isOpen || !verticalName) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono" onClick={onClose}>
      <div 
        className="bg-neutral-900 border border-neutral-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            Vertical Settings
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
            <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Vertical Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 text-sm bg-neutral-950 border border-neutral-800 focus:border-neutral-500 focus:outline-none text-white"
                    disabled={isConfirmingDelete}
                />
            </div>
            <div className="p-3 bg-neutral-950 text-xs text-neutral-500 border border-neutral-800">
                Renaming will update all channels currently in this vertical.
            </div>
        </div>

        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800">
          {isConfirmingDelete ? (
             <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-2 border border-red-900/30">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold uppercase">Confirm Dissolve?</span>
                </div>
                <p className="text-xs text-neutral-500">
                    This will remove the group <strong>"{verticalName}"</strong>. Channels inside will be moved to "General". <br/><span className="text-neutral-300">No channels or blocks will be deleted.</span>
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
                        Yes, Dissolve
                    </button>
                </div>
             </div>
          ) : (
            <div className="flex justify-between items-center">
                <button 
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text-red-500 hover:text-red-400 flex items-center gap-2 text-xs font-bold uppercase"
                    title="Dissolves the group, moves channels to General"
                >
                    <Trash2 size={14} /> Dissolve
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!name.trim()}
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

export default VerticalSettingsModal;