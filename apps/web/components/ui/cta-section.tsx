// Call-to-Action Section Component
// Converts visitors to users - drives exploration and sign-ups
// Follows Atomic Design - Organism component
// Repainted to the calm language: a centred closing note, one teal primary
// action and a hairline secondary — no shimmer, no gradient wash.

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section className={cn("w-full bg-surface py-12 md:py-16 lg:py-20", className)}>
      <Container className="max-w-[960px]">
        {/* The closing note stays centred — it reads better as an invitation */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Headline */}
          <Heading 
            level={2} 
            className="font-heading text-[clamp(24px,3.4vw,36px)] font-bold leading-[1.25] tracking-[-0.03em] text-ink"
          >
            Begin Your Journey{' '}
            <span className="whitespace-nowrap text-accent">
              Today
            </span>
          </Heading>

          {/* Subheadline */}
          <Text className="mx-auto mt-3.5 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            Start reading, listening, and studying the Holy Quran now. No sign-up required to explore.
          </Text>
          <Text className="mx-auto mt-2 text-[13px] leading-[1.75] text-ink-soft md:text-sm">
            The Prophet ﷺ said: <span>"Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection."</span>
          </Text>

          {/* CTAs */}
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row md:mt-8">
            {/* Primary CTA */}
            <Link
              href="/quran"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong sm:w-auto"
            >
              Explore the Quran
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/sign-in"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-5 py-3 text-xs font-semibold text-accent-strong transition-colors hover:border-accent/40 hover:bg-accent-soft sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </div>

          {/* Value Reinforcement */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted md:mt-9">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span className="font-medium">Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span className="font-medium">Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              <span className="font-medium">Accessible</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
