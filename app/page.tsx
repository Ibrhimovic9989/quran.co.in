// Home Page
// Landing page

import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Container>
        <div className="py-20">
          <div className="text-center mb-16">
            <Heading level={1} className="mb-4">
              Welcome to Quran.co.in
            </Heading>
            <Text className="text-xl text-gray-300 mb-8">
              Your gateway to the Holy Quran
            </Text>
            <Link
              href="/quran"
              className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Explore the Quran
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card>
              <Heading level={3} className="mb-2">
                Read
              </Heading>
              <Text className="text-gray-300">
                Read the complete Quran with translations in multiple languages
              </Text>
            </Card>
            <Card>
              <Heading level={3} className="mb-2">
                Listen
              </Heading>
              <Text className="text-gray-300">
                Listen to beautiful recitations from renowned reciters
              </Text>
            </Card>
            <Card>
              <Heading level={3} className="mb-2">
                Study
              </Heading>
              <Text className="text-gray-300">
                Access tafsir and commentary to deepen your understanding
              </Text>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
