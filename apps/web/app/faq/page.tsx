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
    <main className="min-h-screen bg-white pt-32 pb-20">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Heading level={1} className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</Heading>
            <Text className="text-lg text-gray-600">
              Find answers to common questions about using Quran.co.in, our sources, and our mission.
            </Text>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden border border-gray-100 transition-all ${openIndex === index ? 'shadow-md border-gray-200' : 'hover:border-gray-200'}`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 group"
                >
                  <span className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/30">
                    {faq.answer}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Card */}
          <div className="mt-16 p-8 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Heading level={4} className="text-xl font-bold mb-2">Still have questions?</Heading>
              <Text className="text-gray-600">Can't find the answer you're looking for? Please chat to our friendly team.</Text>
            </div>
            <a 
              href="/contact" 
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl border border-gray-200 hover:shadow-sm transition-all whitespace-nowrap"
            >
              Get in touch
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
