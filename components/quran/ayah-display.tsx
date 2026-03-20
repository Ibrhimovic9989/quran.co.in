// Ayah Display Component
// Displays a single ayah with Arabic, translations, audio, and tafsir

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronRight, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/typography';
import { Select } from '@/components/ui/atoms';
import { cn } from '@/lib/utils/cn';
import { AudioPlayer } from './audio-player';
import { TafsirDisplay } from './tafsir-display';
import { BookmarkButton } from './bookmark-button';
import { AyahShareButton } from './ayah-share-button';
import type { AyahResponse, TafsirResponse } from '@/types/quran-api';

type TranslationLanguage = 'english' | 'bengali' | 'urdu' | 'turkish' | 'uzbek';

const TRANSLIT_KEY = 'quran-show-transliteration';

const languageNames: Record<TranslationLanguage, string> = {
  english: 'English',
  bengali: 'Bengali',
  urdu: 'Urdu',
  turkish: 'Turkish',
  uzbek: 'Uzbek',
};

interface AyahDisplayProps {
  ayah: AyahResponse;
  tafsir?: TafsirResponse;
  showNumber?: boolean;
  className?: string;
  selectedReciter?: string | null; // Reciter selected at surah level
  onReciterChange?: (reciterId: string) => void; // Callback when reciter changes
  isActive?: boolean;
  enableSharedPlayback?: boolean;
}

export function AyahDisplay({
  ayah,
  tafsir: initialTafsir,
  showNumber = true,
  className,
  selectedReciter,
  onReciterChange,
  isActive = false,
  enableSharedPlayback = false,
}: AyahDisplayProps) {
  const { data: session, status } = useSession();
  const [showTafsir, setShowTafsir] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TRANSLIT_KEY) === 'true') setShowTranslit(true);
  }, []);
  const [tafsir, setTafsir] = useState<TafsirResponse | undefined>(initialTafsir);

  // Similar ayahs state
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarLoadingMore, setSimilarLoadingMore] = useState(false);
  const [similarResults, setSimilarResults] = useState<{
    surahNumber: number; ayahNumber: number;
    arabicText: string; translationText: string | null;
    englishName: string; englishNameTranslation: string | null;
    similarity: number;
  }[]>([]);
  const [similarHasMore, setSimilarHasMore] = useState(false);

  const fetchSimilar = useCallback(async () => {
    if (similarResults.length > 0) return; // already loaded
    setSimilarLoading(true);
    try {
      const res = await fetch(`/api/search/similar?surah=${ayah.surahNo}&ayah=${ayah.ayahNo}&limit=5&offset=0`);
      if (res.ok) {
        const data = await res.json();
        setSimilarResults(data.results ?? []);
        setSimilarHasMore(data.hasMore ?? false);
      }
    } catch { /* silent */ }
    finally { setSimilarLoading(false); }
  }, [ayah.surahNo, ayah.ayahNo, similarResults.length]);

  const loadMoreSimilar = useCallback(async () => {
    setSimilarLoadingMore(true);
    try {
      const res = await fetch(
        `/api/search/similar?surah=${ayah.surahNo}&ayah=${ayah.ayahNo}&limit=5&offset=${similarResults.length}`
      );
      if (res.ok) {
        const data = await res.json();
        setSimilarResults((prev) => [...prev, ...(data.results ?? [])]);
        setSimilarHasMore(data.hasMore ?? false);
      }
    } catch { /* silent */ }
    finally { setSimilarLoadingMore(false); }
  }, [ayah.surahNo, ayah.ayahNo, similarResults.length]);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationLanguage>('english');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);

  // Track reading history when ayah is actually in view for a short time
  useEffect(() => {
    if (hasTrackedRef.current) return;
    if (status !== 'authenticated' || !session?.user) return;

    const element = rootRef.current;
    if (!element || typeof window === 'undefined') return;

    let timer: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTrackedRef.current) {
          // Only track if user has kept this ayah in view for ~1.5s
          timer = window.setTimeout(() => {
            if (hasTrackedRef.current) return;
            hasTrackedRef.current = true;
            fetch('/api/reading-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                surahNumber: ayah.surahNo,
                ayahNumber: ayah.ayahNo,
              }),
            }).catch((error) => {
              console.error('Error tracking reading history:', error);
            });
            observer.disconnect();
          }, 1500);
        } else if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(element);

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      observer.disconnect();
    };
  }, [status, session, ayah.surahNo, ayah.ayahNo]);

  useEffect(() => {
    if (!isActive) return;
    const element = rootRef.current;
    if (!element) return;

    const timer = window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isActive]);

  const availableTranslations: TranslationLanguage[] = [];
  if (ayah.english) availableTranslations.push('english');
  if (ayah.bengali) availableTranslations.push('bengali');
  if (ayah.urdu) availableTranslations.push('urdu');
  if (ayah.turkish) availableTranslations.push('turkish');
  if (ayah.uzbek) availableTranslations.push('uzbek');

  const hasMultipleTranslations = availableTranslations.length > 1;
  const hasAudio = Boolean(ayah.audio && Object.keys(ayah.audio).length > 0);
  const showInlineAudioControl = hasAudio && selectedReciter !== undefined;

  const getCurrentTranslation = (): string => {
    switch (selectedTranslation) {
      case 'bengali':
        return ayah.bengali || '';
      case 'urdu':
        return ayah.urdu || '';
      case 'turkish':
        return ayah.turkish || '';
      case 'uzbek':
        return ayah.uzbek || '';
      default:
        return ayah.english || '';
    }
  };

  return (
    <div ref={rootRef} id={`ayah-${ayah.surahNo}-${ayah.ayahNo}`}>
      <Card 
        className={cn(
          'relative border border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-sm',
          'transition-colors duration-200',
          isActive && 'border-emerald-300 bg-emerald-50/40 shadow-md ring-1 ring-emerald-200',
          className
        )}
      >
        <div className="space-y-4 md:space-y-5">
          <div className="flex items-start justify-between gap-3">
            {showNumber ? (
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-500">
                  {ayah.surahNo}:{ayah.ayahNo}
                </p>
                <p className="truncate text-xs text-stone-400 md:text-sm">
                  {ayah.surahNameTranslation}
                </p>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {showInlineAudioControl && (
                <AudioPlayer
                  audioData={ayah.audio!}
                  surahNo={ayah.surahNo}
                  ayahNo={ayah.ayahNo}
                  selectedReciter={selectedReciter}
                  onReciterChange={onReciterChange}
                  enableSharedPlayback={enableSharedPlayback}
                  minimal
                />
              )}
              <BookmarkButton
                surahNumber={ayah.surahNo}
                ayahNumber={ayah.ayahNo}
                iconOnly
              />
              <AyahShareButton
                surahNumber={ayah.surahNo}
                ayahNumber={ayah.ayahNo}
                surahName={ayah.surahNameTranslation}
                arabicText={ayah.arabic1}
                translationText={getCurrentTranslation()}
                iconOnly
              />
            </div>
          </div>

          <Text className="text-right font-arabic text-[2rem] font-semibold leading-[2.1] text-stone-900 md:text-[2.6rem] md:leading-[2.3]">
          {ayah.arabic1}
          </Text>

          {showTranslit && ayah.arabic2 && (
            <p className="text-right text-sm italic leading-7 text-stone-400 md:text-base md:leading-8">
              {ayah.arabic2}
            </p>
          )}

          <div className="space-y-3">
            {hasMultipleTranslations && (
              <div className="max-w-[10rem]">
                <Select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value as TranslationLanguage)}
                  options={availableTranslations.map((lang) => ({
                    value: lang,
                    label: languageNames[lang],
                  }))}
                  className="h-9 rounded-full border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus:border-stone-400"
                />
              </div>
            )}

            <Text className="text-base font-medium leading-8 text-stone-800 md:text-xl md:leading-9">
              {getCurrentTranslation()}
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
            {hasAudio && !showInlineAudioControl && (
              <AudioPlayer
                audioData={ayah.audio!}
                surahNo={ayah.surahNo}
                ayahNo={ayah.ayahNo}
                className="flex-1"
                selectedReciter={selectedReciter}
                onReciterChange={onReciterChange}
                enableSharedPlayback={enableSharedPlayback}
                minimal
              />
            )}

            {ayah.arabic2 && (
              <button
                onClick={() => {
                  const next = !showTranslit;
                  setShowTranslit(next);
                  localStorage.setItem(TRANSLIT_KEY, String(next));
                }}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors duration-200',
                  showTranslit
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                )}
              >
                <span className="text-[11px] font-bold tracking-wide">A</span>
                <span>Transliteration</span>
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-600">beta</span>
              </button>
            )}

            <button
              onClick={async () => {
                if (!showTafsir && !tafsir) {
                  try {
                    const response = await fetch(
                      `/api/quran/tafsir/${ayah.surahNo}/${ayah.ayahNo}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setTafsir(data.tafsir);
                    }
                  } catch (error) {
                    console.error('Error fetching tafsir:', error);
                  }
                }
                setShowTafsir(!showTafsir);
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-stone-500 transition-colors duration-200 hover:bg-stone-100 hover:text-stone-800"
            >
              {showTafsir ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>Tafsir</span>
            </button>

            {/* Similar Ayahs button */}
            <button
              onClick={() => {
                if (!showSimilar) fetchSimilar();
                setShowSimilar((v) => !v);
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-purple-500 transition-colors duration-200 hover:bg-purple-50 hover:text-purple-700"
            >
              {similarLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : showSimilar
                  ? <ChevronDown className="h-4 w-4" />
                  : <Sparkles className="h-4 w-4" />}
              <span>Similar verses</span>
            </button>
          </div>

          {showTafsir && tafsir && (
            <TafsirDisplay tafsir={tafsir} className="mt-2 md:mt-4" />
          )}

          {/* Similar Ayahs Panel */}
          {showSimilar && (
            <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/40 overflow-hidden">
              <p className="px-3 py-2 text-xs font-semibold text-purple-700 border-b border-purple-100">
                Verses with similar themes
              </p>
              {similarLoading && (
                <div className="divide-y divide-purple-50">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-3 py-3 space-y-1.5 animate-pulse">
                      <div className="h-3 w-24 bg-purple-100 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              )}
              {!similarLoading && similarResults.length > 0 && (
                <>
                  <ul className="divide-y divide-purple-50/70">
                    {similarResults.map((r) => (
                      <li key={`${r.surahNumber}:${r.ayahNumber}`}>
                        <Link
                          href={`/quran/${r.surahNumber}`}
                          className="flex flex-col gap-1 px-3 py-3 hover:bg-purple-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              {r.surahNumber}:{r.ayahNumber} · {r.englishName}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-purple-400">{Math.round(r.similarity * 100)}%</span>
                              <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </div>
                          <p lang="ar" dir="rtl" className="font-arabic text-right text-sm leading-relaxed text-gray-700">
                            {r.arabicText}
                          </p>
                          {r.translationText && (
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{r.translationText}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {similarHasMore && (
                    <div className="px-3 py-2 border-t border-purple-100">
                      <button
                        onClick={loadMoreSimilar}
                        disabled={similarLoadingMore}
                        className="w-full text-xs text-purple-600 hover:text-purple-800 font-medium py-1 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {similarLoadingMore
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
                          : 'Load 5 more similar verses'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
