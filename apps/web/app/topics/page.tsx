'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, ChevronLeft, X } from 'lucide-react';
import { QURAN_TOPICS, type QuranTopic } from '@/lib/data/quran-topics';
import { cn } from '@/lib/utils/cn';
import { backendUrl } from '@/lib/api/backend';

interface TopicResult {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
  similarity: number;
}

// Category tiles carry the pastel voice — the tint is decoration, never the text.
const TINTS = ['bg-tint-sage', 'bg-tint-sky', 'bg-tint-peach', 'bg-tint-sun', 'bg-tint-lavender'];
const TINT_BY_ID = new Map(QURAN_TOPICS.map((t, i) => [t.id, TINTS[i % TINTS.length]]));
const tintFor = (id: string) => TINT_BY_ID.get(id) ?? TINTS[0];

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
        backendUrl(`/api/search/semantic?q=${encodeURIComponent(topic.query)}&limit=10`)
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">

        {/* Header */}
        <div className="mb-7 md:mb-9">
          <h1 className="font-heading text-[clamp(26px,3.2vw,34px)] font-bold leading-[1.2] tracking-[-0.035em] text-ink">
            Explore by Topic
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-muted">
            Browse Quranic ayahs organized by theme. Powered by semantic search across all 6,236 verses.
          </p>
        </div>

        {/* Topic grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {QURAN_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => loadTopic(topic)}
              className={cn(
                'rounded-2xl border border-line p-4 text-left text-ink transition-all duration-200',
                'hover:shadow-card',
                tintFor(topic.id),
                activeTopic?.id === topic.id && 'border-accent/40 shadow-card'
              )}
            >
              <div className="mb-2 text-2xl">{topic.emoji}</div>
              <div className="font-heading text-[13px] font-bold leading-tight tracking-[-0.02em]">{topic.label}</div>
              <div className="font-arabic text-sm opacity-70 mt-0.5">{topic.arabic}</div>
              <div className="mt-1 text-[11px] leading-tight text-ink-soft">{topic.description}</div>
            </button>
          ))}
        </div>

        {/* Results panel */}
        {activeTopic && (
          <div ref={resultsRef} className="overflow-hidden rounded-2xl border border-line bg-surface">
            {/* Panel header */}
            <div className={cn('flex items-center justify-between border-b border-line px-5 py-4 text-ink', tintFor(activeTopic.id))}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeTopic.emoji}</span>
                <div>
                  <h2 className="font-heading text-[15px] font-bold leading-tight tracking-[-0.02em]">
                    {activeTopic.label}
                    <span className="font-arabic ml-2 font-normal opacity-70">{activeTopic.arabic}</span>
                  </h2>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{activeTopic.description}</p>
                </div>
              </div>
              <button
                onClick={() => { setActiveTopic(null); setResults([]); }}
                className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface/60"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <p className="text-[13px] text-muted">Finding the most relevant ayahs…</p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <ul className="divide-y divide-line-soft">
                {results.map((r, i) => (
                  <li key={`${r.surahNumber}:${r.ayahNumber}`}>
                    <Link
                      href={`/quran/${r.surahNumber}`}
                      className="group flex gap-4 px-5 py-4 transition-colors hover:bg-surface-warm"
                    >
                      {/* Rank */}
                      <div className="w-6 shrink-0 text-center">
                        <span className="font-heading text-[11px] font-bold text-muted">{i + 1}</span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-muted">
                            {r.englishName}
                            {r.englishNameTranslation && (
                              <span className="font-normal text-muted"> · {r.englishNameTranslation}</span>
                            )}
                            <span className="ml-2 font-bold text-accent-strong">{r.surahNumber}:{r.ayahNumber}</span>
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="text-[10px] text-muted">{Math.round(r.similarity * 100)}%</span>
                            <ExternalLink className="h-3 w-3 text-muted transition-colors group-hover:text-accent" />
                          </div>
                        </div>
                        <p lang="ar" dir="rtl" className="font-arabic text-right text-lg leading-relaxed text-ink">
                          {r.arabicText}
                        </p>
                        {r.translationText && (
                          <p className="text-[13px] leading-[1.75] text-ink-soft">{r.translationText}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!loading && results.length === 0 && (
              <div className="py-12 text-center text-[13px] text-muted">
                No results found. Try another topic.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
