
import React from 'react';
import { Memory } from '../types';
import { Heart, Trash2, CheckCircle } from 'lucide-react';

interface MemoryWallProps {
  memories: Memory[];
  isEditing?: boolean;
  onUpdateMemory?: (id: string, updates: Partial<Memory>) => void;
  onDeleteMemory?: (id: string) => void;
  onSelectMemory?: (url: string) => void;
  selectedUrl?: string;
}

const MemoryWall: React.FC<MemoryWallProps> = ({ memories, isEditing, onUpdateMemory, onDeleteMemory, onSelectMemory, selectedUrl }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 max-w-6xl mx-auto">
      {memories.map((memory, index) => (
        <div 
          key={memory.id} 
          data-photo-url={memory.url}
          onClick={() => !isEditing && onSelectMemory?.(memory.url)}
          className={`relative group bg-white p-3 shadow-xl rounded-sm transform transition-all duration-500 cursor-pointer ${!isEditing && selectedUrl === memory.url ? 'ring-4 ring-rose-500 scale-105 z-10 rotate-0' : `hover:scale-105 hover:rotate-0 rotate-${index % 2 === 0 ? '1' : '-1'}`}`}
        >
          {/* Delete Button */}
          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMemory?.(memory.id);
              }}
              className="absolute -top-3 -left-3 bg-red-500 text-white rounded-full p-2 shadow-lg z-20 hover:bg-red-600 hover:scale-110 transition-all"
              title="Delete Memory"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Selection Indicator */}
          {!isEditing && selectedUrl === memory.url && (
            <div className="absolute -top-3 -left-3 bg-rose-500 text-white rounded-full p-2 shadow-lg z-20 animate-bounce">
              <CheckCircle size={16} />
            </div>
          )}

          <div className="overflow-hidden aspect-square bg-rose-100 relative shadow-inner">
            <img 
              src={memory.url} 
              alt={memory.caption} 
              className={`w-full h-full object-cover transition-all duration-700 ${!isEditing && selectedUrl !== memory.url ? 'grayscale group-hover:grayscale-0' : ''}`}
            />
            {!isEditing && selectedUrl !== memory.url && <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-transparent transition-colors" />}
          </div>
          
          <div className="mt-4 text-center space-y-2 px-2 pb-2">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="text" 
                  value={memory.caption} 
                  placeholder="Caption..."
                  onChange={(e) => onUpdateMemory?.(memory.id, { caption: e.target.value })}
                  className="font-romantic text-2xl text-rose-800 bg-rose-50/80 border-2 border-dashed border-rose-200 rounded-lg w-full text-center focus:outline-none focus:border-rose-400 py-1"
                />
                <input 
                  type="text" 
                  value={memory.date || ''} 
                  placeholder="Date..."
                  onChange={(e) => onUpdateMemory?.(memory.id, { date: e.target.value })}
                  className="text-xs text-rose-400 uppercase tracking-widest bg-rose-50/80 border-2 border-dashed border-rose-200 rounded-lg w-full text-center focus:outline-none focus:border-rose-400 py-1"
                />
              </div>
            ) : (
              <>
                <p className="font-romantic text-2xl text-rose-800 line-clamp-2">{memory.caption}</p>
                {memory.date && <p className="text-xs text-rose-400 uppercase tracking-widest mt-1">{memory.date}</p>}
              </>
            )}
          </div>

          <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-md text-rose-500 scale-0 group-hover:scale-100 transition-transform">
             <Heart size={16} fill="currentColor" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryWall;
