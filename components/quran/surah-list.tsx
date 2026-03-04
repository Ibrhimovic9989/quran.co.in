// Surah List Component
// Displays a list of surahs with lazy loading

'use client';

import { useState, useEffect, useMemo } from 'react';
import { SurahCard } from './surah-card';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import type { SurahInfo } from '@/types/quran-api';

interface SurahListProps {
  surahs: (SurahInfo & { surahNo: number })[];
}

const ITEMS_PER_PAGE = 30;
const INITIAL_LOAD = 30;

export function SurahList({ surahs }: SurahListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize visible surahs for performance
  const visibleSurahs = useMemo(() => {
    return surahs.slice(0, visibleCount);
  }, [surahs, visibleCount]);

  const hasMore = visibleCount < surahs.length;

  // Load more items
  const loadMore = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate smooth loading
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, surahs.length));
      setIsLoading(false);
    }, 100);
  };

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
      <div className="py-8">
        <Heading level={1} className="mb-8">
          The Holy Quran
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSurahs.map((surah) => (
            <SurahCard key={surah.surahNo} surah={surah} />
          ))}
        </div>
        
        {/* Load More Sentinel */}
        {hasMore && (
          <div id="load-more-sentinel" className="h-10 my-4">
            {isLoading && (
              <div className="text-center">
                <Text className="text-gray-400">Loading more surahs...</Text>
              </div>
            )}
          </div>
        )}

        {/* Load More Button (fallback) */}
        {hasMore && !isLoading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Load More ({surahs.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {!hasMore && (
          <div className="text-center mt-6">
            <Text className="text-gray-400">
              All {surahs.length} surahs loaded
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
}
