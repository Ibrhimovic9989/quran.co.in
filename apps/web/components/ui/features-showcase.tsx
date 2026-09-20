// Features Showcase Section Component
// Demonstrates key functionalities with user benefits
// Follows Atomic Design - Organism component
// Repainted to the calm language: pastel tiles on white, generous radii,
// no gradient washes and no lift-on-hover.

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { Card } from './card';
import { 
  IconBook, 
  IconHeadphones, 
  IconSchool, 
  IconUser 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils/cn';

interface FeaturesShowcaseProps {
  className?: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tint: string;
}

const features: Feature[] = [
  {
    icon: <IconBook className="w-5 h-5" />,
    title: 'Read with Multiple Translations',
    description: 'Access the complete Quran with translations in 5 languages. Switch between translations instantly to gain deeper understanding of each verse.',
    tint: 'bg-tint-sky',
  },
  {
    icon: <IconHeadphones className="w-5 h-5" />,
    title: 'Beautiful Recitations',
    description: 'Listen to authentic recitations from renowned reciters worldwide. The Prophet ﷺ said: "And recite the Quran with measured recitation." Choose your preferred reciter and immerse yourself in the melodious verses.',
    tint: 'bg-tint-sage',
  },
  {
    icon: <IconSchool className="w-5 h-5" />,
    title: 'Comprehensive Tafsir & Commentary',
    description: 'Access detailed explanations from respected scholars including Ibn Kathir, Maarif Ul Quran, and more. Understand context, meaning, and wisdom behind each verse.',
    tint: 'bg-tint-lavender',
  },
  {
    icon: <IconUser className="w-5 h-5" />,
    title: 'Your Personal Journey',
    description: 'Bookmark verses, track reading progress, and create notes. Make your study personal and meaningful as you build your relationship with the Quran.',
    tint: 'bg-tint-sun',
  },
];

export function FeaturesShowcase({ className }: FeaturesShowcaseProps) {
  return (
    <section className={cn("w-full bg-surface py-10 md:py-14 lg:py-16", className)}>
      <Container className="max-w-[960px]">
        {/* Section Header — left-aligned */}
        <div className="max-w-2xl">
          <Heading 
            level={2} 
            className="font-heading text-[clamp(22px,3vw,30px)] font-bold leading-[1.3] tracking-[-0.03em] text-ink"
          >
            Everything You Need to{' '}
            <span className="whitespace-nowrap text-accent">
              Connect with the Quran
            </span>
          </Heading>
          <Text className="mt-3 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            Discover powerful features designed to enhance your Quranic study and reflection. The Prophet ﷺ said: <span className="italic">"Whoever recites a letter from the Book of Allah, he will be credited with a good deed, and a good deed gets a ten-fold reward."</span>
          </Text>
          <Text className="mt-2 text-[13px] leading-[1.75] text-ink-soft md:text-[14px]">
            Here, you can read with multiple translations, listen to beautiful recitations, study with scholarly commentary, and track your journey—all in one place.
          </Text>
        </div>

        {/* Features Grid — pastel tiles, the hero's "wider doors" voice */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-9">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "rounded-[22px] border-transparent p-5 shadow-none transition-opacity duration-200 hover:opacity-95",
                feature.tint
              )}
            >
              {/* Icon chip */}
              <div className="mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-soft">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <Heading level={3} className="font-heading text-[15px] font-bold tracking-[-0.02em] text-ink md:text-base">
                  {feature.title}
                </Heading>
                <Text className="mt-1.5 text-xs leading-[1.75] text-ink-soft md:text-[13px]">
                  {feature.description}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
