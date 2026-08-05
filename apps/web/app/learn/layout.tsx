import type { Metadata } from 'next';

// SEO metadata for the Learn-to-Read landing (the page itself is a client
// component, so the metadata lives here in a server layout).
export const metadata: Metadata = {
  title: 'Learn to Read the Qurʾān — Free Noorani Qāʿidah Course',
  description:
    'Learn to read Arabic and the Qurʾān from scratch, free. A step-by-step Noorani Qāʿidah course — the 29 letters, their forms, ḥarakāt, madd and basic tajwīd — for readers coming from transliteration. No signup, no ads.',
  keywords: [
    'learn to read Quran',
    'Noorani Qaida',
    'learn Arabic letters',
    'read Quran for beginners',
    'Quran for beginners',
    'learn Quran online free',
    'Qaida Noorania',
    'how to read Quran',
    'Arabic alphabet Quran',
    'learn tajweed',
  ],
  alternates: { canonical: 'https://quran.co.in/learn' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/learn',
    title: 'Learn to Read the Qurʾān — Free Noorani Qāʿidah Course',
    description:
      'A free, step-by-step course to read the Qurʾān from scratch — letters, vowels, and tajwīd — for transliteration readers.',
    siteName: 'Quran.co.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Learn to Read the Qurʾān — Quran.co.in' }],
  },
  twitter: { card: 'summary_large_image', title: 'Learn to Read the Qurʾān — Free Noorani Qāʿidah Course' },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
