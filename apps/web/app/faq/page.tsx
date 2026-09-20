// FAQ Page
// Frequently Asked Questions with accordion UI

'use client';

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Is Quran.co.in completely free?',
    answer: 'Yes, Quran.co.in is 100% free to use. There are no subscription fees, and we do not display any advertisements. Our mission is to provide an accessible and distraction-free platform for everyone.'
  },
  {
    question: 'Where do the translations come from?',
    answer: 'We use globally recognized and authentic translations, such as the Sahih International and the Clear Quran by Dr. Mustafa Khattab. We are continuously adding more languages to serve a global audience.'
  },
  {
    question: 'Can I listen to recitations offline?',
    answer: 'Currently, the app requires an internet connection for streaming audio. However, we are working on a feature that will allow users to download specific Surahs for offline listening in the future.'
  },
  {
    question: 'Is a sign-up required to read the Quran?',
    answer: 'No, you can read and listen to the entire Quran without creating an account. Signing up is optional and allows you to sync your preferences, bookmarks, and progress across different devices.'
  },
  {
    question: 'How can I support this project?',
    answer: 'The best way to support us is to use the app and share it with others. If you would like to contribute technically or report issues, please visit our Contact page.'
  },
  {
    question: 'Are there any plans for a mobile app (iOS/Android)?',
    answer: 'Quran.co.in is built as a Progressive Web App (PWA), meaning it works beautifully on mobile browsers and can be "installed" on your home screen to feel like a native app. We are exploring dedicated native apps for the future.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-paper pb-12 pt-6 md:pt-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 md:mb-10">
            <Heading level={1} className="font-heading text-[24px] md:text-[30px] font-bold leading-[1.2] tracking-[-0.035em] text-ink">Common questions</Heading>
            <Text className="mt-3.5 max-w-xl text-[15px] leading-[1.7] text-muted">
              Find answers to common questions about using Quran.co.in, our sources, and our mission.
            </Text>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden rounded-2xl border border-line bg-surface p-0 shadow-none transition-all ${openIndex === index ? 'border-accent/30' : 'hover:border-accent/30'}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="group flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 text-accent transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    {openIndex === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="border-t border-line-soft bg-surface-warm p-5 text-[13px] leading-[1.8] text-muted">
                    {faq.answer}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Card */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[22px] border border-line bg-accent-soft p-6 md:flex-row md:items-center">
            <div>
              <Heading level={4} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">Still have questions?</Heading>
              <Text className="mt-1 text-[13px] leading-[1.7] text-ink-soft">Can't find the answer you're looking for? Please chat to our friendly team.</Text>
            </div>
            <a 
              href="/contact" 
              className="whitespace-nowrap rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Get in touch
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
