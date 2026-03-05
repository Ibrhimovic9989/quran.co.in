// Bookmark Button Component
// Allows users to bookmark ayahs/surahs

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BookmarkButtonProps {
  surahNumber: number;
  ayahNumber?: number;
  className?: string;
}

export function BookmarkButton({ surahNumber, ayahNumber, className }: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if bookmark exists on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      checkBookmark();
    } else {
      setIsChecking(false);
    }
  }, [status, session, surahNumber, ayahNumber]);

  const checkBookmark = async () => {
    try {
      const response = await fetch(`/api/bookmarks`);
      if (response.ok) {
        const data = await response.json();
        const exists = data.bookmarks?.some(
          (b: any) => b.surahNumber === surahNumber && b.ayahNumber === (ayahNumber || null)
        );
        setIsBookmarked(exists);
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBookmark = async () => {
    // If not authenticated, redirect to sign-in with callback
    if (status !== 'authenticated' || !session?.user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentPath)}&bookmark=true&surahNumber=${surahNumber}&ayahNumber=${ayahNumber || ''}`);
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Delete bookmark
        const response = await fetch(
          `/api/bookmarks/${surahNumber}${ayahNumber ? `/${ayahNumber}` : ''}`,
          { method: 'DELETE' }
        );
        if (response.ok) {
          setIsBookmarked(false);
        }
      } else {
        // Create bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surahNumber, ayahNumber }),
        });
        if (response.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
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
          // Save bookmark directly without calling handleBookmark to avoid recursion
          const saveBookmark = async () => {
            setIsLoading(true);
            try {
              const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ surahNumber, ayahNumber }),
              });
              if (response.ok) {
                setIsBookmarked(true);
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
              }
            } catch (error) {
              console.error('Error saving bookmark:', error);
            } finally {
              setIsLoading(false);
            }
          };
          saveBookmark();
        }
      }
    }
  }, [status, session, surahNumber, ayahNumber]);

  if (isChecking) {
    return null; // Don't show while checking
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md',
        'transition-colors duration-200',
        isBookmarked
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="text-xs font-medium">
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  );
}
