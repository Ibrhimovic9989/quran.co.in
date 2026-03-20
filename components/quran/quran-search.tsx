// Quran Search Component
// Search bar for filtering surahs across different views
// Follows Atomic Design - Molecule component

'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { QuranViewType } from './quran-tabs';

interface QuranSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: QuranViewType;
  className?: string;
}

export function QuranSearch({ 
  searchQuery, 
  onSearchChange, 
  activeView,
  className 
}: QuranSearchProps) {
  const placeholderText = {
    surah: 'Search surah name, number, or a topic like "patience"…',
    juz: 'Search by Juz number or surah name…',
    revelation: 'Search by surah name or revelation order…',
  };

  return (
    <div className={cn('relative mb-4 md:mb-6', className)}>
      <div className="relative">
        <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholderText[activeView]}
          className={cn(
            'w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 text-xs md:text-base',
            'border border-gray-300 rounded-lg md:rounded-lg',
            'bg-white text-gray-900',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-gray-900/50 focus:border-transparent',
            'transition-all duration-300 ease-in-out'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-300"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
