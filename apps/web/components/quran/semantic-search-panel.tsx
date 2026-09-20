'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { backendUrl } from '@/lib/api/backend';

interface SemanticResult {
  surahNumber:            number;
  ayahNumber:             number;
  arabicText:             string;
  translationText:        string | null;
  englishName:            string;
  englishNameTranslation: string | null;
  similarity:             number;
}

interface SemanticSearchPanelProps {
  query: string;
  className?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Is the query "topic-like" — i.e. it should trigger semantic search?
// Rule: 3+ chars AND (contains a space OR more than 15 chars)
// This lets short surah-name searches stay as filter, topic queries go semantic.
function isTopicQuery(q: string): boolean {
  const t = q.trim();
  return t.length >= 3 && (t.includes(' ') || t.length > 15);
}

export function SemanticSearchPanel({ query, className }: SemanticSearchPanelProps) {
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults]   = useState<SemanticResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        backendUrl(`/api/search/semantic?q=${encodeURIComponent(q)}&limit=6`),
        { signal: ctrl.signal }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results ?? []);
      setLastQuery(q);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Could not complete search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isTopicQuery(debouncedQuery)) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  // Don't render anything if query is too short / not topic-like
  if (!isTopicQuery(query) && results.length === 0 && !loading) return null;

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-surface', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-line bg-tint-lavender px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.6} />
        <span className="font-heading text-[13px] font-bold tracking-[-0.025em] text-ink">
          {loading
            ? 'Searching across all ayahs…'
            : results.length > 0
              ? `${results.length} ayahs related to "${lastQuery}"`
              : `No results for "${lastQuery}"`}
        </span>
        {loading && <Loader2 className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin text-ink-muted" />}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="divide-y divide-line-soft">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2 px-4 py-4">
              <div className="h-3 w-32 rounded-full bg-line" />
              <div className="h-4 w-full rounded-lg bg-line-soft" />
              <div className="h-3 w-3/4 rounded-full bg-line-soft" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <ul className="divide-y divide-line-soft">
          {results.map((r) => (
            <li key={`${r.surahNumber}:${r.ayahNumber}`}>
              <Link
                href={`/quran/${r.surahNumber}?ayah=${r.ayahNumber}`}
                className="group flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-accent-soft/40"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                      {r.surahNumber}:{r.ayahNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-soft">
                      {r.englishName}
                      {r.englishNameTranslation && (
                        <span className="font-normal text-ink-muted"> · {r.englishNameTranslation}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-medium text-ink-muted">
                      {Math.round(r.similarity * 100)}% match
                    </span>
                    <ExternalLink className="h-3 w-3 text-ink-muted transition-colors group-hover:text-accent" />
                  </div>
                </div>

                {/* Arabic */}
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic text-right text-base leading-relaxed text-ink"
                >
                  {r.arabicText}
                </p>

                {/* Translation */}
                {r.translationText && (
                  <p className="line-clamp-2 text-[13px] leading-[1.75] text-ink-soft">
                    {r.translationText}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && isTopicQuery(debouncedQuery) && (
        <div className="px-4 py-6 text-center text-[13px] text-ink-muted">
          Try rephrasing your search — e.g. <em>"patience in hardship"</em> or <em>"Allah's mercy"</em>
        </div>
      )}
    </div>
  );
}
