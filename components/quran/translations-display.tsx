// Translations Display Component
// Shows multiple language translations for an ayah

import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/atoms';
import { useState } from 'react';

interface TranslationsDisplayProps {
  translations: {
    english?: string;
    bengali?: string;
    urdu?: string;
    turkish?: string;
    uzbek?: string;
  };
  className?: string;
}

const languageNames: Record<string, string> = {
  english: 'English',
  bengali: 'Bengali',
  urdu: 'Urdu',
  turkish: 'Turkish',
  uzbek: 'Uzbek',
};

export function TranslationsDisplay({
  translations,
  className,
}: TranslationsDisplayProps) {
  const [selectedLang, setSelectedLang] = useState<string>('english');
  
  const availableLangs = Object.keys(translations).filter(
    (lang) => translations[lang as keyof typeof translations]
  );

  if (availableLangs.length === 0) return null;

  return (
    <div className={className}>
      <Heading level={3} className="mb-4">
        Translations
      </Heading>
      
      {/* Language Selector - Using Button atoms */}
      {/* Gestalt: Related buttons grouped together (Proximity) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableLangs.map((lang) => (
          <Button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            variant={selectedLang === lang ? 'primary' : 'secondary'}
            size="sm"
          >
            {languageNames[lang] || lang}
          </Button>
        ))}
      </div>

      {/* Selected Translation */}
      <Card>
        <Text className="text-lg leading-relaxed">
          {translations[selectedLang as keyof typeof translations]}
        </Text>
      </Card>
    </div>
  );
}
