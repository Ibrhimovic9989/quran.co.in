import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Quran.co.in',
  description: 'Get in touch with the Quran.co.in team. We typically respond within 24–48 hours.',
  openGraph: {
    title: 'Contact Us — Quran.co.in',
    description: 'Reach out to the Quran.co.in team with questions, feedback, or support requests.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
