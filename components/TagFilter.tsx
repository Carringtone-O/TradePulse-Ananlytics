import React from 'react';
import { TagIcon, XCircleIcon } from './icons';

interface TagFilterProps {
  allTags: string[];
  activeTags: string[];
  onTaggleTag: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, activeTags, onTaggleTag }) => {

  const handleTagClick = (tag: string) => {
    const newActiveTags = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    onTaggleTag(newActiveTags);
  };
  
  const clearFilters = () => {
    onTaggleTag([]);
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center text-sm font-semibold text-slate-700 mr-2">
            <TagIcon />
            <span className="ml-1.5">Filter by Tag:</span>
        </div>
        {allTags.map(tag => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white ring-2 ring-offset-2 ring-violet-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
        {activeTags.length > 0 && (
            <button onClick={clearFilters} className="flex items-center text-xs text-slate-500 hover:text-slate-800 ml-2">
                <XCircleIcon className="h-4 w-4 mr-1" />
                Clear Filters
            </button>
        )}
      </div>
    </div>
  );
};

export default TagFilter;