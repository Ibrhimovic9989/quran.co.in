import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore the Quran by Topic',
  description:
    'Browse Quranic ayahs by theme — patience, gratitude, forgiveness, family, and more. Semantic search powered by AI finds the most relevant verses for each topic across all 6,236 ayahs.',
  alternates: { canonical: 'https://quran.co.in/topics' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/topics',
    title: 'Explore the Quran by Topic — Quran.co.in',
    description: 'Find Quranic verses by theme using AI-powered semantic search. Patience, gratitude, forgiveness, and more.',
  },
};

export default function TopicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
