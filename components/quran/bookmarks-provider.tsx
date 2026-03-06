// Bookmarks Provider
// Single responsibility: fetch/cache bookmarks once and provide helpers to children

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

type BookmarkDto = {
  id: string;
  surahNumber: number;
  ayahNumber: number | null;
  createdAt?: string;
  surah?: {
    arabicName: string;
    englishName: string;
    englishNameTranslation?: string | null;
  };
};

type BookmarkKey = `${number}:${number | 'null'}`;

function toBookmarkKey(surahNumber: number, ayahNumber: number | null | undefined): BookmarkKey {
  return `${surahNumber}:${ayahNumber ?? 'null'}` as BookmarkKey;
}

type BookmarksContextValue = {
  isLoading: boolean;
  bookmarks: BookmarkDto[];
  latestBookmark: BookmarkDto | null;
  isBookmarked: (surahNumber: number, ayahNumber?: number) => boolean;
  refresh: () => Promise<void>;
  toggle: (input: { surahNumber: number; ayahNumber?: number }) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedOnceRef = useRef(false);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookmarks', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { bookmarks?: BookmarkDto[] };
      setBookmarks(Array.isArray(data.bookmarks) ? data.bookmarks : []);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    refresh().catch(() => {});
  }, [refresh, session?.user, status]);

  const bookmarksSet = useMemo(() => {
    const set = new Set<BookmarkKey>();
    for (const b of bookmarks) {
      set.add(toBookmarkKey(b.surahNumber, b.ayahNumber));
    }
    return set;
  }, [bookmarks]);

  const latestBookmark = useMemo(() => {
    if (bookmarks.length === 0) return null;
    // API returns bookmarks ordered by createdAt desc
    return bookmarks[0] ?? null;
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber?: number) => {
      return bookmarksSet.has(toBookmarkKey(surahNumber, ayahNumber ?? null));
    },
    [bookmarksSet]
  );

  const toggle = useCallback(
    ({ surahNumber, ayahNumber }: { surahNumber: number; ayahNumber?: number }) => {
      if (status !== 'authenticated' || !session?.user) return;

      const key = toBookmarkKey(surahNumber, ayahNumber ?? null);
      const currentlyBookmarked = bookmarksSet.has(key);

      if (currentlyBookmarked) {
        const previousBookmarks = bookmarks;
        setBookmarks((prev) => prev.filter((b) => toBookmarkKey(b.surahNumber, b.ayahNumber) !== key));

        fetch(`/api/bookmarks/${surahNumber}${ayahNumber ? `/${ayahNumber}` : ''}`, {
          method: 'DELETE',
        }).then((res) => {
          if (!res.ok) {
            setBookmarks(previousBookmarks);
          }
        }).catch(() => {
          setBookmarks(previousBookmarks);
        });
        return;
      }

      const previousBookmarks = bookmarks;

      // Enforce "only one bookmark per surah" locally too (API already does it)
      setBookmarks((prev) => {
        const withoutSameSurah = prev.filter((b) => b.surahNumber !== surahNumber);
        const created: BookmarkDto = {
          id: `local-${Date.now()}`,
          surahNumber,
          ayahNumber: ayahNumber ?? null,
        };
        return [created, ...withoutSameSurah];
      });

      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber, ayahNumber }),
      }).then((res) => {
        if (!res.ok) {
          setBookmarks(previousBookmarks);
          return;
        }

        // Refresh in background to hydrate surah relation for Continue Reading.
        refresh().catch(() => {});
      }).catch(() => {
        setBookmarks(previousBookmarks);
      });
    },
    [bookmarks, bookmarksSet, refresh, session?.user, status]
  );

  const value: BookmarksContextValue = useMemo(
    () => ({
      isLoading,
      bookmarks,
      latestBookmark,
      isBookmarked,
      refresh,
      toggle,
    }),
    [bookmarks, isBookmarked, isLoading, latestBookmark, refresh, toggle]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) {
    throw new Error('useBookmarks must be used within BookmarksProvider');
  }
  return ctx;
}

