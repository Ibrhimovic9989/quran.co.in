// Quran Tabs Component
// Tab navigation for Surah/Juz/Revelation Order views
// Follows Atomic Design - Molecule component

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export type QuranViewType = 'surah' | 'juz' | 'revelation';

interface QuranTabsProps {
  activeView: QuranViewType;
  onViewChange: (view: QuranViewType) => void;
  className?: string;
}

const tabs: { id: QuranViewType; label: string }[] = [
  { id: 'surah', label: 'Surah' },
  { id: 'juz', label: 'Juz' },
  { id: 'revelation', label: 'Revelation Order' },
];

export function QuranTabs({ activeView, onViewChange, className }: QuranTabsProps) {
  return (
    <div className={cn('flex items-center gap-0.5 md:gap-1 border-b border-gray-200/60 mb-4 md:mb-8', className)}>
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              'px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition-all duration-300 ease-in-out relative',
              'hover:text-gray-900 rounded-t-lg',
              isActive
                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50/50'
                : 'text-gray-600 border-b-2 border-transparent hover:bg-gray-50/30'
            )}
            aria-selected={isActive}
            role="tab"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
