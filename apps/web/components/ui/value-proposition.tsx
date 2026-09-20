// Value Proposition Section Component
// Answers "Why Quran.co.in?" - Differentiates from other platforms
// Follows Atomic Design - Organism component
// Repainted to the calm language: white cards, hairline borders, pastel
// icon chips, one teal accent — no gradient washes or heavy shadows.

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { Card } from './card';
import { cn } from '@/lib/utils/cn';
import {
  IconShield,
  IconBook,
  IconLanguage,
  IconMicrophone,
  IconSchool,
  IconDeviceDesktop,
  IconClock,
  IconSparkles,
} from '@tabler/icons-react';

interface ValuePropositionProps {
  className?: string;
}

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  tint: string;
}

const features: Feature[] = [
  {
    title: 'Authentic Translations',
    description: 'Verified translations from trusted scholars and reputable sources.',
    icon: <IconShield className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sage',
  },
  {
    title: 'Complete Collection',
    description: 'All 114 surahs with full Arabic text and multiple translations.',
    icon: <IconBook className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sky',
  },
  {
    title: 'Multiple Languages',
    description: 'Study in 5 languages: English, Bengali, Urdu, Turkish, Uzbek.',
    icon: <IconLanguage className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-lavender',
  },
  {
    title: 'Authentic Recitations',
    description: 'Beautiful recitations from renowned reciters worldwide.',
    icon: <IconMicrophone className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sun',
  },
  {
    title: 'Expert Commentary',
    description: 'Comprehensive tafsir from respected scholars including Ibn Kathir.',
    icon: <IconSchool className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-peach',
  },
  {
    title: 'Modern Interface',
    description: 'Beautiful, intuitive design crafted for reflection and study.',
    icon: <IconDeviceDesktop className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sage',
  },
  {
    title: 'Access Anywhere',
    description: 'Study at your own pace, anywhere, anytime on any device.',
    icon: <IconClock className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sky',
  },
  {
    title: 'Free Access',
    description: 'Complete access to all features without any cost or restrictions.',
    icon: <IconSparkles className="w-[18px] h-[18px]" />,
    tint: 'bg-tint-sun',
  },
];

export function ValueProposition({ className }: ValuePropositionProps) {
  return (
    <section className={cn("w-full bg-paper py-10 md:py-14 lg:py-16", className)}>
      <Container className="max-w-[960px]">
        {/* Section Header — left-aligned, matching the hero rhythm */}
        <div className="max-w-2xl">
          <Heading
            level={2}
            className="font-heading text-[clamp(22px,3vw,30px)] font-bold leading-[1.3] tracking-[-0.03em] text-ink"
          >
            Experience the Quran{' '}
            <span className="whitespace-nowrap text-accent">
              Like Never Before
            </span>
          </Heading>
          <Text className="mt-3 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            We've built a platform that combines authenticity, depth, and modern design to help you connect with the Holy Quran in meaningful ways.
          </Text>
          <Text className="mt-2 text-[13px] leading-[1.75] text-ink-soft md:text-[14px]">
            Allah says: <span>"And We send down of the Quran that which is healing and mercy for the believers."</span> — Al-Isra 17:82
          </Text>
        </div>

        {/* Features Grid */}
        <div className="mt-7 grid grid-cols-1 gap-3 md:mt-9 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  tint,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tint: string;
  index: number;
}) => {
  return (
    <Card
      className={cn(
        "flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-none",
        "transition-all duration-200 hover:border-accent/30 hover:shadow-card"
      )}
    >
      {/* Icon chip */}
      <span
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full text-ink-soft',
          tint
        )}
      >
        {icon}
      </span>

      {/* Title */}
      <div className="mt-4 font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">
        {title}
      </div>

      {/* Description */}
      <p className="mt-1.5 text-xs leading-[1.7] text-muted">
        {description}
      </p>
    </Card>
  );
};
