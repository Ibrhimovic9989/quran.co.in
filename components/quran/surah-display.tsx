// Surah Display Component
// Displays a complete surah with lazy-loaded ayahs, audio, translations, and tafsir
// NETFLIX-STYLE: Only loads first 20 ayahs initially, loads more on demand

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';
import { ReciterSelector } from '@/components/ui/molecules';
import { AyahDisplay } from './ayah-display';
import { AudioPlayer } from './audio-player';
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
  
  const [visibleAyahs, setVisibleAyahs] = useState(INITIAL_AYAHS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Get available reciters from surah audio
  const availableReciters = surah.audio
    ? Object.entries(surah.audio).map(([id, data]) => ({
        id,
        ...data,
      }))
    : [];

  // Memoize visible ayahs for performance
  const visibleAyahsList = useMemo(() => {
    return loadedAyahs.english.slice(0, visibleAyahs);
  }, [loadedAyahs.english, visibleAyahs]);

  const hasMore = loadedAyahs.english.length < surah.totalAyah || visibleAyahs < surah.totalAyah;
  const totalAyahs = surah.totalAyah;

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

  return (
    <Container>
      <div className="py-6 md:py-20">
        {/* Enhanced Header Section - Mobile optimized */}
        <div className="mb-6 md:mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-3 md:mb-6">
            <span className="text-gray-800 text-xs md:text-base font-bold bg-white/80 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md shadow-sm">
              {surah.surahNo}
            </span>
            <Heading 
              level={1} 
              className="text-2xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              {surah.surahNameTranslation}
            </Heading>
          </div>
          <Text className="text-xl md:text-5xl lg:text-6xl text-center md:text-right mb-3 md:mb-6 font-arabic text-gray-900 font-semibold leading-tight md:leading-relaxed">
            {surah.surahNameArabicLong}
          </Text>
          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-lg text-gray-700 mb-3 md:mb-6 font-medium">
            <span>{surah.totalAyah} Ayahs</span>
            <span className="text-gray-400">•</span>
            <span>{surah.revelationPlace}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 mb-4 md:mb-8">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-900 rounded-full"></div>
            <span>Authentic • Complete • Free Access</span>
          </div>

          {/* Surah-Level Reciter Selection and Play Button - Mobile optimized */}
          {/* Gestalt: Grouped together (Proximity & Common Region) */}
          {surah.audio && Object.keys(surah.audio).length > 0 && (
            <div className="mb-6 md:mb-10 space-y-3 md:space-y-4 bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 md:p-6 rounded-lg border border-gray-200 shadow-sm">
              <Text className="text-sm md:text-lg text-gray-900 font-semibold">Audio Recitation</Text>
              <ReciterSelector
                audioData={surah.audio}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
                className="max-w-md"
              />
              <AudioPlayer
                audioData={surah.audio}
                surahNo={surah.surahNo}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-8">
          {visibleAyahsList.map((translation, index) => {
            const ayahNo = index + 1;
            const tafsirKey = `${surah.surahNo}_${ayahNo}`;
            const tafsir = tafsirs?.get(tafsirKey);

            return (
              <AyahDisplay
                key={ayahNo}
                ayah={{
                  ...surah,
                  ayahNo,
                  english: translation,
                  arabic1: loadedAyahs.arabic1[index] || '',
                  arabic2: loadedAyahs.arabic2[index] || '',
                  audio: surah.audio,
                  bengali: loadedAyahs.bengali[index],
                  urdu: loadedAyahs.urdu[index],
                  turkish: loadedAyahs.turkish[index],
                  uzbek: loadedAyahs.uzbek[index],
                }}
                tafsir={tafsir}
                showNumber={true}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
              />
            );
          })}
        </div>

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
      </div>
    </Container>
  );
}
