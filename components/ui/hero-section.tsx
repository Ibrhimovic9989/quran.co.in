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
    <section className="w-full min-h-screen md:min-h-[90vh] bg-gradient-to-b from-white via-white to-gray-50/30 relative overflow-hidden flex items-center py-4 md:py-0">
      {/* Subtle background gradient for depth */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-20"
        fill="black"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center gap-0 md:gap-8 lg:gap-12">
          {/* Left content - Text & CTAs - Mobile First - Perfectly Balanced */}
          <div className="flex-1 w-full md:w-auto py-1 md:py-12 relative z-10 flex flex-col justify-center">
            {/* Badge/Trust Indicator - Mobile optimized - Balanced */}
            <div className="inline-flex items-center gap-1 mb-1.5 md:mb-3 px-2 py-0.5 bg-gray-100 rounded-full w-fit text-[10px] md:text-xs">
              <BookOpen className="w-2.5 h-2.5 text-gray-700" />
              <span className="font-medium text-gray-700">
                114 Surahs • Free
              </span>
            </div>

            {/* Main Headline - Mobile optimized - Balanced */}
            <Heading 
              level={1} 
              className="text-xl sm:text-2xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-1.5 md:mb-4 leading-[1.1] tracking-tight"
            >
              Your Gateway to the{' '}
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
                Holy Quran
              </span>
            </Heading>

            {/* Subheadline - Mobile optimized - Balanced */}
            <Text className="text-[10px] md:text-lg lg:text-xl text-gray-700 max-w-2xl mb-1.5 md:mb-3 leading-tight md:leading-relaxed">
              Read, listen, and study the divine words with beautiful translations, authentic recitations, and comprehensive tafsir.
            </Text>
            
            {/* Verse - Mobile optimized - Balanced */}
            <Text className="text-[9px] md:text-base text-gray-600 max-w-2xl mb-2 md:mb-6 leading-tight md:leading-relaxed">
              Allah says: <span className="italic">"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"</span>
            </Text>

            {/* Key Benefits - Mobile optimized - Balanced */}
            <div className="flex flex-wrap gap-1.5 mb-2 md:mb-6 md:flex-row md:gap-3">
              <div className="flex items-center gap-1 text-gray-700">
                <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                <span className="text-[10px] md:text-sm font-medium">5 Translation Languages</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                <span className="text-[10px] md:text-sm font-medium">Authentic Recitations</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                <span className="text-[10px] md:text-sm font-medium">Expert Commentary</span>
              </div>
            </div>

            {/* 3D Quran Scene - Mobile only, between text and buttons - Balanced */}
            <div className="flex-1 w-full relative min-h-[90px] flex items-center justify-center mb-2 md:hidden">
              <div className="relative w-full h-full max-w-[90px] scale-65">
                <Quran3D className="w-full h-full" autoRotate={true} />
                {/* Decorative elements - smaller on mobile */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-100 rounded-full blur-xl opacity-50"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-gray-100 rounded-full blur-xl opacity-30"></div>
              </div>
            </div>

            {/* CTA Buttons - Mobile optimized - Balanced */}
            <div className="flex flex-col gap-1.5 md:flex-row md:gap-3 mb-1.5 md:mb-4">
              {/* Primary CTA - Explore */}
              <Link href="/quran" className="group">
                <ShimmerButton
                  background="rgba(0, 0, 0, 1)"
                  shimmerColor="#ffffff"
                  borderRadius="8px"
                  className="w-full md:w-auto text-white font-semibold px-3 py-1.5 md:px-6 md:py-3 text-[11px] md:text-base hover:scale-105 transition-transform duration-200 border-gray-800"
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2 relative z-10">
                    Explore the Quran
                    <ArrowRight className="w-3 h-3 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </ShimmerButton>
              </Link>

              {/* Secondary CTA - Sign In */}
              <Link href="/sign-in">
                <ShimmerButton
                  background="rgba(255, 255, 255, 1)"
                  shimmerColor="#000000"
                  borderRadius="8px"
                  className="w-full md:w-auto text-black font-semibold px-3 py-1.5 md:px-6 md:py-3 text-[11px] md:text-base border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <span className="relative z-10">Sign In</span>
                </ShimmerButton>
              </Link>
            </div>

            {/* Trust Indicator - Mobile optimized - Balanced */}
            <div className="flex items-center gap-1 text-[10px] text-gray-600">
              <span>✓</span>
              <span>No sign-up required</span>
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
