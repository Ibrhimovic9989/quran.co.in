// Help Center Page
// Searchable documentation and support categories

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Search, Book, User, Play, Settings, LifeBuoy, FileText } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using Quran.co.in and navigating the Quran.',
    icon: Play,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Account & Profile',
    description: 'Manage your settings, personal data, and preferences.',
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Reading & Audio',
    description: 'Customizing your reading experience and using the audio player.',
    icon: Book,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Content Authenticity',
    description: 'Information about our sources, translations, and scholars.',
    icon: FileText,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    title: 'Platform Settings',
    description: 'Adjusting themes, languages, and technical configurations.',
    icon: Settings,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  {
    title: 'Troubleshooting',
    description: 'Fixing common digital issues and reported bugs.',
    icon: LifeBuoy,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-gray-50 pt-32 pb-20 border-b border-gray-100">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Heading level={1} className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</Heading>
            <div className="relative max-w-2xl mx-auto">
              <input 
                type="text" 
                placeholder="Search for articles, guides..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Text className="text-sm text-gray-500">Popular topics:</Text>
              {['Audio Playback', 'Sign In Issues', 'Authenticity', 'Feature Requests'].map(tag => (
                <button key={tag} className="text-sm font-medium text-gray-900 hover:underline">{tag}</button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-20">
        <Heading level={2} className="text-2xl font-bold mb-10">Browse by Category</Heading>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card key={cat.title} className="p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-12 h-12 ${cat.bg} ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Heading level={3} className="text-xl font-bold mb-3">{cat.title}</Heading>
                <Text className="text-gray-600 mb-4">{cat.description}</Text>
                <Link href="#" className="text-sm font-bold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
                  View Articles <span>→</span>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Still need help? */}
        <div className="mt-24 text-center bg-black rounded-3xl p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <Heading level={2} className="text-3xl font-bold mb-4">Still need help?</Heading>
            <Text className="text-gray-300 mb-8 max-w-lg mx-auto">
              Our support team is always here to assist you with any questions or technical challenges you might face.
            </Text>
            <Link href="/contact" className="inline-block bg-white text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform">
              Contact Support
            </Link>
          </div>
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>
      </Container>
    </main>
  );
}
