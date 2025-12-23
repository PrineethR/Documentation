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
      className="group relative break-inside-avoid mb-6 bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col gap-3"
    >
      {/* Header / Meta */}
      <div className="flex justify-between items-start text-xs text-gray-400 font-mono uppercase tracking-wider mb-1">
        <span className="flex items-center gap-1">
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
          <h3 className="font-medium text-gray-900 text-lg leading-tight mb-2">
            {block.title}
          </h3>
        )}

        {isImage && (
          <div className="rounded overflow-hidden mb-3 border border-gray-100">
            <img 
              src={block.content} 
              alt={block.title || "Stash image"} 
              className="w-full h-auto object-cover max-h-64"
              loading="lazy"
            />
          </div>
        )}

        {isLink ? (
           <a 
             href={block.content} 
             target="_blank" 
             rel="noreferrer"
             className="text-sm text-blue-600 hover:underline break-words line-clamp-3 block"
             onClick={(e) => e.stopPropagation()}
           >
             {block.content}
           </a>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif line-clamp-6">
            {block.content}
          </p>
        )}
        
        {block.description && (
            <p className="mt-3 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">
                {block.description}
            </p>
        )}
      </div>

      {/* Tags */}
      {block.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {block.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-100 font-mono group-hover:bg-gray-100 transition-colors">
              <Hash size={8} className="inline mr-0.5" />{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockCard;