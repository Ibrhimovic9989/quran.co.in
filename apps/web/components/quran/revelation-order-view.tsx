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

// Normalize search text for Latin-based queries (English/transliteration)
const normalizeSearchText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

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
    const rawQuery = searchQuery.trim();
    const normalizedQuery = normalizeSearchText(rawQuery);
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
        if (!rawQuery) return true;
        
        // Search by surah name (Latin / transliteration-like)
        if (
          normalizeSearchText(surah.surahName ?? '').includes(normalizedQuery)
        ) {
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

        // Search by surah name (Arabic) - use raw query
        if (surah.surahNameArabic?.includes(rawQuery)) return true;
        
        // Search by surah number
        if (surah.surahNo.toString().includes(normalizedQuery)) return true;
        
        // Search by revelation order
        if (surah.revelationOrder.toString().includes(normalizedQuery)) {
          return true;
        }
        
        // Search by revelation place
        if (
          normalizeSearchText(
            surah.revelationPlaceDisplay?.toString() ?? ''
          ).includes(normalizedQuery)
        ) {
          return true;
        }
        
        return false;
      });
  }, [surahMap, searchQuery]);

  return (
    <section className={cn('w-full py-6 md:py-24 bg-paper')}>
      <Container>
        <div className="max-w-4xl mx-auto text-center mb-6 md:mb-16">
          <Heading level={1} className="mb-3 md:mb-6">
            Revelation Order
          </Heading>
          <Text className="mx-auto mb-3 max-w-2xl text-[13px] leading-[1.75] text-ink-soft md:mb-6 md:text-[15px]">
            {searchQuery 
              ? `Found ${surahsByRevelation.length} surahs matching your search`
              : 'This view shows the chronological order of Surahs in the Quran based on when they were revealed to the Prophet Muhammad ﷺ.'
            }
          </Text>
          <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-tint-sky p-3 text-left md:p-4">
            <Text className="text-[11px] leading-[1.7] text-ink-soft md:text-xs">
              <strong>Note:</strong> The chronology is a subject of scholarly opinion and some Surahs were revealed in parts at different times. The ordering here is based on the work of{' '}
              <a
                href="https://tanzil.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 transition-colors duration-300 hover:text-accent-strong"
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
            <Text className="text-[13px] text-ink-muted md:text-[15px]">
              No surahs found matching your search. Try a different query.
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {surahsByRevelation.map((surah) => (
              <div key={surah.surahNo} className="relative group">
                <SurahCard surah={surah} />
                {/* Revelation Order Badge - Top Left - Mobile optimized */}
                <div className="absolute left-2 top-2 z-10 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-strong md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[11px]">
                  #{surah.revelationOrder}
                </div>
                {/* Revelation Place Badge - Bottom Right - Mobile optimized */}
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-2.5 md:py-1 md:text-[11px]',
                    surah.revelationPlaceDisplay === 'Meccan'
                      ? 'bg-tint-sun text-gold-text'
                      : 'bg-tint-sage text-accent-strong'
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
