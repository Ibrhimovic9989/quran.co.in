import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verse of the Day — Quran.co.in',
  description:
    "Read and share today's Quranic verse. A beautiful ayah from the Holy Quran, chosen daily — in Arabic with English translation. Share on WhatsApp, Twitter, and more.",
  alternates: { canonical: 'https://quran.co.in/today' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/today',
    title: 'Verse of the Day — Quran.co.in',
    description: 'A beautiful ayah from the Quran, shared daily. Read, reflect, and share.',
    images: [
      {
        url: '/api/og?surah=2&ayah=286&surahName=Al-Baqarah&today=1&translation=Allah+does+not+burden+a+soul+beyond+that+it+can+bear.',
        width: 1200,
        height: 630,
        alt: 'Verse of the Day — Quran.co.in',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verse of the Day — Quran.co.in',
    description: 'A beautiful ayah from the Quran, shared daily. Read, reflect, and share.',
    images: ['/api/og?surah=2&ayah=286&surahName=Al-Baqarah&today=1&translation=Allah+does+not+burden+a+soul+beyond+that+it+can+bear.'],
  },
};

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
