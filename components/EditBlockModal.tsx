import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Trash2, Link as LinkIcon, Type, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Block, BlockType, Channel } from '../types';
import { analyzeContent } from '../services/geminiService';

interface EditBlockModalProps {
  block: Block | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (blockId: string, updates: Partial<Block>) => void;
  onDelete: (blockId: string) => void;
  channels: Channel[];
}

const EditBlockModal: React.FC<EditBlockModalProps> = ({ 
  block, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  channels 
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<BlockType>('text');
  const [channelId, setChannelId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (block && isOpen) {
      setContent(block.content);
      setTitle(block.title || '');
      setDescription(block.description || '');
      setTags(block.tags.join(', '));
      setType(block.type);
      setChannelId(block.channelId);
      setIsConfirmingDelete(false);
    }
  }, [block, isOpen]);

  useEffect(() => {
    if (!block) return;
    if (content !== block.content && content.match(/^https?:\/\//)) {
         if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            setType('image');
        } else {
            setType('link');
        }
    }
  }, [content, block]);

  const handleAnalyze = async () => {
    if (!content.trim() || type === 'image') return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeContent(content, type);
      setTitle(result.title);
      setDescription(result.summary);
      setTags(result.tags.join(', '));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!block) return;
    
    onUpdate(block.id, {
      content,
      title,
      description,
      type,
      channelId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!block) return;
    onDelete(block.id);
    onClose();
  };

  if (!isOpen || !block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono" onClick={onClose}>
      <div 
        className="bg-neutral-900 border border-neutral-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-shrink-0">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
            Edit Block
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Controls: Type & Channel */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <button 
                    onClick={() => setType('text')}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase transition-colors ${type === 'text' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                >
                    <Type size={12} /> Text
                </button>
                <button 
                    onClick={() => setType('link')}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase transition-colors ${type === 'link' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                >
                    <LinkIcon size={12} /> Link
                </button>
                <button 
                    onClick={() => setType('image')}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase transition-colors ${type === 'image' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                >
                    <ImageIcon size={12} /> Image
                </button>
              </div>

              <select 
                value={channelId} 
                onChange={(e) => setChannelId(e.target.value)}
                className="text-xs border border-neutral-700 px-2 py-1.5 focus:border-white outline-none bg-neutral-800 text-white max-w-[150px] font-mono"
              >
                  {channels.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
              </select>
          </div>

          {/* Content */}
          <div className="space-y-1">
             <label className="text-xs font-bold text-neutral-500 uppercase">Content</label>
             <textarea
                className="w-full min-h-[100px] p-3 text-sm bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-500 resize-y font-mono text-white"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
          </div>

           {/* Meta */}
           <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-neutral-500 uppercase">Metadata</label>
                 <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !content.trim() || type === 'image'}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors bg-purple-900/20 px-2 py-1 uppercase"
                >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={10} /> : <Sparkles size={10} />}
                    {isAnalyzing ? 'Thinking...' : 'AI Re-Analyze'}
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 text-sm font-bold bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-500 text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <textarea
                placeholder="Description / Summary"
                className="w-full p-2 text-sm bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-500 resize-none h-20 font-serif text-neutral-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full p-2 text-xs bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-500 font-mono text-neutral-400"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex-shrink-0">
          {isConfirmingDelete ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-2 border border-red-900/30">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold uppercase">Are you sure?</span>
                </div>
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
                        Yes, Delete Block
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
                <button 
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-red-500 hover:text-red-400 px-3 py-2 transition-colors"
                >
                    <Trash2 size={14} /> Delete
                </button>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white text-xs font-bold uppercase px-3 py-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!content.trim() || isAnalyzing}
                        className="bg-white text-black px-6 py-2 text-xs font-bold uppercase hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBlockModal;