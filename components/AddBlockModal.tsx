import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Link as LinkIcon, Type, Image as ImageIcon } from 'lucide-react';
import { BlockType } from '../types';
import { analyzeContent } from '../services/geminiService';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: string, type: BlockType, aiData?: { title: string, summary: string, tags: string[] }) => void;
  activeChannelName: string;
}

const AddBlockModal: React.FC<AddBlockModalProps> = ({ isOpen, onClose, onAdd, activeChannelName }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<BlockType>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<{title: string, summary: string, tags: string[]} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setPreview(null);
      setType('text');
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  // Auto-detect URL
  useEffect(() => {
    if (content.match(/^https?:\/\//)) {
        if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            setType('image');
        } else {
            setType('link');
        }
    }
  }, [content]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
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
    
    // If user submits without analyzing, just pass basic data, otherwise pass AI data
    onAdd(content, type, preview || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 shadow-2xl rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
            Add to <span className="text-black">{activeChannelName}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div className="flex gap-4 text-sm mb-2">
            <button 
                onClick={() => setType('text')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${type === 'text' ? 'bg-black text-white border-black' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
                <Type size={14} /> Text
            </button>
            <button 
                onClick={() => setType('link')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${type === 'link' ? 'bg-black text-white border-black' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
                <LinkIcon size={14} /> Link
            </button>
             <button 
                onClick={() => setType('image')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${type === 'image' ? 'bg-black text-white border-black' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
            >
                <ImageIcon size={14} /> Image
            </button>
          </div>

          <textarea
            autoFocus
            className="w-full min-h-[120px] p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-none font-serif text-gray-800 placeholder:font-sans placeholder:text-gray-300"
            placeholder={type === 'link' || type === 'image' ? "Paste URL here..." : "Type something..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* AI Preview Section */}
          {preview && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                <div className="font-semibold text-gray-900 mb-1">{preview.title}</div>
                <div className="text-gray-600 mb-2">{preview.summary}</div>
                <div className="flex flex-wrap gap-1">
                    {preview.tags.map(t => (
                        <span key={t} className="text-xs text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim()}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-purple-600 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Analyzing...' : 'Auto-tag & Summarize'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockModal;