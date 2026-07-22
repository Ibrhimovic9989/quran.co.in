import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center — Quran.co.in',
  description: 'Find guides, articles, and answers to help you get the most out of Quran.co.in.',
  openGraph: {
    title: 'Help Center — Quran.co.in',
    description: 'Search for help articles and support resources on Quran.co.in.',
    type: 'website',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
