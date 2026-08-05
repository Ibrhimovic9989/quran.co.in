import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maqāmāt — Learn the Melodies of Qurʾān Recitation',
  description:
    'Learn the maqāmāt, the melodic modes of Qurʾān recitation — Bayātī, Ḥijāz, Ṣabā, Nahāwand, Rast, Sīkāh, ʿAjam and Kurd. Free guided lessons that teach the shape of each melody on Sūrah al-Fātiḥah, with master reciters.',
  keywords: [
    'maqamat',
    'maqam Quran',
    'Quran recitation melodies',
    'learn Quran recitation',
    'maqam Bayati',
    'maqam Hijaz',
    'how to recite Quran beautifully',
    'tajweed maqamat',
    'Quran tilawah maqam',
  ],
  alternates: { canonical: 'https://quran.co.in/maqamat' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/maqamat',
    title: 'Maqāmāt — Learn the Melodies of Qurʾān Recitation',
    description:
      'Free guided lessons in the maqāmāt — the melodic modes of Qurʾān recitation — taught as a shape you can follow.',
    siteName: 'Quran.co.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Maqāmāt — Quran.co.in' }],
  },
  twitter: { card: 'summary_large_image', title: 'Maqāmāt — Learn the Melodies of Qurʾān Recitation' },
};

export default function MaqamatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
