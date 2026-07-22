// Help Center Page
// Searchable documentation and support categories

'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Search, Book, User, Play, Settings, LifeBuoy, FileText, X } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using Quran.co.in and navigating the Quran.',
    icon: Play,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/faq',
    tags: ['getting started', 'basics', 'navigation', 'new user', 'how to'],
  },
  {
    title: 'Account & Profile',
    description: 'Manage your settings, personal data, and preferences.',
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    href: '/profile',
    tags: ['account', 'profile', 'settings', 'sign in', 'login', 'sign up'],
  },
  {
    title: 'Reading & Audio',
    description: 'Customising your reading experience and using the audio player.',
    icon: Book,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    href: '/faq#audio',
    tags: ['audio', 'reading', 'recitation', 'translation', 'playback', 'reciter', 'offline'],
  },
  {
    title: 'Content Authenticity',
    description: 'Information about our sources, translations, and scholars.',
    icon: FileText,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    href: '/faq#translations',
    tags: ['authenticity', 'sources', 'translations', 'scholars', 'quran text'],
  },
  {
    title: 'Platform Settings',
    description: 'Adjusting themes, languages, and technical configurations.',
    icon: Settings,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    href: '/profile',
    tags: ['settings', 'language', 'theme', 'configuration', 'preferences'],
  },
  {
    title: 'Troubleshooting',
    description: 'Fixing common issues and reported bugs.',
    icon: LifeBuoy,
    color: 'text-red-600',
    bg: 'bg-red-50',
    href: '/contact',
    tags: ['troubleshooting', 'bug', 'error', 'issue', 'problem', 'fix', 'broken', 'not working'],
  },
];

const popularTopics = [
  { label: 'Audio Playback', query: 'audio' },
  { label: 'Sign In Issues', query: 'sign in' },
  { label: 'Authenticity', query: 'authenticity' },
  { label: 'Feature Requests', query: 'feature' },
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q))
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-gray-50 pt-32 pb-20 border-b border-gray-100">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Heading level={1} className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you?
            </Heading>
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for articles, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search help topics"
                className="w-full h-14 pl-12 pr-10 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 text-lg bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" aria-hidden="true" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2 items-center">
              <Text className="text-sm text-gray-500">Popular topics:</Text>
              {popularTopics.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setQuery(t.query)}
                  className="text-sm font-medium text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-20">
        <div className="flex items-center justify-between mb-10">
          <Heading level={2} className="text-2xl font-bold">
            {query ? `Results for "${query}"` : 'Browse by Category'}
          </Heading>
          {query && (
            <Text className="text-sm text-gray-500">
              {filteredCategories.length} of {categories.length} categories
            </Text>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.title} href={cat.href}>
                  <Card className="p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer group h-full">
                    <div
                      className={`w-12 h-12 ${cat.bg} ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <Heading level={3} className="text-xl font-bold mb-3">
                      {cat.title}
                    </Heading>
                    <Text className="text-gray-600 mb-4">{cat.description}</Text>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Articles <span aria-hidden="true">→</span>
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" aria-hidden="true" />
            </div>
            <Heading level={3} className="text-xl font-bold mb-2">No results found</Heading>
            <Text className="text-gray-500 mb-6">
              Try a different search term, or browse our FAQ for answers.
            </Text>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setQuery('')}
                className="px-5 py-2.5 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
              <Link
                href="/faq"
                className="px-5 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                View FAQ
              </Link>
            </div>
          </div>
        )}

        {/* Still need help? */}
        <div className="mt-24 text-center bg-black rounded-3xl p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <Heading level={2} className="text-3xl font-bold mb-4">
              Still need help?
            </Heading>
            <Text className="text-gray-300 mb-8 max-w-lg mx-auto">
              Our support team is always here to assist you with any questions or technical
              challenges you might face.
            </Text>
            <Link
              href="/contact"
              className="inline-block bg-white text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform"
            >
              Contact Support
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </Container>
    </main>
  );
}
