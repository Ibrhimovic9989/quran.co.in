// Reciter Selector Molecule
// Composed of: Select (atom)
// Single responsibility: Select and display reciter
// Follows Atomic Design & SRP

import { Select } from '../atoms';
import { Text } from '../typography';
import type { AudioReciters } from '@/types/quran-api';

interface ReciterSelectorProps {
  audioData: AudioReciters;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
  label?: string;
  className?: string;
}

export function ReciterSelector({
  audioData,
  selectedReciter,
  onReciterChange,
  label = 'Select Reciter',
  className,
}: ReciterSelectorProps) {
  const reciters = Object.entries(audioData).map(([id, data]) => ({
    value: id,
    label: data.reciter,
  }));

  return (
    <div className={className}>
      <Text className="text-sm text-gray-400 mb-2">{label}</Text>
      <Select
        value={selectedReciter || ''}
        onChange={(e) => onReciterChange(e.target.value)}
        options={reciters}
        placeholder="Select Reciter"
      />
    </div>
  );
}
