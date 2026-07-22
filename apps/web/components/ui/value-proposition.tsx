// Value Proposition Section Component
// Answers "Why Quran.co.in?" - Differentiates from other platforms
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation with Hover Effects

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
}

const features: Feature[] = [
  {
    title: 'Authentic Translations',
    description: 'Verified translations from trusted scholars and reputable sources.',
    icon: <IconShield className="w-6 h-6" />,
  },
  {
    title: 'Complete Collection',
    description: 'All 114 surahs with full Arabic text and multiple translations.',
    icon: <IconBook className="w-6 h-6" />,
  },
  {
    title: 'Multiple Languages',
    description: 'Study in 5 languages: English, Bengali, Urdu, Turkish, Uzbek.',
    icon: <IconLanguage className="w-6 h-6" />,
  },
  {
    title: 'Authentic Recitations',
    description: 'Beautiful recitations from renowned reciters worldwide.',
    icon: <IconMicrophone className="w-6 h-6" />,
  },
  {
    title: 'Expert Commentary',
    description: 'Comprehensive tafsir from respected scholars including Ibn Kathir.',
    icon: <IconSchool className="w-6 h-6" />,
  },
  {
    title: 'Modern Interface',
    description: 'Beautiful, intuitive design crafted for reflection and study.',
    icon: <IconDeviceDesktop className="w-6 h-6" />,
  },
  {
    title: 'Access Anywhere',
    description: 'Study at your own pace, anywhere, anytime on any device.',
    icon: <IconClock className="w-6 h-6" />,
  },
  {
    title: 'Free Access',
    description: 'Complete access to all features without any cost or restrictions.',
    icon: <IconSparkles className="w-6 h-6" />,
  },
];

export function ValueProposition({ className }: ValuePropositionProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-white", className)}>
      <Container>
        {/* Section Header - Mobile optimized */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Experience the Quran{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Like Never Before
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-2 md:mb-3">
            We've built a platform that combines authenticity, depth, and modern design to help you connect with the Holy Quran in meaningful ways.
          </Text>
          <Text className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed italic">
            Allah says: <span>"And We send down of the Quran that which is healing and mercy for the believers."</span> — Al-Isra 17:82
          </Text>
        </div>

        {/* Features Grid with Hover Effects - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 max-w-7xl mx-auto">
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
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-gray-200 hover:border-gray-300",
        "transition-all duration-300 hover:shadow-xl group/feature",
        "flex flex-col"
      )}
    >
      {/* Hover gradient effect - top row */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      )}
      {/* Hover gradient effect - bottom row */}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
      )}
      
      {/* Icon - Mobile optimized */}
      <div className="mb-2.5 md:mb-3 relative z-10 text-gray-600 group-hover/feature:text-gray-900 transition-colors duration-300">
        {icon}
      </div>
      
      {/* Title with animated indicator - Mobile optimized */}
      <div className="text-sm md:text-lg font-bold mb-1.5 md:mb-2 relative z-10">
        <div className="absolute left-0 inset-y-0 h-4 md:h-5 group-hover/feature:h-6 w-0.5 md:w-1 rounded-tr-full rounded-br-full bg-gray-300 group-hover/feature:bg-gray-900 transition-all duration-300 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-300 inline-block text-gray-900 pl-2.5 md:pl-4">
          {title}
        </span>
      </div>
      
      {/* Description - Mobile optimized */}
      <p className="text-xs md:text-sm text-gray-600 relative z-10 leading-relaxed">
        {description}
      </p>
    </Card>
  );
};
