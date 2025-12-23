import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Link as LinkIcon, Type, Image as ImageIcon } from 'lucide-react';
import { BlockType } from '../types';
import { analyzeContent } from '../services/geminiService';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: string, type: BlockType, aiData?: { title: string, summary: string, tags: string[] }) => void;
  activeChannelName: string;
  initialData?: { content: string, type: BlockType } | null;
}

const AddBlockModal: React.FC<AddBlockModalProps> = ({ isOpen, onClose, onAdd, activeChannelName, initialData }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<BlockType>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<{title: string, summary: string, tags: string[]} | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContent(initialData.content);
        setType(initialData.type);
        // If image, we could maybe auto-analyze if we had visual recognition, but current service is text based
      } else {
        setContent('');
        setType('text');
      }
      setPreview(null);
      setIsAnalyzing(false);
    }
  }, [isOpen, initialData]);

  // Auto-detect URL (only if not explicit image paste)
  useEffect(() => {
    if (type === 'image' && content.startsWith('data:')) return; // Don't override if it's a data URI

    if (content.match(/^https?:\/\//)) {
        if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            setType('image');
        } else {
            setType('link');
        }
    }
  }, [content, type]);

  const handleAnalyze = async () => {
    if (!content.trim() || type === 'image') return; // Cannot analyze images with current text-only backend
    setIsAnalyzing(true);
    try {
      const result = await analyzeContent(content, type);
      setPreview(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd(content, type, preview || undefined);
    onClose();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      // Allow pasting images directly into the modal even if it was opened empty
      if (e.clipboardData.items) {
          for (const item of e.clipboardData.items) {
              if (item.type.indexOf('image') !== -1) {
                  e.preventDefault();
                  const blob = item.getAsFile();
                  if (blob) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setContent(base64);
                          setType('image');
                      };
                      reader.readAsDataURL(blob);
                  }
                  return;
              }
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-neutral-900 border border-neutral-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            Add to <span className="text-white">{activeChannelName}</span>
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4" onPaste={handlePaste}>
          
          <div className="flex gap-4 text-xs font-bold uppercase mb-2">
            <button 
                onClick={() => setType('text')}
                className={`flex items-center gap-2 px-3 py-1.5 border transition-colors ${type === 'text' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
            >
                <Type size={12} /> Text
            </button>
            <button 
                onClick={() => setType('link')}
                className={`flex items-center gap-2 px-3 py-1.5 border transition-colors ${type === 'link' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
            >
                <LinkIcon size={12} /> Link
            </button>
             <button 
                onClick={() => setType('image')}
                className={`flex items-center gap-2 px-3 py-1.5 border transition-colors ${type === 'image' ? 'bg-white text-black border-white' : 'text-neutral-500 border-transparent hover:bg-neutral-800'}`}
            >
                <ImageIcon size={12} /> Image
            </button>
          </div>

          {type === 'image' && content.startsWith('data:') ? (
              <div className="w-full h-48 bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden relative group">
                  <img src={content} alt="Preview" className="h-full w-auto object-contain" />
                  <button 
                    onClick={() => setContent('')} 
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center uppercase font-bold text-xs"
                  >
                      Remove / Paste New
                  </button>
              </div>
          ) : (
            <textarea
                autoFocus
                className="w-full min-h-[120px] p-4 text-sm bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-500 resize-none font-mono text-white placeholder:text-neutral-700"
                placeholder={type === 'link' || type === 'image' ? "Paste URL or Image (Ctrl+V) here..." : "Type something..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
          )}

          {/* AI Preview Section */}
          {preview && (
            <div className="bg-neutral-800 p-4 border border-neutral-700 text-sm">
                <div className="font-bold text-white mb-1">{preview.title}</div>
                <div className="text-neutral-400 mb-2 font-serif text-xs">{preview.summary}</div>
                <div className="flex flex-wrap gap-1">
                    {preview.tags.map(t => (
                        <span key={t} className="text-[10px] text-neutral-400 border border-neutral-700 px-1 py-0.5 bg-neutral-900 uppercase">#{t}</span>
                    ))}
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex justify-between items-center">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim() || type === 'image'}
            className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500 hover:text-purple-400 disabled:opacity-30 transition-colors disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
            {isAnalyzing ? 'Analyzing...' : 'Auto-tag'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            className="bg-white text-black px-6 py-2 text-xs font-bold uppercase hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockModal;