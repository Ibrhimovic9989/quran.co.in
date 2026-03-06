// Surah Display Component
// Displays a complete surah with lazy-loaded ayahs, audio, translations, and tafsir
// NETFLIX-STYLE: Only loads first 20 ayahs initially, loads more on demand

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Text } from '@/components/ui/typography';
import { Spinner, Button } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';
import { getRevelationOrder, getSurahsByRevelationOrder } from '@/lib/data/revelation-order';
import { BookmarksProvider } from './bookmarks-provider';
import { SurahHeader } from './surah-header';
import { SurahNavigation } from './surah-navigation';
import { SurahPlaybackProvider } from './surah-playback-provider';
import { SurahReadingView } from './surah-reading-view';
import { SurahVerseListView } from './surah-verse-list-view';
import type { SurahDisplayMode } from './surah-view-mode-toggle';
import type { SurahResponse, TafsirResponse } from '@/types/quran-api';

interface SurahDisplayProps {
  surah: SurahResponse;
  tafsirs?: Map<string, TafsirResponse>; // Map of "surahNo_ayahNo" to tafsir
}

const AYAHS_PER_BATCH = 20;
const INITIAL_AYAHS = 20; // Load first 20 ayahs immediately

interface LoadedAyahs {
  english: string[];
  arabic1: string[];
  arabic2: string[];
  bengali: string[];
  urdu: string[];
  turkish: string[];
  uzbek: string[];
}

export function SurahDisplay({ surah, tafsirs }: SurahDisplayProps) {
  const searchParams = useSearchParams();
  const targetAyah = searchParams.get('ayah');
  const [displayMode, setDisplayMode] = useState<SurahDisplayMode>(
    searchParams.get('mode') === 'reading' ? 'reading' : 'verse'
  );
  
  // Calculate next/previous surah numbers
  const nextSurahNo = surah.surahNo < 114 ? surah.surahNo + 1 : null;
  const prevSurahNo = surah.surahNo > 1 ? surah.surahNo - 1 : null;
  
  // Calculate next/previous surah by revelation order
  const revelationOrder = getRevelationOrder(surah.surahNo);
  const revelationOrderList = getSurahsByRevelationOrder();
  const currentRevelationIndex = revelationOrder 
    ? revelationOrderList.findIndex(e => e.revelationOrder === revelationOrder)
    : -1;
  const nextRevelationSurah = currentRevelationIndex >= 0 && currentRevelationIndex < revelationOrderList.length - 1
    ? revelationOrderList[currentRevelationIndex + 1].surahNumber
    : null;
  const prevRevelationSurah = currentRevelationIndex > 0
    ? revelationOrderList[currentRevelationIndex - 1].surahNumber
    : null;
  
  // NETFLIX-STYLE: Start with initial ayahs from server (first 20)
  const [loadedAyahs, setLoadedAyahs] = useState<LoadedAyahs>({
    english: surah.english || [],
    arabic1: surah.arabic1 || [],
    arabic2: surah.arabic2 || [],
    bengali: surah.bengali || [],
    urdu: surah.urdu || [],
    turkish: surah.turkish || [],
    uzbek: surah.uzbek || [],
  });
  
  const [visibleAyahs, setVisibleAyahs] = useState(Math.min(INITIAL_AYAHS, surah.totalAyah, surah.english.length));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const hasMore = loadedAyahs.english.length < surah.totalAyah || visibleAyahs < surah.totalAyah;
  const totalAyahs = surah.totalAyah;

  const surahBaseData = useMemo(
    () => ({
      surahName: surah.surahName,
      surahNameArabic: surah.surahNameArabic,
      surahNameArabicLong: surah.surahNameArabicLong,
      surahNameTranslation: surah.surahNameTranslation,
      revelationPlace: surah.revelationPlace,
      totalAyah: surah.totalAyah,
      audio: surah.audio,
    }),
    [surah]
  );

  // NETFLIX-STYLE: Load more ayahs on-demand from API
  const loadMoreAyahs = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    try {
      // Fetch next batch of ayahs from API
      const response = await fetch(
        `/api/quran/surah/${surah.surahNo}/ayahs?offset=${loadedAyahs.english.length}&limit=${AYAHS_PER_BATCH}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.ayahs && data.ayahs.length > 0) {
          // Merge new ayahs with existing
          const newEnglish = data.ayahs.map((a: any) => a.translationText || '');
          const newArabic1 = data.ayahs.map((a: any) => a.arabicText);
          const newArabic2 = data.ayahs.map((a: any) => a.transliteration || a.arabicText);
          const newBengali = data.ayahs.map((a: any) => (a.metadata as any)?.bengali).filter(Boolean);
          const newUrdu = data.ayahs.map((a: any) => (a.metadata as any)?.urdu).filter(Boolean);
          const newTurkish = data.ayahs.map((a: any) => (a.metadata as any)?.turkish).filter(Boolean);
          const newUzbek = data.ayahs.map((a: any) => (a.metadata as any)?.uzbek).filter(Boolean);
          
          // Update loaded ayahs
          setLoadedAyahs((prev) => ({
            english: [...prev.english, ...newEnglish],
            arabic1: [...prev.arabic1, ...newArabic1],
            arabic2: [...prev.arabic2, ...newArabic2],
            bengali: [...prev.bengali, ...newBengali],
            urdu: [...prev.urdu, ...newUrdu],
            turkish: [...prev.turkish, ...newTurkish],
            uzbek: [...prev.uzbek, ...newUzbek],
          }));
          
          // Show more ayahs
          setVisibleAyahs((prev) => Math.min(prev + AYAHS_PER_BATCH, totalAyahs));
        }
      }
    } catch (error) {
      console.error('Error loading more ayahs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, surah.surahNo, loadedAyahs.english.length, totalAyahs]);

  // NETFLIX-STYLE: Infinite scroll - auto-load when near bottom
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreAyahs();
        }
      },
      { 
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '200px' // Start loading 200px before reaching the end
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMoreAyahs]);

  // Scroll to target ayah when page loads or ayah becomes visible
  useEffect(() => {
    if (!targetAyah || hasScrolledRef.current) return;
    
    const ayahNumber = parseInt(targetAyah, 10);
    if (isNaN(ayahNumber) || ayahNumber < 1 || ayahNumber > surah.totalAyah) return;

    // If ayah is not yet visible, expand visible ayahs to include it
    if (ayahNumber > visibleAyahs) {
      // If we have the data loaded, just expand visible ayahs
      if (ayahNumber <= loadedAyahs.english.length) {
        setVisibleAyahs(ayahNumber);
        return;
      }
      // Otherwise, we need to load more data first
      // This will trigger the effect again once data is loaded
      if (hasMore && !isLoading) {
        loadMoreAyahs();
      }
      return;
    }

    // Scroll to the ayah - use a small delay to ensure DOM is ready
    const scrollTimer = setTimeout(() => {
      const element = document.getElementById(`ayah-${surah.surahNo}-${ayahNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hasScrolledRef.current = true;
        // Clean up URL parameter after scrolling
        const url = new URL(window.location.href);
        url.searchParams.delete('ayah');
        window.history.replaceState({}, '', url.toString());
      }
    }, 300);

    return () => clearTimeout(scrollTimer);
  }, [targetAyah, visibleAyahs, surah.surahNo, surah.totalAyah, hasMore, isLoading, loadMoreAyahs, loadedAyahs.english.length]);

  const handleModeChange = useCallback(
    (mode: SurahDisplayMode) => {
      setDisplayMode(mode);

      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      if (mode === 'reading') {
        params.set('mode', 'reading');
      } else {
        params.delete('mode');
      }

      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    },
    []
  );

  useEffect(() => {
    const nextMode = searchParams.get('mode') === 'reading' ? 'reading' : 'verse';
    setDisplayMode((currentMode) => (currentMode === nextMode ? currentMode : nextMode));
  }, [searchParams]);

  return (
    <BookmarksProvider>
      <SurahPlaybackProvider surahNo={surah.surahNo} totalAyahs={surah.totalAyah}>
        <Container>
          <div className="py-6 md:py-20">
            <SurahHeader
              surah={surah}
              mode={displayMode}
              onModeChange={handleModeChange}
              selectedReciter={selectedReciter}
              onReciterChange={setSelectedReciter}
            />

            {displayMode === 'reading' ? (
              <SurahReadingView
                surahNumber={surah.surahNo}
                loadedAyahs={{
                  english: loadedAyahs.english,
                  arabic1: loadedAyahs.arabic1,
                }}
                visibleAyahs={visibleAyahs}
                audioData={surah.audio}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
              />
            ) : (
              <SurahVerseListView
                surahNumber={surah.surahNo}
                surahBaseData={surahBaseData}
                loadedAyahs={loadedAyahs}
                visibleAyahs={visibleAyahs}
                tafsirs={tafsirs}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
              />
            )}

        {/* Infinite Scroll Sentinel - triggers load when visible - Mobile optimized */}
        {/* Gestalt: Loading indicator grouped (Proximity) */}
        {hasMore && (
          <div ref={sentinelRef} className="mt-6 md:mt-12 py-4 md:py-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                <Spinner size="md" />
                <LoadingMessage showIcon={false} className="max-w-xl" />
              </div>
            )}
          </div>
        )}

        {!hasMore && totalAyahs > INITIAL_AYAHS && (
          <div className="mt-4 md:mt-8 text-center">
            <Text className="text-gray-600 text-xs md:text-base">
              All {totalAyahs} ayahs loaded
            </Text>
          </div>
        )}

            <SurahNavigation
              prevSurahNo={prevSurahNo}
              nextSurahNo={nextSurahNo}
              prevRevelationSurah={prevRevelationSurah}
              nextRevelationSurah={nextRevelationSurah}
            />
          </div>
        </Container>
      </SurahPlaybackProvider>
    </BookmarksProvider>
  );
}
