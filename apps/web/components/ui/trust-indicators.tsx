// Trust Indicators Section Component
// Builds credibility and trust through quantifiable proof
// Follows Atomic Design - Organism component
// Repainted to the calm language: white stat cards with pastel icon chips
// and two quiet panels — no gradient tiles, no lift-on-hover.

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { Card } from './card';
import { 
  IconBook,
  IconLanguage,
  IconMicrophone,
  IconBook2,
  IconShieldCheck,
  IconStar,
  IconAdOff,
  IconLockOpen
} from '@tabler/icons-react';
import { cn } from '@/lib/utils/cn';

interface TrustIndicatorsProps {
  className?: string;
}

interface DataPoint {
  value: string;
  label: string;
  icon: React.ReactNode;
  tint: string;
}

const dataPoints: DataPoint[] = [
  {
    value: '114',
    label: 'Complete Surahs',
    icon: <IconBook className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sky',
  },
  {
    value: '5',
    label: 'Translation Languages',
    icon: <IconLanguage className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sage',
  },
  {
    value: 'Multiple',
    label: 'Authentic Recitations',
    icon: <IconMicrophone className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-lavender',
  },
  {
    value: 'Complete',
    label: 'Tafsir Collection',
    icon: <IconBook2 className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sun',
  },
];

const qualityIndicators = [
  {
    text: 'Verified translations from trusted sources',
    icon: <IconShieldCheck className="w-[18px] h-[18px]" />,
  },
  {
    text: 'Authentic recitations from renowned reciters',
    icon: <IconStar className="w-[18px] h-[18px]" />,
  },
  {
    text: 'Scholarly commentary from respected scholars',
    icon: <IconShieldCheck className="w-[18px] h-[18px]" />,
  },
];

const accessibilityStatements = [
  {
    text: 'Free access to the complete Quran',
    icon: <IconLockOpen className="w-[18px] h-[18px]" />,
  },
  {
    text: 'No ads, no distractions',
    icon: <IconAdOff className="w-[18px] h-[18px]" />,
  },
];

export function TrustIndicators({ className }: TrustIndicatorsProps) {
  return (
    <section className={cn("w-full bg-paper py-10 md:py-14 lg:py-16", className)}>
      <Container className="max-w-[960px]">
        {/* Section Header — left-aligned */}
        <div className="max-w-2xl">
          <Heading 
            level={2} 
            className="font-heading text-[clamp(22px,3vw,30px)] font-bold leading-[1.3] tracking-[-0.03em] text-ink"
          >
            Trusted by Thousands,{' '}
            <span className="whitespace-nowrap text-accent">
              Built for You
            </span>
          </Heading>
          <Text className="mt-3 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            We're committed to providing authentic, comprehensive, and accessible Quranic resources. Allah says: <span className="italic">"Indeed, it is We who sent down the Quran and indeed, We will be its guardian."</span> — Al-Hijr 15:9
          </Text>
        </div>

        {/* Data Points Grid */}
        <div className="mt-7 grid grid-cols-2 gap-3 md:mt-9 md:grid-cols-4">
          {dataPoints.map((point, index) => (
            <Card
              key={index}
              className={cn(
                "rounded-2xl border border-line bg-surface p-5 shadow-none",
                "transition-all duration-200 hover:border-accent/30 hover:shadow-card"
              )}
            >
              {/* Icon chip */}
              <div className="mb-3">
                <div className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft",
                  point.tint
                )}>
                  {point.icon}
                </div>
              </div>

              {/* Value */}
              <div className={cn(
                "font-heading font-bold tracking-[-0.03em] text-ink",
                point.value.length > 8 
                  ? "text-lg md:text-xl" 
                  : point.value.length > 5
                  ? "text-xl md:text-2xl"
                  : "text-2xl md:text-[32px]"
              )}>
                {point.value}
              </div>

              {/* Label */}
              <div className="mt-1 text-[11px] leading-[1.6] text-muted md:text-xs">
                {point.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Quality & Accessibility panels */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Quality Indicators */}
          <Card className="rounded-[22px] border border-line bg-surface p-6 shadow-none transition-all duration-200 hover:shadow-card">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                  <IconShieldCheck className="w-[18px] h-[18px]" />
                </div>
                <Heading level={3} className="font-heading text-base font-bold tracking-[-0.02em] text-ink md:text-[17px]">
                  Quality Assured
                </Heading>
              </div>
              <div className="space-y-3">
                {qualityIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0 text-accent">
                      {indicator.icon}
                    </div>
                    <Text className="text-xs leading-[1.7] text-muted md:text-[13px]">
                      {indicator.text}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Accessibility Statements */}
          <Card className="rounded-[22px] border border-line bg-surface p-6 shadow-none transition-all duration-200 hover:shadow-card">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tint-sky text-ink-soft">
                  <IconLockOpen className="w-[18px] h-[18px]" />
                </div>
                <Heading level={3} className="font-heading text-base font-bold tracking-[-0.02em] text-ink md:text-[17px]">
                  Free &amp; Accessible
                </Heading>
              </div>
              <div className="space-y-3">
                {accessibilityStatements.map((statement, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0 text-accent">
                      {statement.icon}
                    </div>
                    <Text className="text-xs leading-[1.7] text-muted md:text-[13px]">
                      {statement.text}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
