// Home Page
// Landing page with hero section and 3D Quran scene
// Content is Quran/Hadith-led narrative

import type { Metadata } from 'next';
import { HeroSection } from '@/components/ui/hero-section';

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
import { HomeClientSection } from '@/components/ui/home-client-section';
import { ValueProposition } from '@/components/ui/value-proposition';
import { FeaturesShowcase } from '@/components/ui/features-showcase';
import { BenefitsSection } from '@/components/ui/benefits-section';
import { HowItWorks } from '@/components/ui/how-it-works';
import { TrustIndicators } from '@/components/ui/trust-indicators';
import { CTASection } from '@/components/ui/cta-section';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with 3D Quran Scene - Full width, no container */}
      <HeroSection />

      {/* Time-based greeting + Continue Reading card (client, localStorage-driven) */}
      <HomeClientSection />

      {/* Value Proposition Section */}
      <ValueProposition />

      {/* Features Showcase Section */}
      <FeaturesShowcase />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Trust Indicators Section */}
      <TrustIndicators />

      {/* Call-to-Action Section */}
      <CTASection />
    </main>
  );
}
