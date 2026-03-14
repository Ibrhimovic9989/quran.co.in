// Contact Page
// Contact information and feedback form

'use client';

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button, ShimmerButton } from '@/components/ui/atoms';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

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
              Have questions, feedback, or want to report an issue? We'd love to hear from you. 
              Our team typically responds within 24-48 hours.
            </Text>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <Heading level={4} className="text-lg font-bold">Email Us</Heading>
                  <Text className="text-gray-600">support@quran.co.in</Text>
                  <Text className="text-gray-500 text-sm">For general inquiries and support</Text>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <Heading level={4} className="text-lg font-bold">Feedback</Heading>
                  <Text className="text-gray-600">feedback@quran.co.in</Text>
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
                  <Text className="text-gray-500 text-sm">Global Community - Serving from several regions</Text>
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
                    Thank you for reaching out. We have received your message and will get back to you soon.
                  </Text>
                  <Button onClick={() => setIsSent(false)} variant="secondary">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none bg-white">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Content Feedback</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <textarea 
                      required 
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                    />
                  </div>
                  <ShimmerButton
                    background="black"
                    className="w-full py-4 text-white font-bold"
                    disabled={isSubmitting}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </span>
                  </ShimmerButton>
                </form>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
