// Juz Page Client Component
// Displays a complete Juz with all its ayahs
// Follows Atomic Design - Organism component

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Button, Spinner } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';
import { ReciterSelector } from '@/components/ui/molecules';
import { AyahDisplay } from './ayah-display';
import { cn } from '@/lib/utils/cn';
import type { AyahResponse } from '@/types/quran-api';

interface JuzPageClientProps {
  juzNumber: number;
}

interface JuzAyah extends AyahResponse {
  surahNumber: number;
  juzNumber: number;
}

export function JuzPageClient({ juzNumber }: JuzPageClientProps) {
  const router = useRouter();
  const [ayahs, setAyahs] = useState<JuzAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [surahRanges, setSurahRanges] = useState<any[]>([]);

  // Fetch Juz data
  const fetchJuzData = useCallback(async () => {
    if (juzNumber < 1 || juzNumber > 30) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quran/juz/${juzNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Juz data');
      }

      const data = await response.json();
      setAyahs(data.ayahs || []);
      setSurahRanges(data.surahRanges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Juz');
      console.error('Error fetching Juz:', err);
    } finally {
      setIsLoading(false);
    }
  }, [juzNumber]);

  useEffect(() => {
    fetchJuzData();
  }, [fetchJuzData]);

  // Group ayahs by surah
  const ayahsBySurah = ayahs.reduce((acc, ayah) => {
    const surahNo = ayah.surahNumber;
    if (!acc[surahNo]) {
      acc[surahNo] = [];
    }
    acc[surahNo].push(ayah);
    return acc;
  }, {} as Record<number, JuzAyah[]>);

  // Get available reciters from first ayah (they should be the same across all)
  const availableReciters = ayahs.length > 0 && ayahs[0].audio
    ? Object.entries(ayahs[0].audio).map(([id, data]) => ({
        id,
        ...data,
      }))
    : [];

  return (
    <Container>
      <div className="py-6 md:py-12">
        {/* Header - Mobile optimized */}
        <div className="mb-6 md:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/quran?tab=juz')}
            className="mb-4 md:mb-6 text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <Heading level={1} className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight">
                Juz {juzNumber}
              </Heading>
              <Text className="text-gray-600 text-xs md:text-base">
                {ayahs.length} Ayahs • {Object.keys(ayahsBySurah).length} Surahs
              </Text>
            </div>
          </div>

          {/* Reciter Selection - Mobile optimized */}
          {availableReciters.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
              <ReciterSelector
                audioData={ayahs.length > 0 ? ayahs[0].audio : {}}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
                className="max-w-md"
              />
            </div>
          )}
        </div>

        {/* Content - Mobile optimized */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 gap-3 md:gap-4">
            <Spinner size="lg" />
            <LoadingMessage />
          </div>
        )}

        {error && (
          <div className="text-center py-8 md:py-16">
            <Text className="text-red-600 mb-3 md:mb-4 text-sm md:text-base">{error}</Text>
            <Button onClick={fetchJuzData} variant="primary" className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && ayahs.length > 0 && (
          <div className="space-y-4 md:space-y-8">
            {Object.entries(ayahsBySurah)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([surahNo, surahAyahs]) => {
                const surahRange = surahRanges.find(
                  (r) => r.surahNumber === parseInt(surahNo)
                );
                const firstAyah = surahAyahs[0];

                return (
                  <div key={surahNo} className="space-y-3 md:space-y-4">
                    {/* Surah Header - Mobile optimized */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 md:p-4 border border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Heading level={3} className="text-base md:text-xl font-bold text-gray-900 mb-1 leading-tight">
                            {firstAyah.surahNameTranslation} ({surahNo})
                          </Heading>
                          <Text className="text-sm md:text-lg font-arabic text-gray-700 leading-tight">
                            {firstAyah.surahNameArabic}
                          </Text>
                        </div>
                        {surahRange && (
                          <div className="text-right flex-shrink-0">
                            <Text className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                              Ayahs {surahRange.startAyah} - {surahRange.endAyah}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ayahs - Mobile optimized spacing */}
                    <div className="space-y-3 md:space-y-4">
                      {surahAyahs.map((ayah, index) => (
                        <AyahDisplay
                          key={`${ayah.surahNumber}-${ayah.ayahNo}-${index}`}
                          ayah={ayah}
                          showNumber={true}
                          selectedReciter={selectedReciter}
                          onReciterChange={setSelectedReciter}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {!isLoading && !error && ayahs.length === 0 && (
          <div className="text-center py-8 md:py-16">
            <Text className="text-gray-600 text-sm md:text-base">No ayahs found for this Juz.</Text>
          </div>
        )}
      </div>
    </Container>
  );
}
