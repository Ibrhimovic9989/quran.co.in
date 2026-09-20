// Contact Page
// Contact information and feedback form with real validation

'use client';

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button, ShimmerButton } from '@/components/ui/atoms';
import { Mail, MessageSquare, MapPin, Send, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Please enter a message (at least 10 characters).';
  }
  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Send via mailto as a reliable fallback since no backend is configured
      const subject = encodeURIComponent(`[${form.subject}] from ${form.name}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`
      );
      window.location.href = `mailto:support@quran.co.in?subject=${subject}&body=${body}`;

      // Show success after a short delay
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSent(true);
      }, 800);
    } catch {
      setIsSubmitting(false);
      setSubmitError('Something went wrong. Please email us directly at support@quran.co.in');
    }
  };

  const inputClass =
    'w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-[13px] text-ink placeholder:text-muted transition-all focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent-soft';
  const errorClass = 'border-red-300 focus:ring-red-100';

  return (
    <main className="min-h-screen bg-paper pb-12 pt-6 md:pt-10">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Contact Info */}
          <div>
            <Heading level={1} className="font-heading text-[24px] md:text-[30px] font-bold leading-[1.2] tracking-[-0.035em] text-ink">
              Get in Touch
            </Heading>
            <Text className="mb-5 mt-3 max-w-lg text-[15px] leading-[1.75] text-muted">
              Have questions, feedback, or want to report an issue? We&apos;d love to hear from you.
              Our team typically responds within 24–48 hours.
            </Text>

            <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-medium text-muted">Other ways to reach us</summary><div className="mt-4 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint-sage text-ink-soft">
                  <Mail className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <div>
                  <Heading level={4} className="font-heading text-[15px] font-bold tracking-[-0.025em] text-ink">Email Us</Heading>
                  <a href="mailto:support@quran.co.in" className="text-[13px] font-medium text-accent-strong hover:underline">
                    support@quran.co.in
                  </a>
                  <Text className="mt-0.5 text-[11px] text-muted">For general inquiries and support</Text>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint-sky text-ink-soft">
                  <MessageSquare className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <div>
                  <Heading level={4} className="font-heading text-[15px] font-bold tracking-[-0.025em] text-ink">Feedback</Heading>
                  <a href="mailto:feedback@quran.co.in" className="text-[13px] font-medium text-accent-strong hover:underline">
                    feedback@quran.co.in
                  </a>
                  <Text className="mt-0.5 text-[11px] text-muted">Suggestions and feature requests</Text>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tint-peach text-ink-soft">
                  <MapPin className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <div>
                  <Heading level={4} className="font-heading text-[15px] font-bold tracking-[-0.025em] text-ink">Location</Heading>
                  <Text className="text-[13px] text-ink-soft">Digital First Team</Text>
                  <Text className="mt-0.5 text-[11px] text-muted">Global Community — Serving from several regions</Text>
                </div>
              </div>
            </div></details>
          </div>

          {/* Right: Contact Form */}
          <div>
            <Card className="rounded-[22px] border border-line bg-surface p-6 shadow-none md:p-8">
              {isSent ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
                    <Send className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <Heading level={2} className="font-heading text-[22px] font-bold tracking-[-0.03em] text-ink">Message Sent!</Heading>
                  <Text className="mx-auto mb-8 mt-3 max-w-sm text-[13px] leading-[1.75] text-muted">
                    Your email client should have opened. If it didn&apos;t, please email us directly at{' '}
                    <a href="mailto:support@quran.co.in" className="font-medium text-accent-strong underline">
                      support@quran.co.in
                    </a>
                    .
                  </Text>
                  <Button onClick={() => { setIsSent(false); setForm({ name: '', email: '', subject: 'General Inquiry', message: '' }); }} variant="secondary">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-ink-soft" htmlFor="contact-name">
                        Name <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange('name')}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`${inputClass} ${errors.name ? errorClass : ''}`}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-ink-soft" htmlFor="contact-email">
                        Email <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange('email')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`${inputClass} ${errors.email ? errorClass : ''}`}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-ink-soft" htmlFor="contact-subject">Subject</label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={handleChange('subject')}
                      className={`${inputClass} appearance-none`}
                    >
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Content Feedback</option>
                      <option>Partnership</option>
                      <option>Bug Report</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-ink-soft" htmlFor="contact-message">
                      Message <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="How can we help you? (minimum 10 characters)"
                      value={form.message}
                      onChange={handleChange('message')}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={`${inputClass} resize-none ${errors.message ? errorClass : ''}`}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                    <p className="text-right text-[11px] text-muted">{form.message.length} chars</p>
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <ShimmerButton
                    background="var(--accent)"
                    borderRadius="10px"
                    className="w-full px-4 py-3 text-xs font-semibold text-white"
                    disabled={isSubmitting}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? 'Opening email client...' : 'Send Message'}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </span>
                  </ShimmerButton>

                  <p className="text-center text-[11px] leading-[1.7] text-muted">
                    This will open your email client. Alternatively, write directly to{' '}
                    <a href="mailto:support@quran.co.in" className="font-medium text-accent-strong underline">support@quran.co.in</a>.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
