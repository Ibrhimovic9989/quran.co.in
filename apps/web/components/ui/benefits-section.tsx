// Benefits Section Component
// Connects with users' deeper motivations and emotional needs
// Follows Atomic Design - Organism component
// Repainted to the calm language: white cards, hairline borders, pastel
// icon chips — no gradient tints behind the text, no lift-on-hover.

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
  tint: string;
}

const benefits: Benefit[] = [
  {
    icon: <IconHeartHandshake className="w-5 h-5" />,
    title: 'Spiritual Growth',
    description: "Deepen your connection with Allah's words through daily reflection and study. Experience the transformative power of consistent engagement with the Quran.",
    tint: 'bg-tint-sage',
  },
  {
    icon: <IconBrain className="w-5 h-5" />,
    title: 'Knowledge & Understanding',
    description: 'Gain clarity on complex verses with expert commentary and multiple perspectives. The Prophet ﷺ said: <em>"Seeking knowledge is an obligation upon every Muslim."</em> Understand the deeper meanings and wisdom within each ayah.',
    tint: 'bg-tint-sky',
  },
  {
    icon: <IconDeviceMobile className="w-5 h-5" />,
    title: 'Convenience & Accessibility',
    description: 'Study at your own pace, anywhere, anytime. No need for multiple books or apps. Everything you need is in one beautiful, accessible platform.',
    tint: 'bg-tint-lavender',
  },
  {
    icon: <IconUsers className="w-5 h-5" />,
    title: 'Community & Learning',
    description: 'Join a community dedicated to understanding and living by the Quran\'s teachings. Share insights and grow together in your spiritual journey.',
    tint: 'bg-tint-peach',
  },
];

export function BenefitsSection({ className }: BenefitsSectionProps) {
  return (
    <section className={cn("w-full bg-paper py-10 md:py-14 lg:py-16", className)}>
      <Container className="max-w-[960px]">
        {/* Section Header — left-aligned */}
        <div className="max-w-2xl">
          <Heading 
            level={2} 
            className="font-heading text-[clamp(22px,3vw,30px)] font-bold leading-[1.3] tracking-[-0.03em] text-ink"
          >
            Transform Your Relationship with the{' '}
            <span className="whitespace-nowrap text-accent">
              Quran
            </span>
          </Heading>
          <Text className="mt-3 text-[14px] leading-[1.75] text-muted md:text-[15px]">
            More than just reading—experience a deeper connection that enriches your spiritual life and understanding. Allah says: <span className="italic">"So remember Me; I will remember you."</span> — Al-Baqarah 2:152
          </Text>
        </div>

        {/* Benefits Grid */}
        <div className="mt-7 grid grid-cols-1 gap-3 md:mt-9 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className={cn(
                "rounded-2xl border border-line bg-surface p-5 shadow-none",
                "transition-all duration-200 hover:border-accent/30 hover:shadow-card"
              )}
            >
              {/* Icon chip */}
              <div className="mb-4">
                <div className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft",
                  benefit.tint
                )}>
                  {benefit.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <Heading level={3} className="font-heading text-base font-bold tracking-[-0.02em] text-ink md:text-[17px]">
                  {benefit.title}
                </Heading>
                <p
                  className="mt-1.5 text-xs leading-[1.75] text-muted md:text-[13px]"
                  dangerouslySetInnerHTML={{ __html: benefit.description }}
                />
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
