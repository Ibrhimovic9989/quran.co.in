// Call-to-Action Section Component
// Converts visitors to users - drives exploration and sign-ups
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { ShimmerButton } from './atoms';
import { ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white", className)}>
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline - Mobile optimized */}
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Begin Your Journey{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Today
            </span>
          </Heading>

          {/* Subheadline - Mobile optimized */}
          <Text className="text-sm md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto mb-2 md:mb-3 leading-relaxed">
            Start reading, listening, and studying the Holy Quran now. No sign-up required to explore.
          </Text>
          <Text className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 italic">
            The Prophet ﷺ said: <span>"Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection."</span>
          </Text>

          {/* CTAs - Mobile optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 md:gap-4 mb-6 md:mb-10">
            {/* Primary CTA */}
            <Link href="/quran" className="group w-full sm:w-auto">
              <ShimmerButton
                background="rgba(0, 0, 0, 1)"
                shimmerColor="#ffffff"
                borderRadius="8px"
                className="w-full sm:w-auto text-white font-semibold px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-base hover:scale-105 transition-transform duration-200"
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  Explore the Quran
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </ShimmerButton>
            </Link>

            {/* Secondary CTA */}
            <Link href="/sign-in" className="w-full sm:w-auto">
              <ShimmerButton
                background="rgba(255, 255, 255, 1)"
                shimmerColor="#000000"
                borderRadius="8px"
                className="w-full sm:w-auto text-black font-semibold px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-base border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                  Create Account
                </span>
              </ShimmerButton>
            </Link>
          </div>

          {/* Value Reinforcement - Mobile optimized */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-900 rounded-full"></div>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-900 rounded-full"></div>
              <span className="font-medium">Complete</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-900 rounded-full"></div>
              <span className="font-medium">Authentic</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-900 rounded-full"></div>
              <span className="font-medium">Accessible</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
