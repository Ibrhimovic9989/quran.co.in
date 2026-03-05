// How It Works Section Component
// Reduces friction and shows simplicity of getting started
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

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
  gradient: string;
  iconBg: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <IconBook className="w-8 h-8" />,
    title: 'Browse Chapters',
    description: 'Explore 114 surahs organized for easy navigation. Find what you\'re looking for quickly and intuitively.',
    gradient: 'from-blue-50 to-blue-100/30',
    iconBg: 'bg-blue-100',
  },
  {
    number: 2,
    icon: <IconSettings className="w-8 h-8" />,
    title: 'Choose Your Experience',
    description: 'Select your preferred translation, reciter, and commentary. Customize your study experience to match your needs.',
    gradient: 'from-emerald-50 to-emerald-100/30',
    iconBg: 'bg-emerald-100',
  },
  {
    number: 3,
    icon: <IconHeadphones className="w-8 h-8" />,
    title: 'Read, Listen, Study',
    description: 'Engage with the text, audio, and tafsir at your own pace. Switch between reading and listening seamlessly.',
    gradient: 'from-purple-50 to-purple-100/30',
    iconBg: 'bg-purple-100',
  },
  {
    number: 4,
    icon: <IconBookmark className="w-8 h-8" />,
    title: 'Deepen Your Understanding',
    description: 'Bookmark verses, take notes, and track your progress. Make your study personal and meaningful.',
    gradient: 'from-amber-50 to-amber-100/30',
    iconBg: 'bg-amber-100',
  },
];

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50", className)}>
      <Container>
        {/* Section Header - Mobile optimized */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Getting Started is{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Simple
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Start your Quranic journey in just a few simple steps. No complexity, no barriers—just pure learning. As Allah says: <span className="italic">"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"</span> — Al-Qamar 54:17
          </Text>
        </div>

        {/* Steps Grid - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 max-w-7xl mx-auto items-stretch">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col">
              {/* Connector Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -z-10" style={{ width: 'calc(100% - 2rem)' }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <Card
                className={cn(
                  "relative overflow-hidden border border-gray-200 hover:border-gray-300",
                  "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  `bg-gradient-to-br ${step.gradient}`,
                  "group/step flex flex-col h-full"
                )}
              >
                {/* Step Number Badge - Mobile optimized */}
                <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4">
                  <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-bold text-xs md:text-sm shadow-sm">
                    {step.number}
                  </div>
                </div>

                {/* Icon Container - Mobile optimized */}
                <div className="mb-3 md:mb-5">
                  <div className={cn(
                    "inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl",
                    step.iconBg,
                    "text-gray-900 shadow-sm group-hover/step:scale-110 transition-transform duration-300"
                  )}>
                    {step.icon}
                  </div>
                </div>

                {/* Content - Mobile optimized */}
                <div className="space-y-1.5 md:space-y-3 flex-grow flex flex-col">
                  <Heading level={3} className="text-base md:text-xl font-bold text-gray-900">
                    {step.title}
                  </Heading>
                  <Text className="text-gray-700 leading-relaxed text-xs md:text-sm flex-grow">
                    {step.description}
                  </Text>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/step:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
