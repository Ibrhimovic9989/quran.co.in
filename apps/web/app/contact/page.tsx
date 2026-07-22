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
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all';
  const errorClass = 'border-red-300 focus:ring-red-200';

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Contact Info */}
          <div>
            <Heading level={1} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </Heading>
            <Text className="text-lg text-gray-600 mb-12">
              Have questions, feedback, or want to report an issue? We&apos;d love to hear from you.
              Our team typically responds within 24–48 hours.
            </Text>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <Heading level={4} className="text-lg font-bold">Email Us</Heading>
                  <a href="mailto:support@quran.co.in" className="text-gray-600 hover:underline">
                    support@quran.co.in
                  </a>
                  <Text className="text-gray-500 text-sm">For general inquiries and support</Text>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <Heading level={4} className="text-lg font-bold">Feedback</Heading>
                  <a href="mailto:feedback@quran.co.in" className="text-gray-600 hover:underline">
                    feedback@quran.co.in
                  </a>
                  <Text className="text-gray-500 text-sm">Suggestions and feature requests</Text>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <Heading level={4} className="text-lg font-bold">Location</Heading>
                  <Text className="text-gray-600">Digital First Team</Text>
                  <Text className="text-gray-500 text-sm">Global Community — Serving from several regions</Text>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            <Card className="p-8 border border-gray-100 shadow-xl rounded-2xl">
              {isSent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8" />
                  </div>
                  <Heading level={2} className="text-2xl font-bold mb-4">Message Sent!</Heading>
                  <Text className="text-gray-600 mb-8">
                    Your email client should have opened. If it didn&apos;t, please email us directly at{' '}
                    <a href="mailto:support@quran.co.in" className="underline">
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
                      <label className="text-sm font-medium text-gray-700" htmlFor="contact-name">
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
                      <label className="text-sm font-medium text-gray-700" htmlFor="contact-email">
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
                    <label className="text-sm font-medium text-gray-700" htmlFor="contact-subject">Subject</label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={handleChange('subject')}
                      className={`${inputClass} appearance-none bg-white`}
                    >
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Content Feedback</option>
                      <option>Partnership</option>
                      <option>Bug Report</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700" htmlFor="contact-message">
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
                    <p className="text-xs text-gray-400 text-right">{form.message.length} chars</p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <ShimmerButton
                    background="black"
                    className="w-full py-4 text-white font-bold"
                    disabled={isSubmitting}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? 'Opening email client...' : 'Send Message'}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </span>
                  </ShimmerButton>

                  <p className="text-xs text-center text-gray-400">
                    This will open your email client. Alternatively, write directly to{' '}
                    <a href="mailto:support@quran.co.in" className="underline">support@quran.co.in</a>.
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
