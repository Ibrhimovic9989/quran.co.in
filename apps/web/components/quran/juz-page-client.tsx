// Juz Page Client Component
// Displays a complete Juz with all its ayahs
// Follows Atomic Design - Organism component

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Heading, Text } from "@/components/ui/typography";
import { Button, Spinner } from "@/components/ui/atoms";
import { LoadingMessage } from "@/components/ui/loading-message";
import { ReciterSelector } from "@/components/ui/molecules";
import { ReadingPreferencesProvider, ReadingPreferenceControls, type TranslationLanguage } from "./reading-preferences";
import { AyahDisplay } from "./ayah-display";
import { BookmarksProvider } from "./bookmarks-provider";
import { cn } from "@/lib/utils/cn";
import { backendUrl } from "@/lib/api/backend";
import type { AyahResponse } from "@/types/quran-api";

interface JuzPageClientProps {
  juzNumber: number;
}

interface JuzAyah extends AyahResponse {
  surahNumber: number;
  juzNumber: number;
}

const PAGE_SIZE = 20;

export function JuzPageClient({ juzNumber }: JuzPageClientProps) {
  const router = useRouter();
  const [ayahs, setAyahs] = useState<JuzAyah[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [surahRanges, setSurahRanges] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalAyahs, setTotalAyahs] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch a page of Juz data
  const fetchJuzPage = useCallback(
    async (pageOffset: number) => {
      if (juzNumber < 1 || juzNumber > 30) return;

      const isFirstPage = pageOffset === 0;
      if (isFirstPage) {
        setIsInitialLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetch(
          backendUrl(`/api/quran/juz/${juzNumber}?offset=${pageOffset}&limit=${PAGE_SIZE}`)
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Juz data");
        }

        const data = await response.json();
        const pageAyahs = (data.ayahs || []) as JuzAyah[];

        setTotalAyahs(typeof data.totalAyahs === "number" ? data.totalAyahs : null);
        setSurahRanges(data.surahRanges || []);

        if (isFirstPage) {
          setAyahs(pageAyahs);
        } else {
          setAyahs((prev) => [...prev, ...pageAyahs]);
        }

        const newOffset = pageOffset + pageAyahs.length;
        setOffset(newOffset);
        setHasMore(pageAyahs.length === PAGE_SIZE && (data.totalAyahs == null || newOffset < data.totalAyahs));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Juz");
        console.error("Error fetching Juz:", err);
      } finally {
        if (isFirstPage) {
          setIsInitialLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [juzNumber]
  );

  useEffect(() => {
    fetchJuzPage(0);
  }, [fetchJuzPage]);

  // Scroll to top when juz number changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [juzNumber]);

  // Group ayahs by surah (derived for rendering)
  const ayahsBySurah = useMemo(() => {
    return ayahs.reduce((acc, ayah) => {
      const surahNo = ayah.surahNumber;
      if (!acc[surahNo]) {
        acc[surahNo] = [];
      }
      acc[surahNo].push(ayah);
      return acc;
    }, {} as Record<number, JuzAyah[]>);
  }, [ayahs]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!hasMore || isInitialLoading || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          fetchJuzPage(offset);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchJuzPage, hasMore, isInitialLoading, isLoadingMore, offset]);

  // Get available reciters from first ayah (they should be the same across all)
  const availableReciters = ayahs.length > 0 && ayahs[0].audio
    ? Object.entries(ayahs[0].audio).map(([id, data]) => ({
        id,
        ...data,
      }))
    : [];

  return (
    <ReadingPreferencesProvider><BookmarksProvider>
      <Container className="max-w-3xl">
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
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-accent-soft text-accent-strong md:h-16 md:w-16">
              <BookOpen className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.6} />
            </div>
            <div>
              <Heading level={1} className="mb-1 md:mb-2">
                Juz {juzNumber}
              </Heading>
              <Text className="text-[11px] uppercase tracking-[0.14em] text-ink-muted md:text-xs">
                {ayahs.length} Ayahs • {Object.keys(ayahsBySurah).length} Surahs
              </Text>
            </div>
          </div>

          {/* Reciter Selection - Mobile optimized */}
          {availableReciters.length > 0 && (
            <details className="rounded-xl border border-line bg-surface p-4"><summary className="cursor-pointer text-sm font-medium text-ink-soft">Reading & audio settings</summary><div className="mt-4 space-y-4">
              <ReadingPreferenceControls languages={(["english", "bengali", "urdu", "turkish", "uzbek"] as TranslationLanguage[]).filter(language => ayahs.some(ayah => Boolean(ayah[language])))} />
              <ReciterSelector
                audioData={ayahs.length > 0 ? ayahs[0].audio : {}}
                selectedReciter={selectedReciter}
                onReciterChange={setSelectedReciter}
                className="max-w-md"
              />
            </div></details>
          )}
        </div>

        {/* Content - Mobile optimized */}
        {isInitialLoading && (
          <div className="flex flex-col items-center justify-center py-8 md:py-16 gap-3 md:gap-4">
            <Spinner size="lg" />
            <LoadingMessage />
          </div>
        )}

        {error && !isInitialLoading && (
          <div className="text-center py-8 md:py-16">
            <Text className="mb-3 text-[13px] text-red-600 md:mb-4 md:text-sm">{error}</Text>
            <Button
              onClick={() => fetchJuzPage(0)}
              variant="primary"
              className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
            >
              Retry
            </Button>
          </div>
        )}

        {!isInitialLoading && !error && ayahs.length > 0 && (
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
                    <div className="rounded-2xl border border-line bg-surface p-3 md:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Heading level={3} className="mb-1 text-base md:text-xl">
                            {firstAyah.surahNameTranslation} ({surahNo})
                          </Heading>
                          <Text className="text-sm md:text-lg font-arabic text-ink-soft leading-tight">
                            {firstAyah.surahNameArabic}
                          </Text>
                        </div>
                        {surahRange && (
                          <div className="flex-shrink-0 text-right">
                            <Text className="whitespace-nowrap text-[11px] text-ink-muted md:text-xs">
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

        {!isInitialLoading && !error && ayahs.length === 0 && (
          <div className="text-center py-8 md:py-16">
            <Text className="text-[13px] text-ink-muted md:text-sm">No ayahs found for this Juz.</Text>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && !isInitialLoading && !error && (
          <div ref={sentinelRef} className="mt-6 md:mt-10 py-4 flex justify-center">
            {isLoadingMore && (
              <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                <Spinner size="md" />
                <LoadingMessage showIcon={false} className="max-w-xl" />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons - Mobile optimized */}
        {!isInitialLoading && !error && (
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-line">
            <div className="flex gap-3 md:gap-4 justify-between items-center">
              {juzNumber > 1 ? (
                <div className="flex-1">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      router.push(`/quran/juz/${juzNumber - 1}`);
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs md:text-sm">Previous · {juzNumber - 1}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex-1" />
              )}
              {juzNumber < 30 ? (
                <div className="flex-1">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      router.push(`/quran/juz/${juzNumber + 1}`);
                      setTimeout(() => window.scrollTo(0, 0), 100);
                    }}
                  >
                    <span className="text-xs md:text-sm">Next · {juzNumber + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        )}
        </div>
      </Container>
    </BookmarksProvider></ReadingPreferencesProvider>
  );
}
