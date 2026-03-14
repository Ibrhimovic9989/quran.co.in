// About Us Page
// Information about the mission and vision of Quran.co.in

import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart, Shield, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <Container>
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <Heading level={1} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Our Mission: To Make the Quran Accessible to All
          </Heading>
          <Text className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Quran.co.in is dedicated to providing a modern, beautiful, and authentic 
            digital experience for engaging with the Holy Word of Allah. Our goal is to 
            bridge the gap between traditional wisdom and modern technology.
          </Text>
        </div>

        {/* Vision/Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Card className="p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-4">Authenticity First</Heading>
            <Text className="text-gray-600">
              Every translation, recitation, and piece of commentary on our platform is carefully 
              sourced from recognized Islamic scholars and reputable institutions to ensure the 
              highest level of accuracy.
            </Text>
          </Card>

          <Card className="p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-4">User-Centric Design</Heading>
            <Text className="text-gray-600">
              We believe that studying the Quran should be a peaceful and distraction-free experience. 
              Our interface is designed to be elegant, fast, and accessible on any device.
            </Text>
          </Card>

          <Card className="p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-4">Global Reach</Heading>
            <Text className="text-gray-600">
              The Quran is for all humanity. We strive to provide multiple languages and 
              diverse recitations to cater to students of the Quran from all walks of life, 
              regardless of their native tongue.
            </Text>
          </Card>

          <Card className="p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <Heading level={3} className="text-2xl font-bold mb-4">Lifelong Learning</Heading>
            <Text className="text-gray-600">
              Whether you are reading the Quran for the first time or are a dedicated Hafiz, 
              our tools are built to support your journey of learning, understanding, and 
              remembrance.
            </Text>
          </Card>
        </div>

        {/* Story Section */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-16">
          <div className="max-w-3xl mx-auto text-center">
            <Heading level={2} className="text-3xl md:text-4xl font-bold mb-8">Guided by Faith</Heading>
            <Text className="text-lg text-gray-700 leading-relaxed mb-8 italic">
              "The best among you are those who learn the Quran and teach it." 
              <span className="block mt-2 font-semibold not-italic text-sm">— Prophet Muhammad (PBUH)</span>
            </Text>
            <Text className="text-gray-600">
              This platform was built as a humble contribution to the global Muslim Ummah. 
              We are a team of developers, designers, and students of knowledge who wanted 
              to create a tool that we personally love to use every day. We hope it 
              benefits you as much as it has blessed us during its creation.
            </Text>
          </div>
        </div>
      </Container>
    </main>
  );
}
