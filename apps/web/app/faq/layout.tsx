import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Quran.co.in',
  description: 'Frequently asked questions about Quran.co.in — a free, authentic, and ad-free platform for reading the Holy Quran.',
  openGraph: {
    title: 'FAQ — Quran.co.in',
    description: 'Find answers to common questions about Quran.co.in.',
    type: 'website',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
