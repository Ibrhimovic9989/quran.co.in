// Features Showcase Section Component
// Demonstrates key functionalities with user benefits
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

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
  gradient: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: <IconBook className="w-8 h-8" />,
    title: 'Read with Multiple Translations',
    description: 'Access the complete Quran with translations in 5 languages. Switch between translations instantly to gain deeper understanding of each verse.',
    gradient: 'from-blue-50 to-blue-100/30',
    iconBg: 'bg-blue-100',
  },
  {
    icon: <IconHeadphones className="w-8 h-8" />,
    title: 'Beautiful Recitations',
    description: 'Listen to authentic recitations from renowned reciters worldwide. The Prophet ﷺ said: "And recite the Quran with measured recitation." Choose your preferred reciter and immerse yourself in the melodious verses.',
    gradient: 'from-emerald-50 to-emerald-100/30',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: <IconSchool className="w-8 h-8" />,
    title: 'Comprehensive Tafsir & Commentary',
    description: 'Access detailed explanations from respected scholars including Ibn Kathir, Maarif Ul Quran, and more. Understand context, meaning, and wisdom behind each verse.',
    gradient: 'from-purple-50 to-purple-100/30',
    iconBg: 'bg-purple-100',
  },
  {
    icon: <IconUser className="w-8 h-8" />,
    title: 'Your Personal Journey',
    description: 'Bookmark verses, track reading progress, and create notes. Make your study personal and meaningful as you build your relationship with the Quran.',
    gradient: 'from-amber-50 to-amber-100/30',
    iconBg: 'bg-amber-100',
  },
];

export function FeaturesShowcase({ className }: FeaturesShowcaseProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50", className)}>
      <Container>
        {/* Section Header - Mobile optimized */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Connect with the Quran
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-2 md:mb-3">
            Discover powerful features designed to enhance your Quranic study and reflection. The Prophet ﷺ said: <span className="italic">"Whoever recites a letter from the Book of Allah, he will be credited with a good deed, and a good deed gets a ten-fold reward."</span>
          </Text>
          <Text className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Here, you can read with multiple translations, listen to beautiful recitations, study with scholarly commentary, and track your journey—all in one place.
          </Text>
        </div>

        {/* Features Grid - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden border border-gray-200 hover:border-gray-300",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                `bg-gradient-to-br ${feature.gradient}`
              )}
            >
              {/* Icon Container - Mobile optimized */}
              <div className="mb-3 md:mb-5">
                <div className={cn(
                  "inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl",
                  feature.iconBg,
                  "text-gray-900 shadow-sm"
                )}>
                  {feature.icon}
                </div>
              </div>

              {/* Content - Mobile optimized */}
              <div className="space-y-1.5 md:space-y-3">
                <Heading level={3} className="text-base md:text-xl font-bold text-gray-900">
                  {feature.title}
                </Heading>
                <Text className="text-gray-700 leading-relaxed text-xs md:text-sm">
                  {feature.description}
                </Text>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
