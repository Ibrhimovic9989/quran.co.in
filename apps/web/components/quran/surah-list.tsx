// Surah List Component
// Displays a list of surahs with lazy loading

'use client';

import { useState, useEffect, useMemo } from 'react';
import { SurahCard } from './surah-card';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Button, Spinner } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';
import { RevelationLegendModal } from '@/components/ui/revelation-legend-modal';
import type { SurahInfo } from '@/types/quran-api';

interface SurahListProps {
  surahs: (SurahInfo & { surahNo: number })[];
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 30;
const INITIAL_LOAD = 30;

// Normalize search text for Latin-based queries (English/transliteration)
// - Lowercase
// - Strip accents/diacritics
// - Remove non-alphanumeric characters (spaces, hyphens, etc.)
const normalizeSearchText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export function SurahList({ surahs, searchQuery = '' }: SurahListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoading, setIsLoading] = useState(false);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return surahs;

    const normalizedQuery = normalizeSearchText(rawQuery);

    return surahs.filter((surah) => {
      // Search by surah number
      if (surah.surahNo.toString().includes(normalizedQuery)) return true;

      // Search by surah name (Latin / transliteration-like) e.g. "Al-Mujadila"
      if (normalizeSearchText(surah.surahName ?? '').includes(normalizedQuery)) {
        return true;
      }

      // Search by surah name (English translation)
      if (
        normalizeSearchText(surah.surahNameTranslation ?? '').includes(
          normalizedQuery
        )
      ) {
        return true;
      }

      // Search by surah name (Arabic) - use raw query so Arabic input works
      if (surah.surahNameArabic?.includes(rawQuery)) return true;

      return false;
    });
  }, [surahs, searchQuery]);

  // Memoize visible surahs for performance
  const visibleSurahs = useMemo(() => {
    return filteredSurahs.slice(0, visibleCount);
  }, [filteredSurahs, visibleCount]);

  const hasMore = visibleCount < filteredSurahs.length;

  // Load more items
  const loadMore = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate smooth loading
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredSurahs.length));
      setIsLoading(false);
    }, 100);
  };

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [searchQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const sentinel = document.getElementById('load-more-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <Container>
      <div className="py-6 md:py-20">
        {/* Header — Arabic first, quiet meta */}
        <div className="mb-6 md:mb-12 text-center">
          <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-[1.7] text-ink md:text-6xl">
            القرآن الكريم
          </p>
          <Heading
            level={1}
            className="mt-2 font-reading text-lg font-medium text-ink-soft md:mt-3 md:text-2xl"
          >
            The Noble Quran
          </Heading>
          <Text className="mt-1 text-xs text-ink-muted md:text-sm">
            {searchQuery
              ? `${filteredSurahs.length} of ${surahs.length} sūrahs`
              : `114 sūrahs · 6,236 āyāt`}
          </Text>
          <div className="ayah-divider mx-auto mt-5 max-w-xs md:mt-7" />
          <div className="mt-3 flex justify-center">
            <RevelationLegendModal />
          </div>
        </div>

        {/* Surahs Grid - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {visibleSurahs.map((surah) => (
            <SurahCard key={surah.surahNo} surah={surah} />
          ))}
        </div>
        
        {/* Load More Sentinel */}
        {/* Gestalt: Loading indicator grouped (Proximity) */}
        {hasMore && (
          <div id="load-more-sentinel" className="my-4 md:my-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 md:gap-4 py-4 md:py-8">
                <Spinner size="md" />
                <LoadingMessage showIcon={false} className="max-w-xl" />
              </div>
            )}
          </div>
        )}

        {/* Load More Button (fallback) - Using Button atom */}
        {hasMore && !isLoading && (
          <div className="text-center mt-4 md:mt-6">
            <Button
              onClick={loadMore}
              variant="secondary"
              className="text-xs md:text-sm px-4 py-2 md:px-6 md:py-3"
            >
              Load More ({filteredSurahs.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        {!hasMore && filteredSurahs.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
            <Heading level={3} className="text-lg font-bold text-gray-900 mb-2">
              No results for &ldquo;{searchQuery}&rdquo;
            </Heading>
            <Text className="text-gray-500 text-sm max-w-xs">
              Try searching by surah name, number, or meaning — in English or Arabic.
            </Text>
          </div>
        )}

        {!hasMore && filteredSurahs.length > 0 && (
          <div className="text-center mt-4 md:mt-6">
            <Text className="text-gray-600 text-xs md:text-base">
              {searchQuery
                ? `All ${filteredSurahs.length} matching surahs shown`
                : `All ${surahs.length} surahs loaded`
              }
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
}
