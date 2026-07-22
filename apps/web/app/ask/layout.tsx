import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask the Quran — AI-Powered Quran Search',
  description:
    'Ask any question about the Quran and get answers grounded in semantically matched ayahs. Every response is cited with references to the original Arabic and translation. Powered by AI.',
  alternates: { canonical: 'https://quran.co.in/ask' },
  openGraph: {
    type: 'website',
    url: 'https://quran.co.in/ask',
    title: 'Ask the Quran — AI-Powered Quran Search',
    description: 'Ask any question and get answers cited directly from the Quran. Semantic search across all 6,236 ayahs.',
  },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
