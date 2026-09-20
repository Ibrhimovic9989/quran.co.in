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
    color: 'text-ink-soft',
    bg: 'bg-tint-sky',
    href: '/faq',
    tags: ['getting started', 'basics', 'navigation', 'new user', 'how to'],
  },
  {
    title: 'Account & Profile',
    description: 'Manage your settings, personal data, and preferences.',
    icon: User,
    color: 'text-ink-soft',
    bg: 'bg-tint-lavender',
    href: '/profile',
    tags: ['account', 'profile', 'settings', 'sign in', 'login', 'sign up'],
  },
  {
    title: 'Reading & Audio',
    description: 'Customising your reading experience and using the audio player.',
    icon: Book,
    color: 'text-accent',
    bg: 'bg-accent-soft',
    href: '/faq#audio',
    tags: ['audio', 'reading', 'recitation', 'translation', 'playback', 'reciter', 'offline'],
  },
  {
    title: 'Content Authenticity',
    description: 'Information about our sources, translations, and scholars.',
    icon: FileText,
    color: 'text-ink-soft',
    bg: 'bg-tint-peach',
    href: '/faq#translations',
    tags: ['authenticity', 'sources', 'translations', 'scholars', 'quran text'],
  },
  {
    title: 'Platform Settings',
    description: 'Adjusting themes, languages, and technical configurations.',
    icon: Settings,
    color: 'text-ink-soft',
    bg: 'bg-tint-sun',
    href: '/profile',
    tags: ['settings', 'language', 'theme', 'configuration', 'preferences'],
  },
  {
    title: 'Troubleshooting',
    description: 'Fixing common issues and reported bugs.',
    icon: LifeBuoy,
    color: 'text-ink-soft',
    bg: 'bg-tint-sage',
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
    <main className="min-h-screen bg-paper">
      {/* Search Header */}
      <div className="border-b border-line bg-surface pb-6 pt-6 md:pt-10">
        <Container>
          <div className="max-w-3xl">
            <Heading level={1} className="font-heading text-[24px] md:text-[30px] font-bold leading-[1.2] tracking-[-0.035em] text-ink">
              Help & guidance
            </Heading>
            <div className="relative mt-5 max-w-2xl">
              <input
                type="text"
                placeholder="Search for articles, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search help topics"
                className="h-12 w-full rounded-[14px] border border-line bg-surface pl-11 pr-10 text-[14px] text-ink placeholder:text-muted transition-all focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent-soft"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-accent-strong"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Text className="text-[11px] uppercase tracking-[0.14em] text-muted">Popular topics:</Text>
              {popularTopics.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setQuery(t.query)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-accent-strong transition-colors hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent-soft"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6 md:py-10">
        <div className="mb-5 flex items-center justify-between">
          <Heading level={2} className="font-heading text-[19px] font-bold tracking-[-0.025em] text-ink">
            {query ? `Results for "${query}"` : 'Browse by Category'}
          </Heading>
          {query && (
            <Text className="text-[11px] text-muted">
              {filteredCategories.length} of {categories.length} categories
            </Text>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.title} href={cat.href}>
                  <Card className="group h-full cursor-pointer rounded-2xl border border-line bg-surface p-5 shadow-none transition-all hover:border-accent/30 hover:shadow-card">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full ${cat.bg} ${cat.color}`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
                    </div>
                    <Heading level={3} className="mt-4 font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">
                      {cat.title}
                    </Heading>
                    <Text className="mt-1.5 text-xs leading-[1.7] text-muted">{cat.description}</Text>
                    <span className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-accent-strong transition-all group-hover:gap-2">
                      View Articles <span aria-hidden="true">→</span>
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[22px] border border-line bg-surface py-16 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
              <Search className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">No results found</Heading>
            <Text className="mx-auto mb-6 mt-2 max-w-xs text-[13px] leading-[1.7] text-muted">
              Try a different search term, or browse our FAQ for answers.
            </Text>
            <div className="flex justify-center gap-2.5">
              <button
                onClick={() => setQuery('')}
                className="rounded-[10px] border border-line bg-surface px-4 py-3 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
              >
                Clear Search
              </button>
              <Link
                href="/faq"
                className="rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
              >
                View FAQ
              </Link>
            </div>
          </div>
        )}

        {/* Still need help? */}
        <div className="mt-14 flex flex-col items-start gap-5 rounded-[22px] border border-[#bce9e4] bg-[linear-gradient(115deg,var(--tint-sage),var(--tint-sky))] p-6 md:flex-row md:items-center md:p-8">
          <div className="flex-1">
            <Heading level={2} className="font-heading text-[19px] font-bold tracking-[-0.025em] text-ink">
              Still need help?
            </Heading>
            <Text className="mt-1.5 max-w-lg text-[13px] leading-[1.75] text-ink-soft">
              Our support team is always here to assist you with any questions or technical
              challenges you might face.
            </Text>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Contact Support
          </Link>
        </div>
      </Container>
    </main>
  );
}
