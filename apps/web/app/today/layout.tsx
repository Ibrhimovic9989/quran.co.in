import type { Metadata } from 'next';

// Date-based cache buster — WhatsApp/Twitter re-fetch the image each day
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const OG_IMAGE = `https://quran.co.in/api/og/today?d=${today}`;

export const metadata: Metadata = {
  title: 'Verse of the Day — Quran.co.in',
  description:
    "Read and share today's Quranic verse. A beautiful ayah from the Holy Quran, chosen daily — in Arabic with English translation. Share on WhatsApp, Twitter, and more.",
  alternates: { canonical: 'https://quran.co.in/today' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/today',
    title: 'Verse of the Day — Quran.co.in',
    description: "A beautiful ayah from the Quran, shared daily. Read, reflect, and share.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Verse of the Day — Quran.co.in' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verse of the Day — Quran.co.in',
    description: "A beautiful ayah from the Quran, shared daily. Read, reflect, and share.",
    images: [OG_IMAGE],
  },
};

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
