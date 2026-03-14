// Terms of Service Page
// Standard terms and conditions for Quran.co.in

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';

export default function TermsPage() {
  const lastUpdated = "March 15, 2026";

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-gray">
          <Heading level={1} className="text-4xl font-bold mb-4">Terms of Service</Heading>
          <Text className="text-sm text-gray-500 mb-12 italic">Last updated: {lastUpdated}</Text>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">1. Agreement to Terms</Heading>
            <Text className="text-gray-600 mb-4">
              By accessing or using Quran.co.in, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using or accessing this site.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">2. Use License</Heading>
            <Text className="text-gray-600 mb-4">
              Permission is granted to use Quran.co.in for personal, non-commercial, and educational 
              purposes. This is the grant of a license, not a transfer of title, and under this 
              license you may not:
            </Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">3. Disclaimer</Heading>
            <Text className="text-gray-600 mb-4">
              The materials on Quran.co.in are provided on an 'as is' basis. Quran.co.in makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or 
              other violation of rights.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">4. Limitations</Heading>
            <Text className="text-gray-600 mb-4">
              In no event shall Quran.co.in or its suppliers be liable for any damages 
              (including, without limitation, damages for loss of data or profit, or due to 
              business interruption) arising out of the use or inability to use the materials 
              on Quran.co.in.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">5. Accuracy of Materials</Heading>
            <Text className="text-gray-600 mb-4">
              While we strive for 100% accuracy in our translations and recitations, the materials 
              appearing on Quran.co.in could include technical, typographical, or photographic errors. 
              Quran.co.in does not warrant that any of the materials on its website are accurate, 
              complete or current.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">6. Links</Heading>
            <Text className="text-gray-600 mb-4">
              Quran.co.in has not reviewed all of the sites linked to its website and is not 
              responsible for the contents of any such linked site. The inclusion of any link does 
              not imply endorsement by Quran.co.in of the site.
            </Text>
          </section>

          <section className="mb-10">
            <Heading level={2} className="text-2xl font-bold mb-4">7. Modifications</Heading>
            <Text className="text-gray-600 mb-4">
              Quran.co.in may revise these terms of service for its website at any time without notice. 
              By using this website you are agreeing to be bound by the then current version 
              of these terms of service.
            </Text>
          </section>

          <section className="mt-16 pt-8 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              For any questions regarding these terms, please contact us at legal@quran.co.in.
            </Text>
          </section>
        </div>
      </Container>
    </main>
  );
}
