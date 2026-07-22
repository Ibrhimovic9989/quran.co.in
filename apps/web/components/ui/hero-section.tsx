// Hero Section Component
// Landing page hero with improved UX and content strategy alignment
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

'use client';

import { Spotlight } from './spotlight';
import { Quran3D } from './quran-3d';
import { Heading, Text } from './typography';
import { ShimmerButton } from './atoms';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  // Props for future customization
}

export function HeroSection({}: HeroSectionProps) {
  return (
    <section className="w-full min-h-[calc(100vh-64px)] md:min-h-screen bg-gradient-to-b from-white via-white to-gray-50/30 relative overflow-hidden flex flex-col items-center justify-start md:justify-center pt-10 md:pt-0 pb-16 md:pb-0">
      {/* Subtle background gradient for depth */}
      <Spotlight
        className="-top-60 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-60 md:-top-20 opacity-[0.12] md:opacity-20 pointer-events-none"
        fill="black"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12">
          {/* Main Content - Text & CTAs - Mobile Centered */}
          <div className="flex-1 w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left">
            {/* Badge/Trust Indicator */}
            <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 bg-gray-100/80 backdrop-blur-sm rounded-full text-[10px] md:text-xs">
              <BookOpen className="w-3 h-3 text-gray-700" />
              <span className="font-semibold text-gray-700 uppercase tracking-wider">
                114 Surahs • Free
              </span>
            </div>

            {/* Main Headline */}
            <Heading 
              level={1} 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight"
            >
              Your Gateway to the{' '}
              <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent">
                Holy Quran
              </span>
            </Heading>

            {/* Subheadline */}
            <Text className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mb-4 leading-relaxed">
              Read, listen, and study the divine words with beautiful translations, authentic recitations, and comprehensive tafsir.
            </Text>
            
            {/* Verse */}
            <div className="mb-6 max-w-xl">
              <Text className="text-xs sm:text-sm md:text-base text-gray-500 italic">
                Allah says: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?"
              </Text>
            </div>

            {/* Key Benefits - Desktop Only */}
            <div className="hidden md:flex flex-wrap gap-3 mb-8">
              {['5 Translation Languages', 'Authentic Recitations', 'Expert Commentary'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* 3D Quran Scene - Mobile only (Prominent middle position) */}
            <div className="w-full aspect-square max-w-[180px] sm:max-w-[220px] relative flex items-center justify-center mb-8 md:hidden">
              <div className="relative w-full h-full transform scale-125">
                <Quran3D className="w-full h-full" autoRotate={true} />
                {/* Visual shadow to ground the object */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/5 blur-2xl rounded-full"></div>
              </div>
            </div>

            {/* CTA Buttons - Premium Styled */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-6">
              {/* Primary CTA - Explore */}
              <Link href="/quran" className="w-full sm:w-auto group">
                <ShimmerButton
                  background="rgba(0, 0, 0, 1)"
                  shimmerColor="#ffffff"
                  borderRadius="10px"
                  className="w-full text-white font-bold px-8 py-3.5 text-sm md:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center"
                >
                  <span className="flex items-center gap-2 relative z-10">
                    Explore the Quran
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </ShimmerButton>
              </Link>

              {/* Secondary CTA - Sign In */}
              <Link href="/sign-in" className="w-full sm:w-auto">
                <ShimmerButton
                  background="rgba(255, 255, 255, 1)"
                  shimmerColor="#e2e8f0"
                  borderRadius="10px"
                  className="w-full text-black font-semibold px-8 py-3.5 text-sm md:text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
                >
                  <span className="relative z-10">Sign In</span>
                </ShimmerButton>
              </Link>
            </div>

            {/* Mobile Footer Trust Element */}
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 font-medium opacity-80 uppercase tracking-wide">
              <span className="text-emerald-600">✓</span>
              <span>No sign-up required • Free for everyone</span>
            </div>
          </div>

          {/* Right content - 3D Quran Scene - Desktop only */}
          <div className="hidden md:flex flex-1 w-full md:w-auto relative min-h-[400px] lg:min-h-[500px] items-center justify-center">
            <div className="relative w-full h-full max-w-md lg:max-w-lg">
              <Quran3D className="w-full h-full" autoRotate={true} />
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
