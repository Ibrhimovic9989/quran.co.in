// Privacy Policy Page
// Standard privacy policy for a digital Quran application

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';

export default function PrivacyPage() {
  const lastUpdated = "March 15, 2026";

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-gray">
          <Heading level={1} className="text-4xl font-bold mb-4">Privacy Policy</Heading>
          <Text className="text-sm text-gray-500 mb-12 italic">Last updated: {lastUpdated}</Text>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">1. Introduction</Heading>
            <Text className="text-gray-600 mb-4">
              At Quran.co.in, we respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit 
              our website (regardless of where you visit it from) and tell you about your privacy rights.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">2. The Data We Collect</Heading>
            <Text className="text-gray-600 mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which 
              we have grouped together as follows:
            </Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li><strong>Identity Data:</strong> first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> email address.</li>
              <li><strong>Technical Data:</strong> internet protocol (IP) address, your login data, browser type and version.</li>
              <li><strong>Usage Data:</strong> information about how you use our website and services (e.g., bookmarks, reading progress).</li>
            </ul>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">3. How We Use Your Data</Heading>
            <Text className="text-gray-600 mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your 
              personal data in the following circumstances:
            </Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>To register you as a new user.</li>
              <li>To provide and manage your account.</li>
              <li>To improve our website, services, and user experience.</li>
              <li>To notify you about changes to our terms or privacy policy.</li>
            </ul>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">4. Data Security</Heading>
            <Text className="text-gray-600 mb-4">
              We have put in place appropriate security measures to prevent your personal data from being 
              accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
              In addition, we limit access to your personal data to those employees, agents, contractors 
              and other third parties who have a business need to know.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">5. Data Retention</Heading>
            <Text className="text-gray-600 mb-4">
              We will only retain your personal data for as long as necessary to fulfill the purposes we 
              collected it for, including for the purposes of satisfying any legal, accounting, or 
              reporting requirements.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">6. Your Legal Rights</Heading>
            <Text className="text-gray-600 mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your 
              personal data, including the right to request access, correction, erasure, or restriction of 
              your personal data.
            </Text>
          </section>

          <section className="mt-16 pt-8 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              If you have any questions about this privacy policy or our privacy practices, please contact us 
              at support@quran.co.in.
            </Text>
          </section>
        </div>
      </Container>
    </main>
  );
}
