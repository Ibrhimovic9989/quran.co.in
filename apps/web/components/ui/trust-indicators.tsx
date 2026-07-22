// Trust Indicators Section Component
// Builds credibility and trust through quantifiable proof
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

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
  gradient: string;
  iconBg: string;
}

const dataPoints: DataPoint[] = [
  {
    value: '114',
    label: 'Complete Surahs',
    icon: <IconBook className="w-6 h-6" />,
    gradient: 'from-blue-50 to-blue-100/30',
    iconBg: 'bg-blue-100',
  },
  {
    value: '5',
    label: 'Translation Languages',
    icon: <IconLanguage className="w-6 h-6" />,
    gradient: 'from-emerald-50 to-emerald-100/30',
    iconBg: 'bg-emerald-100',
  },
  {
    value: 'Multiple',
    label: 'Authentic Recitations',
    icon: <IconMicrophone className="w-6 h-6" />,
    gradient: 'from-purple-50 to-purple-100/30',
    iconBg: 'bg-purple-100',
  },
  {
    value: 'Complete',
    label: 'Tafsir Collection',
    icon: <IconBook2 className="w-6 h-6" />,
    gradient: 'from-amber-50 to-amber-100/30',
    iconBg: 'bg-amber-100',
  },
];

const qualityIndicators = [
  {
    text: 'Verified translations from trusted sources',
    icon: <IconShieldCheck className="w-5 h-5" />,
  },
  {
    text: 'Authentic recitations from renowned reciters',
    icon: <IconStar className="w-5 h-5" />,
  },
  {
    text: 'Scholarly commentary from respected scholars',
    icon: <IconShieldCheck className="w-5 h-5" />,
  },
];

const accessibilityStatements = [
  {
    text: 'Free access to the complete Quran',
    icon: <IconLockOpen className="w-5 h-5" />,
  },
  {
    text: 'No ads, no distractions',
    icon: <IconAdOff className="w-5 h-5" />,
  },
];

export function TrustIndicators({ className }: TrustIndicatorsProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/30", className)}>
      <Container>
        {/* Section Header - Mobile optimized */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Trusted by Thousands,{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Built for You
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            We're committed to providing authentic, comprehensive, and accessible Quranic resources. Allah says: <span className="italic">"Indeed, it is We who sent down the Quran and indeed, We will be its guardian."</span> — Al-Hijr 15:9
          </Text>
        </div>

        {/* Data Points Grid - Mobile optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 lg:gap-6 mb-8 md:mb-12 max-w-6xl mx-auto">
          {dataPoints.map((point, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden border border-gray-200 hover:border-gray-300",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                `bg-gradient-to-br ${point.gradient}`,
                "text-center group/data"
              )}
            >
              {/* Icon - Mobile optimized */}
              <div className="mb-2 md:mb-3 flex justify-center">
                <div className={cn(
                  "inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-14 rounded-md md:rounded-xl",
                  point.iconBg,
                  "text-gray-900 shadow-sm group-hover/data:scale-110 transition-transform duration-300"
                )}>
                  {point.icon}
                </div>
              </div>

              {/* Value - Mobile optimized */}
              <div className={cn(
                "font-bold text-gray-900 mb-1 md:mb-2",
                point.value.length > 8 
                  ? "text-lg md:text-2xl lg:text-3xl" 
                  : point.value.length > 5
                  ? "text-xl md:text-3xl lg:text-4xl"
                  : "text-2xl md:text-4xl lg:text-5xl"
              )}>
                {point.value}
              </div>

              {/* Label - Mobile optimized */}
              <div className="text-[10px] md:text-sm text-gray-700 font-medium leading-tight">
                {point.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Quality & Accessibility Grid - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {/* Quality Indicators */}
          <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="space-y-2.5 md:space-y-4">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
                <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-xl bg-emerald-100 text-emerald-700">
                  <IconShieldCheck className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <Heading level={3} className="text-lg md:text-2xl font-bold text-gray-900">
                  Quality Assured
                </Heading>
              </div>
              <div className="space-y-2.5 md:space-y-4">
                {qualityIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <div className="flex-shrink-0 mt-0.5 text-gray-600">
                      {indicator.icon}
                    </div>
                    <Text className="text-xs md:text-base text-gray-700 leading-relaxed">
                      {indicator.text}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Accessibility Statements */}
          <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="space-y-2.5 md:space-y-4">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
                <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-xl bg-blue-100 text-blue-700">
                  <IconLockOpen className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <Heading level={3} className="text-lg md:text-2xl font-bold text-gray-900">
                  Free & Accessible
                </Heading>
              </div>
              <div className="space-y-2.5 md:space-y-4">
                {accessibilityStatements.map((statement, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <div className="flex-shrink-0 mt-0.5 text-gray-600">
                      {statement.icon}
                    </div>
                    <Text className="text-xs md:text-base text-gray-700 leading-relaxed">
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
