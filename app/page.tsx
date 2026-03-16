// Home Page
// Landing page with hero section and 3D Quran scene
// Content is Quran/Hadith-led narrative

import { HeroSection } from '@/components/ui/hero-section';
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
