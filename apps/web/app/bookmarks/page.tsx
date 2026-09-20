// Bookmarks Page
// Lets authenticated users view and manage their saved bookmarks

'use client';

import { useSession } from '@/components/auth/auth-client';
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
  const { info, error: toastError } = useToast();

  const handleRemove = async (surahNumber: number, ayahNumber?: number) => {
    const ok = await toggle({ surahNumber, ayahNumber });
    if (ok) {
      info('Removed. May Allah bless your recitation.');
    } else {
      toastError('Failed to remove bookmark. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2.5" aria-label="Loading bookmarks...">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[22px] border border-line bg-surface px-6 py-16 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-tint-sun text-ink-soft">
          <Bookmark className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <Heading level={3} className="font-heading text-[19px] font-bold tracking-[-0.025em] text-ink">
          No bookmarks yet
        </Heading>
        <Text className="mt-2.5 max-w-sm text-[13px] leading-[1.75] text-muted">
          You don't have any bookmarks yet. You can bookmark ayahs that touch your heart to revisit them later.
        </Text>
        <Text className="mt-2 max-w-xs text-[11px] italic leading-[1.7] text-muted">
          Tap the bookmark icon on any verse while reading to save it here.
        </Text>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            <BookOpen className="h-4 w-4" />
            Go to Quran
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
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
            className="group flex items-center gap-2"
          >
            <Link href={surahUrl} className="flex-1">
              <Card className="cursor-pointer rounded-2xl border border-line bg-surface p-4 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint-sun text-ink-soft">
                      <BookmarkCheck className="h-4 w-4" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-[13px] font-bold leading-tight tracking-[-0.02em] text-ink">
                        {bookmark.surahNumber}. {surahName}
                      </p>
                      {bookmark.ayahNumber && (
                        <p className="mt-0.5 text-[11px] text-muted">Verse {bookmark.ayahNumber}</p>
                      )}
                      {bookmark.surah?.arabicName && (
                        <p className="text-base font-arabic text-ink-soft mt-1">{bookmark.surah.arabicName}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
                </div>
              </Card>
            </Link>
            <button
              onClick={() => handleRemove(bookmark.surahNumber, bookmark.ayahNumber ?? undefined)}
              className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove bookmark for ${surahName}`}
              title="Remove bookmark"
            >
              <Trash2 className="h-4 w-4" />
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
      <div className="flex min-h-[60vh] items-center justify-center bg-paper">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <BookmarksProvider>
      <main className="min-h-screen bg-paper">
        <Container>
          <div className="mx-auto max-w-2xl py-6 md:py-10">
            <div className="mb-7">
              <div className="mb-2 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-tint-sun text-ink-soft">
                  <Bookmark className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <Heading level={1} className="font-heading text-[24px] md:text-[30px] font-bold tracking-[-0.035em] text-ink">
                  Saved verses
                </Heading>
              </div>
              <Text className="text-[13px] leading-[1.7] text-muted">
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
