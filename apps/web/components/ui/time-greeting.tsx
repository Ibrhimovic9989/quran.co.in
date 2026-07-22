'use client';

import { useEffect, useState } from 'react';
import { getLastReadSurah } from '@/lib/data/reading-progress';

interface Greeting {
  salutation: string;
  suggestion: string;
}

function buildGreeting(hour: number, lastSurahName?: string): Greeting {
  if (hour >= 4 && hour < 6) {
    return {
      salutation: 'Assalamu alaikum — a blessed Fajr time.',
      suggestion: lastSurahName
        ? `Continue where you left off: Surah ${lastSurahName}.`
        : 'Begin with Surah Al-Fatiha.',
    };
  }
  if (hour >= 6 && hour < 12) {
    return {
      salutation: 'Good morning.',
      suggestion: lastSurahName
        ? `Welcome back — continue Surah ${lastSurahName}.`
        : 'A beautiful morning to read Surah Yasin.',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      salutation: 'Assalamu alaikum.',
      suggestion: lastSurahName
        ? `Pick up Surah ${lastSurahName} where you left off.`
        : 'A good time to reflect on Surah Al-Baqarah.',
    };
  }
  if (hour >= 17 && hour < 20) {
    return {
      salutation: 'Good evening.',
      suggestion: lastSurahName
        ? `Continue your reading of Surah ${lastSurahName}.`
        : 'A beautiful time to recite Surah Al-Mulk.',
    };
  }
  return {
    salutation: 'Good night.',
    suggestion: lastSurahName
      ? `A quiet moment to return to Surah ${lastSurahName}.`
      : 'Recite the last two verses of Al-Baqarah before you sleep.',
  };
}

export function TimeGreeting() {
  const [greeting, setGreeting] = useState<Greeting | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const lastSurah = getLastReadSurah();
    setGreeting(buildGreeting(hour, lastSurah?.surahName));
  }, []);

  if (!greeting) return null;

  return (
    <div className="text-center mb-4 px-4">
      <p className="text-sm md:text-base text-gray-500 italic">
        {greeting.salutation}{' '}
        <span className="text-gray-400">{greeting.suggestion}</span>
      </p>
    </div>
  );
}
