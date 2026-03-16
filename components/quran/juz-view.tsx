// Juz View Component
// Displays surahs organized by Juz (30 parts)
// Follows Atomic Design - Organism component

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { juzMapping, getJuzData } from '@/lib/data/juz-mapping';
import type { SurahInfo } from '@/types/quran-api';
import { cn } from '@/lib/utils/cn';

interface JuzViewProps {
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

function JuzReadLink({ juzNumber }: { juzNumber: number }) {
  const [loading, setLoading] = useState(false);
  return (
    <Link
      href={`/quran/juz/${juzNumber}`}
      onClick={() => setLoading(true)}
      className="inline-flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-gray-900 underline transition-colors duration-300"
    >
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
      )}
      {loading ? 'Loading...' : 'Read Juz'}
    </Link>
  );
}

export function JuzView({ surahs, searchQuery = '' }: JuzViewProps) {
  // Create a map of surah number to surah data for quick lookup
  const surahMap = useMemo(() => {
    const map = new Map<number, SurahInfo & { surahNo: number }>();
    surahs.forEach((surah) => {
      map.set(surah.surahNo, surah);
    });
    return map;
  }, [surahs]);

  // Group surahs by Juz
  const juzGroups = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const normalizedQuery = normalizeSearchText(rawQuery);
    
    return juzMapping
      .map((juz) => {
        const surahsInJuz: (SurahInfo & { surahNo: number })[] = [];
        
        juz.surahRanges.forEach((range) => {
          const surah = surahMap.get(range.surahNumber);
          if (surah) {
            surahsInJuz.push(surah);
          }
        });

        // Remove duplicates (a surah can appear in multiple ranges if it spans Juz)
        const uniqueSurahs = Array.from(
          new Map(surahsInJuz.map((s) => [s.surahNo, s])).values()
        );

        // Filter surahs if search query exists
        let filteredSurahs = uniqueSurahs;
        if (rawQuery) {
          filteredSurahs = uniqueSurahs.filter((surah) => {
            // Search by Juz number
            if (juz.juzNumber.toString().includes(normalizedQuery)) return true;

            // Search by surah name (Latin / transliteration-like)
            if (
              normalizeSearchText(surah.surahName ?? '').includes(
                normalizedQuery
              )
            ) {
              return true;
            }

            // Search by surah name (English translation)
            if (
              normalizeSearchText(
                surah.surahNameTranslation ?? ''
              ).includes(normalizedQuery)
            ) {
              return true;
            }

            // Search by surah name (Arabic) - use raw query
            if (surah.surahNameArabic?.includes(rawQuery)) return true;

            // Search by surah number
            if (surah.surahNo.toString().includes(normalizedQuery)) return true;
            
            return false;
          });
        }

        return {
          juzNumber: juz.juzNumber,
          surahs: filteredSurahs,
        };
      })
      .filter((group) => {
        // Filter out empty Juz groups if searching
        if (rawQuery && group.surahs.length === 0) return false;
        return true;
      });
  }, [surahMap, searchQuery]);

  return (
    <section className={cn('w-full py-6 md:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white')}>
      <Container>
        <div className="max-w-4xl mx-auto text-center mb-6 md:mb-16">
          <Heading level={1} className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-6 leading-tight">
            The Holy Quran{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              by Juz
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-tight md:leading-relaxed">
            {searchQuery 
              ? `Found ${juzGroups.length} Juz matching your search`
              : 'The Quran is divided into 30 equal parts (Juz) for easy recitation and study.'
            }
          </Text>
        </div>

        {/* Juz Groups - 3 columns layout - Mobile optimized */}
        {juzGroups.length === 0 ? (
          <div className="text-center py-6 md:py-12">
            <Text className="text-gray-600 text-sm md:text-lg">
              No Juz found matching your search. Try a different query.
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {juzGroups.map((group) => (
              <div
                key={group.juzNumber}
                className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Heading level={3} className="text-lg md:text-2xl font-bold text-gray-900">
                    Juz {group.juzNumber}
                  </Heading>
                  <JuzReadLink juzNumber={group.juzNumber} />
                </div>
                
                <div className="space-y-2 md:space-y-3">
                  {group.surahs.map((surah) => {
                    const juzData = getJuzData(group.juzNumber);
                    const surahRange = juzData?.surahRanges.find(
                      (r) => r.surahNumber === surah.surahNo
                    );
                    
                    return (
                      <Link
                        key={surah.surahNo}
                        href={`/quran/${surah.surahNo}`}
                        className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out border border-transparent hover:border-gray-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-gray-800 font-bold text-xs md:text-sm">
                            {surah.surahNo}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <Text className="text-gray-900 font-semibold text-sm md:text-base">
                                {surah.surahNameTranslation}
                              </Text>
                              <Text className="text-gray-600 text-xs md:text-sm">
                                {surah.surahNameArabic}
                              </Text>
                            </div>
                          </div>
                          <Text className="text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1">
                            {surah.totalAyah} Ayahs
                            {surahRange && surahRange.startAyah !== 1 && (
                              <span className="ml-1 md:ml-2">
                                (Ayahs {surahRange.startAyah}-{surahRange.endAyah})
                              </span>
                            )}
                          </Text>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
