// Benefits Section Component
// Connects with users' deeper motivations and emotional needs
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

'use client';

import { Container } from './container';
import { Heading, Text } from './typography';
import { Card } from './card';
import { 
  IconHeartHandshake,
  IconBrain,
  IconDeviceMobile,
  IconUsers
} from '@tabler/icons-react';
import { cn } from '@/lib/utils/cn';

interface BenefitsSectionProps {
  className?: string;
}

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const benefits: Benefit[] = [
  {
    icon: <IconHeartHandshake className="w-8 h-8" />,
    title: 'Spiritual Growth',
    description: "Deepen your connection with Allah's words through daily reflection and study. Experience the transformative power of consistent engagement with the Quran.",
    gradient: 'from-emerald-50 to-emerald-100/30',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: <IconBrain className="w-8 h-8" />,
    title: 'Knowledge & Understanding',
    description: 'Gain clarity on complex verses with expert commentary and multiple perspectives. The Prophet ﷺ said: <em>"Seeking knowledge is an obligation upon every Muslim."</em> Understand the deeper meanings and wisdom within each ayah.',
    gradient: 'from-blue-50 to-blue-100/30',
    iconBg: 'bg-blue-100',
  },
  {
    icon: <IconDeviceMobile className="w-8 h-8" />,
    title: 'Convenience & Accessibility',
    description: 'Study at your own pace, anywhere, anytime. No need for multiple books or apps. Everything you need is in one beautiful, accessible platform.',
    gradient: 'from-purple-50 to-purple-100/30',
    iconBg: 'bg-purple-100',
  },
  {
    icon: <IconUsers className="w-8 h-8" />,
    title: 'Community & Learning',
    description: 'Join a community dedicated to understanding and living by the Quran\'s teachings. Share insights and grow together in your spiritual journey.',
    gradient: 'from-amber-50 to-amber-100/30',
    iconBg: 'bg-amber-100',
  },
];

export function BenefitsSection({ className }: BenefitsSectionProps) {
  return (
    <section className={cn("w-full py-8 md:py-16 lg:py-20 bg-white", className)}>
      <Container>
        {/* Section Header - Mobile optimized */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <Heading 
            level={2} 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
          >
            Transform Your Relationship with the{' '}
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent whitespace-nowrap">
              Quran
            </span>
          </Heading>
          <Text className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            More than just reading—experience a deeper connection that enriches your spiritual life and understanding. Allah says: <span className="italic">"So remember Me; I will remember you."</span> — Al-Baqarah 2:152
          </Text>
        </div>

        {/* Benefits Grid - Mobile optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden border border-gray-200 hover:border-gray-300",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                `bg-gradient-to-br ${benefit.gradient}`,
                "group/benefit"
              )}
            >
              {/* Icon Container - Mobile optimized */}
              <div className="mb-3 md:mb-5">
                <div className={cn(
                  "inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl",
                  benefit.iconBg,
                  "text-gray-900 shadow-sm group-hover/benefit:scale-110 transition-transform duration-300"
                )}>
                  {benefit.icon}
                </div>
              </div>

              {/* Content - Mobile optimized */}
              <div className="space-y-1.5 md:space-y-3">
                <Heading level={3} className="text-lg md:text-2xl font-bold text-gray-900">
                  {benefit.title}
                </Heading>
                <p className="text-xs md:text-base text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: benefit.description }} />
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/benefit:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
