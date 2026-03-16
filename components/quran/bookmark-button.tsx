// Bookmark Button Component
// Allows users to bookmark ayahs/surahs

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/toast';
import { useBookmarks } from './bookmarks-provider';

interface BookmarkButtonProps {
  surahNumber: number;
  ayahNumber?: number;
  className?: string;
  iconOnly?: boolean;
}

export function BookmarkButton({ surahNumber, ayahNumber, className, iconOnly = false }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading: isLoadingBookmarks, isBookmarked, toggle, refresh } = useBookmarks();
  const { success, error: toastError } = useToast();

  const bookmarked = useMemo(() => isBookmarked(surahNumber, ayahNumber), [ayahNumber, isBookmarked, surahNumber]);

  const handleBookmark = async () => {
    // If not authenticated, redirect to sign-in with callback
    if (status !== 'authenticated' || !session?.user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentPath)}&bookmark=true&surahNumber=${surahNumber}&ayahNumber=${ayahNumber || ''}`);
      return;
    }

    try {
      const wasBookmarked = bookmarked;
      toggle({ surahNumber, ayahNumber });
      success(wasBookmarked ? 'Bookmark removed' : 'Bookmark saved');
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toastError('Failed to update bookmark. Please try again.');
    }
  };

  // Save bookmark after authentication (if redirected from bookmark action)
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldBookmark = urlParams.get('bookmark') === 'true';
      const surahNum = urlParams.get('surahNumber');
      const ayahNum = urlParams.get('ayahNumber');
      
      if (shouldBookmark && surahNum) {
        const bookmarkSurah = parseInt(surahNum);
        const bookmarkAyah = ayahNum ? parseInt(ayahNum) : undefined;
        
        // Only bookmark if it matches current ayah/surah
        if (bookmarkSurah === surahNumber && bookmarkAyah === (ayahNumber || undefined)) {
          const saveBookmark = async () => {
            try {
              toggle({ surahNumber, ayahNumber });
              // Ensure list is fresh for Continue Reading card etc.
              await refresh();
              // Clean up URL
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            } catch (error) {
              console.error('Error saving bookmark:', error);
            }
          };
          saveBookmark().catch(() => {});
        }
      }
    }
  }, [status, session, surahNumber, ayahNumber, toggle, refresh]);

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoadingBookmarks}
      className={cn(
        'flex items-center justify-center gap-2 rounded-md transition-colors duration-200',
        bookmarked
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
        iconOnly ? 'h-9 w-9 rounded-full p-0' : 'px-3 py-1.5',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={bookmarked ? 'Bookmarked' : 'Bookmark'}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {!iconOnly && (
        <span className="text-xs font-medium">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
}
