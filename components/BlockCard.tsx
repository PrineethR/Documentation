import React from 'react';
import { Block } from '../types';
import { ExternalLink, Hash, Type as TypeIcon, Image as ImageIcon } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick: (block: Block) => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, onClick }) => {
  const isLink = block.type === 'link';
  const isImage = block.type === 'image';
  const isText = block.type === 'text';

  const formattedDate = new Date(block.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div 
      onClick={() => onClick(block)}
      className="group relative break-inside-avoid mb-8 bg-neutral-900 border border-neutral-800 p-8 hover:border-neutral-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-none flex flex-col gap-4"
    >
      {/* Header / Meta */}
      <div className="flex justify-between items-start text-[11px] text-neutral-500 font-mono uppercase tracking-wider mb-1">
        <span className="flex items-center gap-2">
          {isLink && <ExternalLink size={12} />}
          {isText && <TypeIcon size={12} />}
          {isImage && <ImageIcon size={12} />}
          {block.type}
        </span>
        <span>{formattedDate}</span>
      </div>

      {/* Content */}
      <div className="flex-grow">
        {block.title && (
          <h3 className="font-bold text-white text-xl leading-tight mb-3 font-mono">
            {block.title}
          </h3>
        )}

        {isImage && (
          <div className="overflow-hidden mb-4 border border-neutral-800 bg-black/50">
            <img 
              src={block.content} 
              alt={block.title || "Stash image"} 
              className="w-full h-auto object-contain max-h-[500px]"
              loading="lazy"
            />
          </div>
        )}

        {isLink ? (
           <a 
             href={block.content} 
             target="_blank" 
             rel="noreferrer"
             className="text-base text-blue-400 hover:text-blue-300 break-words line-clamp-4 block font-mono underline decoration-1 underline-offset-2"
             onClick={(e) => e.stopPropagation()}
           >
             {block.content}
           </a>
        ) : (
          <p className="text-base text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans line-clamp-[8]">
            {block.content}
          </p>
        )}
        
        {block.description && (
            <p className="mt-4 text-sm text-neutral-500 italic border-l-2 border-neutral-700 pl-3 font-serif">
                {block.description}
            </p>
        )}
      </div>

      {/* Tags */}
      {block.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {block.tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono hover:border-neutral-500 hover:text-white transition-colors">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockCard;