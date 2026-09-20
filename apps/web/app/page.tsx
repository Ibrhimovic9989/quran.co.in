// Home Page
// Landing page with hero section and 3D Quran scene
// Content is Quran/Hadith-led narrative

import type { Metadata } from 'next';
import { HeroSection } from '@/components/ui/hero-section';
import { DevReelBanner } from '@/components/ui/dev-reel-banner';
import { DuaBanner } from '@/components/ui/dua-banner';

export const metadata: Metadata = {
  title: 'Quran.co.in — Read the Holy Quran Online, Free',
  description:
    'Read the Holy Quran online in Arabic with English translation, transliteration, audio recitation by world-famous reciters, and tafsir. All 114 surahs, 6,236 ayahs. Free, beautiful, and fast.',
  alternates: { canonical: 'https://quran.co.in' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in',
    title: 'Quran.co.in — Read the Holy Quran Online, Free',
    description: 'Read, listen, and understand the Holy Quran. Arabic text, English translation, audio recitation, tafsir, and AI-powered search across all 6,236 ayahs.',
  },
};
export default function Home() {
  return (
    <main className="bg-paper">
      <HeroSection />
      <details className="mx-auto mb-8 max-w-[832px] border-y border-line px-4 sm:px-0">
        <summary className="cursor-pointer py-4 text-xs font-medium text-muted">Community & updates</summary>
        <div className="pb-4"><DuaBanner /><DevReelBanner /></div>
      </details>
    </main>
  );
}
