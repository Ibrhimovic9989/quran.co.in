// Revelation Order View Component
// Displays surahs in chronological order of revelation
// Follows Atomic Design - Organism component

'use client';

import { useMemo } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { SurahCard } from './surah-card';
import { getSurahsByRevelationOrder } from '@/lib/data/revelation-order';
import type { SurahInfo } from '@/types/quran-api';
import { cn } from '@/lib/utils/cn';

interface RevelationOrderViewProps {
  surahs: (SurahInfo & { surahNo: number })[];
  searchQuery?: string;
}

export function RevelationOrderView({ surahs, searchQuery = '' }: RevelationOrderViewProps) {
  // Create a map of surah number to surah data for quick lookup
  const surahMap = useMemo(() => {
    const map = new Map<number, SurahInfo & { surahNo: number }>();
    surahs.forEach((surah) => {
      map.set(surah.surahNo, surah);
    });
    return map;
  }, [surahs]);

  // Get surahs sorted by revelation order
  const surahsByRevelation = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const revelationOrder = getSurahsByRevelationOrder();
    
    return revelationOrder
      .map((entry) => {
        const surah = surahMap.get(entry.surahNumber);
        if (!surah) return null;
        return {
          ...surah,
          revelationOrder: entry.revelationOrder,
          revelationPlaceDisplay: entry.revelationPlace, // Store for display
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .filter((surah) => {
        if (!query) return true;
        
        // Search by surah name
        if (surah.surahNameTranslation?.toLowerCase().includes(query)) return true;
        if (surah.surahNameArabic?.includes(query)) return true;
        
        // Search by surah number
        if (surah.surahNo.toString().includes(query)) return true;
        
        // Search by revelation order
        if (surah.revelationOrder.toString().includes(query)) return true;
        
        // Search by revelation place
        if (surah.revelationPlaceDisplay?.toLowerCase().includes(query)) return true;
        
        return false;
      });
  }, [surahMap, searchQuery]);

  return (
    <section className={cn('w-full py-6 md:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white')}>
      <Container>
        <div className="max-w-4xl mx-auto text-center mb-6 md:mb-16">
          <Heading level={1} className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-6 leading-tight">
            Revelation Order
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-tight md:leading-relaxed mb-3 md:mb-6">
            {searchQuery 
              ? `Found ${surahsByRevelation.length} surahs matching your search`
              : 'This view shows the chronological order of Surahs in the Quran based on when they were revealed to the Prophet Muhammad ﷺ.'
            }
          </Text>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-left max-w-3xl mx-auto">
            <Text className="text-xs md:text-sm text-gray-700 leading-tight md:leading-relaxed">
              <strong>Note:</strong> The chronology is a subject of scholarly opinion and some Surahs were revealed in parts at different times. The ordering here is based on the work of{' '}
              <a
                href="https://tanzil.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline transition-colors duration-300"
              >
                Tanzil.net
              </a>
              . The compiled Mushaf order from Al-Fatihah to An-Nas is a matter of consensus.
            </Text>
          </div>
        </div>

        {/* Surahs Grid - Same as Surah view but with revelation order number - Mobile optimized */}
        {surahsByRevelation.length === 0 ? (
          <div className="text-center py-6 md:py-12">
            <Text className="text-gray-600 text-sm md:text-lg">
              No surahs found matching your search. Try a different query.
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {surahsByRevelation.map((surah) => (
              <div key={surah.surahNo} className="relative group">
                <SurahCard surah={surah} />
                {/* Revelation Order Badge - Top Left - Mobile optimized */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-blue-100 text-blue-800 text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded z-10">
                  #{surah.revelationOrder}
                </div>
                {/* Revelation Place Badge - Bottom Right - Mobile optimized */}
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10">
                  <span className={cn(
                    'text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded',
                    surah.revelationPlaceDisplay === 'Meccan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  )}>
                    {surah.revelationPlaceDisplay}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
