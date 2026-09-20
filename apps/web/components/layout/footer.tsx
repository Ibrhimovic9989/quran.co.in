// Footer Component
// Modern footer with newsletter, links, and social media
// Follows Atomic Design - Organism component
// Repainted to the calm language: quiet chrome text, hairline rules, one
// teal action — no decorative blurs, no heavy type.

'use client';

import { Container } from '@/components/ui/container';
import { QuranReminder } from '@/components/ui/quran-reminder';
import { Heading, Text } from '@/components/ui/typography';
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
    <footer className={cn("relative w-full border-t border-line bg-paper text-ink", className)}>
      <Container className="max-w-[960px]">
        <div className="py-10 md:py-14">
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
            {/* Newsletter Section */}
            <div>
              <Heading level={3} className="font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">
                Stay Connected
              </Heading>
              <Text className="mt-2 text-[13px] leading-[1.7] text-muted">
                Get updates on new features, translations, and resources delivered to your inbox.
              </Text>
              {isSubscribed ? (
                <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-accent/30 bg-accent-soft px-4 py-2.5 text-[13px] font-medium text-accent-strong">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  You&apos;re subscribed! Thanks for joining.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="relative mt-4" noValidate>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    aria-label="Email address for newsletter"
                    aria-invalid={!!emailError}
                    className={cn(
                      "h-11 w-full rounded-[10px] px-4 pr-12 text-[13px]",
                      "border bg-surface text-ink",
                      emailError ? "border-red-400" : "border-line",
                      "placeholder:text-ink-muted",
                      "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "absolute right-1.5 top-1.5 h-8 w-8 rounded-full",
                      "flex items-center justify-center bg-accent text-white",
                      "transition-colors hover:bg-accent-strong",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2"
                    )}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Subscribe</span>
                  </button>
                  {emailError && (
                    <p className="mt-1.5 text-[11px] text-red-600">{emailError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <Heading level={4} className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Quick Links
              </Heading>
              <nav className="mt-4 space-y-2.5 text-[13px]">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-ink-soft transition-colors hover:text-accent-strong"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Resources */}
            <div>
              <Heading level={4} className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Resources
              </Heading>
              <nav className="mt-4 space-y-2.5 text-[13px]">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Link
                      key={resource.href}
                      href={resource.href}
                      className="flex items-center gap-2 text-ink-soft transition-colors hover:text-accent-strong"
                    >
                      <Icon className="h-4 w-4" />
                      {resource.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Contact & Info */}
            <div>
              <Heading level={4} className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                About
              </Heading>
              <div className="mt-4 space-y-3 text-[13px] leading-[1.7] text-muted">
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
          <div className="mt-9 border-t border-line-soft pt-6">
            <QuranReminder />
          </div>

          {/* Bottom Section */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-line pt-7 md:flex-row">
            <Text className="text-center text-[11px] text-muted md:text-left">
              © {currentYear} Quran.co.in. All rights reserved.
            </Text>
            <nav className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted transition-colors hover:text-accent-strong"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Text className="max-w-xs text-center text-[11px] text-muted md:text-right">
              Translations and recitations sourced from trusted Islamic scholars and institutions.
            </Text>
          </div>
        </div>
      </Container>
    </footer>
  );
}
