'use client';

import { BookmarksProvider } from '@/components/quran/bookmarks-provider';
import { ContinueReading } from '@/components/quran/continue-reading';
import { AyahOfTheDay } from '@/components/quran/ayah-of-the-day';
import { TimeGreeting } from '@/components/ui/time-greeting';
import { Container } from '@/components/ui/container';

export function HomeClientSection() {
  return (
    // Carries the hero's paper straight down — the greeting is part of it.
    <section className="bg-paper pb-2 pt-2">
      <Container className="max-w-[960px]">
        <TimeGreeting />
        <BookmarksProvider>
          <ContinueReading />
        </BookmarksProvider>
        <AyahOfTheDay className="mt-4" />
      </Container>
    </section>
  );
}
