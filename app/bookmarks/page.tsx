// Bookmarks Page
// Lets authenticated users view and manage their saved bookmarks

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, ArrowRight, Trash2, BookOpen } from 'lucide-react';
import { BookmarksProvider, useBookmarks } from '@/components/quran/bookmarks-provider';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';

function BookmarksList() {
  const { bookmarks, isLoading, toggle } = useBookmarks();
  const { info } = useToast();

  const handleRemove = (surahNumber: number, ayahNumber?: number) => {
    toggle({ surahNumber, ayahNumber });
    info('Removed. May Allah bless your recitation.');
  };

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading bookmarks...">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bookmark className="w-10 h-10 text-amber-400" />
        </div>
        <Heading level={3} className="text-xl font-bold text-gray-900 mb-3">
          No bookmarks yet
        </Heading>
        <Text className="text-gray-500 max-w-sm mb-2">
          You don't have any bookmarks yet. You can bookmark ayahs that touch your heart to revisit them later.
        </Text>
        <Text className="text-gray-400 text-xs max-w-xs mb-8 italic">
          Tap the bookmark icon on any verse while reading to save it here.
        </Text>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Go to Quran
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => {
        const surahUrl = `/quran/${bookmark.surahNumber}${bookmark.ayahNumber ? `?ayah=${bookmark.ayahNumber}` : ''}`;
        const surahName = bookmark.surah
          ? bookmark.surah.englishNameTranslation
            ? `${bookmark.surah.englishName} (${bookmark.surah.englishNameTranslation})`
            : bookmark.surah.englishName
          : `Surah ${bookmark.surahNumber}`;

        return (
          <div
            key={bookmark.id}
            className="flex items-center gap-3 group"
          >
            <Link href={surahUrl} className="flex-1">
              <Card className="p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group-hover:bg-gray-50/50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {bookmark.surahNumber}. {surahName}
                      </p>
                      {bookmark.ayahNumber && (
                        <p className="text-xs text-gray-500 mt-0.5">Verse {bookmark.ayahNumber}</p>
                      )}
                      {bookmark.surah?.arabicName && (
                        <p className="text-base font-arabic text-gray-700 mt-1">{bookmark.surah.arabicName}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                </div>
              </Card>
            </Link>
            <button
              onClick={() => handleRemove(bookmark.surahNumber, bookmark.ayahNumber ?? undefined)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 shrink-0"
              aria-label={`Remove bookmark for ${surahName}`}
              title="Remove bookmark"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function BookmarksPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in?callbackUrl=/bookmarks');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <BookmarksProvider>
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
        <Container>
          <div className="py-8 md:py-12 max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-amber-600" />
                </div>
                <Heading level={1} className="text-2xl md:text-3xl font-bold text-gray-900">
                  My Bookmarks
                </Heading>
              </div>
              <Text className="text-gray-500">
                Your saved verses for quick access
              </Text>
            </div>
            <BookmarksList />
          </div>
        </Container>
      </main>
    </BookmarksProvider>
  );
}
