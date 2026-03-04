// Surah List Component
// Displays a list of surahs

import { SurahCard } from './surah-card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/typography';
import type { SurahInfo } from '@/types/quran-api';

interface SurahListProps {
  surahs: (SurahInfo & { surahNo: number })[];
}

export function SurahList({ surahs }: SurahListProps) {
  return (
    <Container>
      <div className="py-8">
        <Heading level={1} className="mb-8">
          The Holy Quran
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surahs.map((surah) => (
            <SurahCard key={surah.surahNo} surah={surah} />
          ))}
        </div>
      </div>
    </Container>
  );
}
