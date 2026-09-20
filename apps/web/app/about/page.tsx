// About Us Page
// Information about the mission and vision of Quran.co.in

import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'About Us — Quran.co.in',
  description: 'Learn about the mission, values, and team behind Quran.co.in — a free, authentic, and beautiful platform for reading and studying the Holy Quran.',
  openGraph: {
    title: 'About Us — Quran.co.in',
    description: 'Learn about the mission and values behind Quran.co.in.',
    type: 'website',
  },
};
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart, Shield, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper pb-16 pt-10 md:pt-14">
      <Container>
        {/* Header Section */}
        <div className="mb-12 max-w-3xl md:mb-16">
          <Heading level={1} className="font-heading text-[clamp(30px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.035em] text-ink">
            Our Mission: To Make the Quran Accessible to All
          </Heading>
          <Text className="mt-4 max-w-2xl text-[15px] leading-[1.75] text-muted">
            Quran.co.in is dedicated to providing a modern, beautiful, and authentic 
            digital experience for engaging with the Holy Word of Allah. Our goal is to 
            bridge the gap between traditional wisdom and modern technology.
          </Text>
        </div>

        {/* Vision/Values Grid */}
        <div className="mb-16 grid gap-3 md:grid-cols-2">
          <Card className="rounded-2xl border border-line bg-surface p-6 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-tint-sage text-ink-soft">
              <Shield className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">Authenticity First</Heading>
            <Text className="mt-2 text-[13px] leading-[1.75] text-muted">
              Every translation, recitation, and piece of commentary on our platform is carefully 
              sourced from recognized Islamic scholars and reputable institutions to ensure the 
              highest level of accuracy.
            </Text>
          </Card>

          <Card className="rounded-2xl border border-line bg-surface p-6 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-tint-sky text-ink-soft">
              <Heart className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">User-Centric Design</Heading>
            <Text className="mt-2 text-[13px] leading-[1.75] text-muted">
              We believe that studying the Quran should be a peaceful and distraction-free experience. 
              Our interface is designed to be elegant, fast, and accessible on any device.
            </Text>
          </Card>

          <Card className="rounded-2xl border border-line bg-surface p-6 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-tint-lavender text-ink-soft">
              <Globe className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">Global Reach</Heading>
            <Text className="mt-2 text-[13px] leading-[1.75] text-muted">
              The Quran is for all humanity. We strive to provide multiple languages and 
              diverse recitations to cater to students of the Quran from all walks of life, 
              regardless of their native tongue.
            </Text>
          </Card>

          <Card className="rounded-2xl border border-line bg-surface p-6 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-tint-peach text-ink-soft">
              <BookOpen className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">Lifelong Learning</Heading>
            <Text className="mt-2 text-[13px] leading-[1.75] text-muted">
              Whether you are reading the Quran for the first time or are a dedicated Hafiz, 
              our tools are built to support your journey of learning, understanding, and 
              remembrance.
            </Text>
          </Card>
        </div>

        {/* Story Section */}
        <div className="rounded-[22px] border border-line bg-surface p-6 md:p-12">
          <div className="max-w-3xl">
            <Heading level={2} className="font-heading text-[24px] font-bold tracking-[-0.03em] text-ink md:text-[30px]">Guided by Faith</Heading>
            <Text className="mt-5 text-[15px] italic leading-[1.8] text-ink-soft">
              "The best among you are those who learn the Quran and teach it." 
              <span className="mt-2 block text-xs font-semibold not-italic text-muted">— Prophet Muhammad (PBUH)</span>
            </Text>
            <Text className="mt-6 text-[13px] leading-[1.8] text-muted">
              This platform was built as a humble contribution to the global Muslim Ummah. 
              We are a team of developers, designers, and students of knowledge who wanted 
              to create a tool that we personally love to use every day. We hope it 
              benefits you as much as it has blessed us during its creation.
            </Text>
          </div>
        </div>
      </Container>
    </main>
  );
}
