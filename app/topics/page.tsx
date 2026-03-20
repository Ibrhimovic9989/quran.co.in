'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, ChevronLeft, X } from 'lucide-react';
import { QURAN_TOPICS, type QuranTopic } from '@/lib/data/quran-topics';
import { cn } from '@/lib/utils/cn';

interface TopicResult {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
  similarity: number;
}

export default function TopicsPage() {
  const [activeTopic, setActiveTopic] = useState<QuranTopic | null>(null);
  const [results, setResults] = useState<TopicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadTopic = useCallback(async (topic: QuranTopic) => {
    setActiveTopic(topic);
    setResults([]);
    setLoading(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    try {
      const res = await fetch(
        `/api/search/semantic?q=${encodeURIComponent(topic.query)}&limit=10`
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Explore by Topic
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Browse Quranic ayahs organized by theme. Powered by semantic search across all 6,236 verses.
          </p>
        </div>

        {/* Topic grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {QURAN_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => loadTopic(topic)}
              className={cn(
                'text-left p-3 md:p-4 rounded-2xl border transition-all duration-200',
                'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
                topic.color,
                activeTopic?.id === topic.id && 'ring-2 ring-offset-1 ring-gray-900 shadow-md'
              )}
            >
              <div className="text-2xl mb-2">{topic.emoji}</div>
              <div className="font-bold text-sm leading-tight">{topic.label}</div>
              <div className="font-arabic text-sm opacity-70 mt-0.5">{topic.arabic}</div>
              <div className="text-xs opacity-60 mt-1 leading-tight">{topic.description}</div>
            </button>
          ))}
        </div>

        {/* Results panel */}
        {activeTopic && (
          <div ref={resultsRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className={cn('flex items-center justify-between px-5 py-4 border-b', activeTopic.color)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeTopic.emoji}</span>
                <div>
                  <h2 className="font-bold text-base leading-tight">
                    {activeTopic.label}
                    <span className="font-arabic ml-2 font-normal opacity-70">{activeTopic.arabic}</span>
                  </h2>
                  <p className="text-xs opacity-70">{activeTopic.description}</p>
                </div>
              </div>
              <button
                onClick={() => { setActiveTopic(null); setResults([]); }}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-sm text-gray-400">Finding the most relevant ayahs…</p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {results.map((r, i) => (
                  <li key={`${r.surahNumber}:${r.ayahNumber}`}>
                    <Link
                      href={`/quran/${r.surahNumber}`}
                      className="flex gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Rank */}
                      <div className="shrink-0 w-6 text-center">
                        <span className="text-xs font-bold text-gray-300">{i + 1}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-500">
                            {r.englishName}
                            {r.englishNameTranslation && (
                              <span className="font-normal text-gray-400"> · {r.englishNameTranslation}</span>
                            )}
                            <span className="ml-2 font-bold text-gray-700">{r.surahNumber}:{r.ayahNumber}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-gray-400">{Math.round(r.similarity * 100)}%</span>
                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                          </div>
                        </div>
                        <p lang="ar" dir="rtl" className="font-arabic text-right text-lg leading-relaxed text-gray-800">
                          {r.arabicText}
                        </p>
                        {r.translationText && (
                          <p className="text-sm text-gray-600 leading-relaxed">{r.translationText}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!loading && results.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">
                No results found. Try another topic.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
