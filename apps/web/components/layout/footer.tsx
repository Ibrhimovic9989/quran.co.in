// Footer Component
// Modern footer with newsletter, links, and social media
// Follows Atomic Design - Organism component
// Senior Frontend/UI-UX Implementation

'use client';

import { Container } from '@/components/ui/container';
import { QuranReminder } from '@/components/ui/quran-reminder';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/atoms';
import { Input } from '@/components/ui/atoms';
import { Send, Mail, BookOpen, HelpCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

interface FooterProps {
  className?: string;
}

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Quran', href: '/quran' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const resources = [
  { label: 'Help Center', href: '/help', icon: HelpCircle },
  { label: 'FAQ', href: '/faq', icon: BookOpen },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const currentYear = new Date().getFullYear();

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    // Store subscription intent — backend integration point
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <footer className={cn("relative w-full border-t border-line bg-paper text-ink transition-colors duration-300", className)}>
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Newsletter Section */}
            <div className="relative">
              <Heading level={3} className="mb-4 text-2xl font-bold tracking-tight text-ink">
                Stay Connected
              </Heading>
              <Text className="mb-6 text-ink-soft">
                Get updates on new features, translations, and resources delivered to your inbox.
              </Text>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2.5 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  You&apos;re subscribed! Thanks for joining.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="relative" noValidate>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    aria-label="Email address for newsletter"
                    aria-invalid={!!emailError}
                    className={cn(
                      "w-full h-10 px-4 pr-12 rounded-md",
                      "bg-paper border text-ink",
                      emailError ? "border-red-400" : "border-gray-300",
                      "placeholder:text-ink-muted",
                      "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "absolute right-1 top-1 h-8 w-8 rounded-full",
                      "bg-accent text-white flex items-center justify-center",
                      "transition-transform hover:scale-105",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    )}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Subscribe</span>
                  </button>
                  {emailError && (
                    <p className="mt-1 text-xs text-red-600">{emailError}</p>
                  )}
                </form>
              )}
              {/* Decorative Element */}
              <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
            </div>

            {/* Quick Links */}
            <div>
              <Heading level={4} className="mb-4 text-lg font-semibold text-ink">
                Quick Links
              </Heading>
              <nav className="space-y-2 text-sm">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Resources */}
            <div>
              <Heading level={4} className="mb-4 text-lg font-semibold text-ink">
                Resources
              </Heading>
              <nav className="space-y-2 text-sm">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Link
                      key={resource.href}
                      href={resource.href}
                      className="flex items-center gap-2 text-ink-soft transition-colors hover:text-ink"
                    >
                      <Icon className="h-4 w-4" />
                      {resource.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Contact & Info */}
            <div className="relative">
              <Heading level={4} className="mb-4 text-lg font-semibold text-ink">
                About
              </Heading>
              <div className="space-y-3 text-sm text-ink-soft">
                <p>
                  Your gateway to the Holy Quran. Read, listen, and study with authentic translations, 
                  beautiful recitations, and comprehensive commentary.
                </p>
                <div className="flex items-center gap-2 text-ink-soft">
                  <Mail className="h-4 w-4" />
                  <span>Free • Complete • Authentic</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rotating reminder */}
          <div className="mt-10 border-t border-line-soft pt-6">
            <QuranReminder />
          </div>

          {/* Bottom Section */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 md:flex-row">
            <Text className="text-sm text-ink-soft text-center md:text-left">
              © {currentYear} Quran.co.in. All rights reserved.
            </Text>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Text className="text-xs text-ink-soft text-center md:text-right max-w-xs">
              Translations and recitations sourced from trusted Islamic scholars and institutions.
            </Text>
          </div>
        </div>
      </Container>
    </footer>
  );
}
