// Quran Page Client Component
// Handles tab switching between Surah/Juz/Revelation Order views
// Follows Atomic Design - Organism component

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuranTabs, type QuranViewType } from './quran-tabs';
import { QuranSearch } from './quran-search';
import { SurahList } from './surah-list';
import { JuzView } from './juz-view';
import { RevelationOrderView } from './revelation-order-view';
import { ContinueReading } from './continue-reading';
import { BookmarksProvider } from './bookmarks-provider';
import { SemanticSearchPanel } from './semantic-search-panel';
import type { SurahInfo } from '@/types/quran-api';

interface QuranPageClientProps {
  surahs: (SurahInfo & { surahNo: number })[];
}

export function QuranPageClient({ surahs }: QuranPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as QuranViewType | null;
  
  // Initialize from URL param, default to 'surah'
  const [activeView, setActiveView] = useState<QuranViewType>(
    tabParam && ['surah', 'juz', 'revelation'].includes(tabParam) 
      ? tabParam 
      : 'surah'
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sync URL when tab changes
  const handleViewChange = (view: QuranViewType) => {
    setActiveView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', view);
    router.push(`/quran?${params.toString()}`, { scroll: false });
    // Clear search when switching tabs
    setSearchQuery('');
  };

  // Update state when URL param changes (e.g., browser back/forward)
  useEffect(() => {
    const tab = searchParams.get('tab') as QuranViewType | null;
    if (tab && ['surah', 'juz', 'revelation'].includes(tab)) {
      setActiveView(tab);
      // Clear search when tab changes via URL
      setSearchQuery('');
    }
  }, [searchParams]);

  return (
    <BookmarksProvider>
      <div className="min-h-screen bg-paper">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Read Quran</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Choose a chapter to begin.</p>
          {/* Continue Reading */}
          <ContinueReading />

          {/* Tab Navigation */}
          <QuranTabs activeView={activeView} onViewChange={handleViewChange} />

          {/* Search Bar */}
          <QuranSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeView={activeView}
          />

          {/* Semantic search — shows automatically for topic/phrase queries */}
          <SemanticSearchPanel query={searchQuery} className="mb-4 md:mb-6" />

          {/* View Content */}
          {activeView === 'surah' && <SurahList surahs={surahs} searchQuery={searchQuery} />}
          {activeView === 'juz' && <JuzView surahs={surahs} searchQuery={searchQuery} />}
          {activeView === 'revelation' && <RevelationOrderView surahs={surahs} searchQuery={searchQuery} />}
        </div>
      </div>
    </BookmarksProvider>
  );
}
