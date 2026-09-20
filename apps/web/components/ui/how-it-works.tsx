// How It Works Section Component
// Reduces friction and shows simplicity of getting started
// Follows Atomic Design - Organism component
// Repainted to the calm language: white cards on hairline borders, a quiet
// numbered badge, pastel icon chips — no gradient tiles, no lift-on-hover.

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { Card } from './card';
import { 
  IconBook,
  IconSettings,
  IconHeadphones,
  IconBookmark
} from '@tabler/icons-react';
import { cn } from '@/lib/utils/cn';

interface HowItWorksProps {
  className?: string;
}

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tint: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <IconBook className="w-5 h-5" />,
    title: 'Browse Chapters',
    description: 'Explore 114 surahs organized for easy navigation. Find what you\'re looking for quickly and intuitively.',
    tint: 'bg-tint-sky',
  },
  {
    number: 2,
    icon: <IconSettings className="w-5 h-5" />,
    title: 'Choose Your Experience',
    description: 'Select your preferred translation, reciter, and commentary. Customize your study experience to match your needs.',
    tint: 'bg-tint-sage',
  },
  {
    number: 3,
    icon: <IconHeadphones className="w-5 h-5" />,
    title: 'Read, Listen, Study',
    description: 'Engage with the text, audio, and tafsir at your own pace. Switch between reading and listening seamlessly.',
    tint: 'bg-tint-lavender',
  },
  {
    number: 4,
    icon: <IconBookmark className="w-5 h-5" />,
    title: 'Deepen Your Understanding',
    description: 'Bookmark verses, take notes, and track your progress. Make your study personal and meaningful.',
    tint: 'bg-tint-sun',
  },
];

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn("w-full bg-surface py-10 md:py-14 lg:py-16", className)}>
      <Container className="max-w-[960px]">
        {/* Section Header — left-aligned */}
        <div className="max-w-2xl">
          <Heading 
            level={2} 
            className="font-heading text-[clamp(22px,3vw,30px)] font-bold leading-[1.3] tracking-[-0.03em] text-ink"
          >
            Getting Started is{' '}
            <span className="whitespace-nowrap text-accent">
              Simple
            </span>
          </Heading>
          <Text className="mt-3 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            Start your Quranic journey in just a few simple steps. No complexity, no barriers—just pure learning. As Allah says: <span className="italic">"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"</span> — Al-Qamar 54:17
          </Text>
        </div>

        {/* Steps Grid */}
        <div className="mt-7 grid grid-cols-1 items-stretch gap-3 md:mt-9 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col">
              {/* Connector hairline (desktop only) */}
              {index < steps.length - 1 && (
                <div className="absolute left-full top-10 -z-10 hidden h-px w-full bg-line lg:block" style={{ width: 'calc(100% - 2rem)' }}>
                  <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-line"></div>
                </div>
              )}

              <Card
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-none",
                  "transition-all duration-200 hover:border-accent/30 hover:shadow-card"
                )}
              >
                {/* Step Number Badge — quiet */}
                <div className="absolute right-4 top-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-semibold text-muted">
                    {step.number}
                  </div>
                </div>

                {/* Icon chip */}
                <div className="mb-4">
                  <div className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft",
                    step.tint
                  )}>
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-grow flex-col">
                  <Heading level={3} className="font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">
                    {step.title}
                  </Heading>
                  <Text className="mt-1.5 flex-grow text-xs leading-[1.7] text-muted">
                    {step.description}
                  </Text>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
