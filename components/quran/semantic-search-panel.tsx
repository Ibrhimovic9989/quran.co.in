'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
        `/api/search/semantic?q=${encodeURIComponent(q)}&limit=6`,
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
    <div className={cn('rounded-xl border border-purple-100 bg-gradient-to-b from-purple-50/60 to-white overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-purple-50/80">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="text-sm font-semibold text-purple-800">
          {loading
            ? 'Searching across all ayahs…'
            : results.length > 0
              ? `${results.length} ayahs related to "${lastQuery}"`
              : `No results for "${lastQuery}"`}
        </span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin ml-auto shrink-0" />}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="divide-y divide-purple-50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-4 animate-pulse space-y-2">
              <div className="h-3 w-32 bg-purple-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <ul className="divide-y divide-purple-50/70">
          {results.map((r) => (
            <li key={`${r.surahNumber}:${r.ayahNumber}`}>
              <Link
                href={`/quran/${r.surahNumber}`}
                className="flex flex-col gap-1.5 px-4 py-3.5 hover:bg-purple-50/60 transition-colors group"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {r.surahNumber}:{r.ayahNumber}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      {r.englishName}
                      {r.englishNameTranslation && (
                        <span className="text-gray-400 font-normal"> · {r.englishNameTranslation}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-purple-400 font-medium">
                      {Math.round(r.similarity * 100)}% match
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>

                {/* Arabic */}
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic text-right text-base leading-relaxed text-gray-800"
                >
                  {r.arabicText}
                </p>

                {/* Translation */}
                {r.translationText && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
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
        <div className="px-4 py-6 text-center text-sm text-gray-500">
          Try rephrasing your search — e.g. <em>"patience in hardship"</em> or <em>"Allah's mercy"</em>
        </div>
      )}
    </div>
  );
}
