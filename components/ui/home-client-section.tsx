'use client';

import { BookmarksProvider } from '@/components/quran/bookmarks-provider';
import { ContinueReading } from '@/components/quran/continue-reading';
import { TimeGreeting } from '@/components/ui/time-greeting';
import { Container } from '@/components/ui/container';

export function HomeClientSection() {
  return (
    <section className="pt-6 pb-0">
      <Container>
        <TimeGreeting />
        <BookmarksProvider>
          <ContinueReading />
        </BookmarksProvider>
      </Container>
    </section>
  );
}
