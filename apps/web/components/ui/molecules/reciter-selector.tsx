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
  hideLabel?: boolean;
  minimal?: boolean;
}

export function ReciterSelector({
  audioData,
  selectedReciter,
  onReciterChange,
  label = 'Select Reciter',
  className,
  hideLabel = false,
  minimal = false,
}: ReciterSelectorProps) {
  const reciters = Object.entries(audioData).map(([id, data]) => ({
    value: id,
    label: data.reciter,
  }));

  return (
    <div className={className}>
      {!hideLabel && <Text className="mb-2 text-sm text-gray-400">{label}</Text>}
      <Select
        value={selectedReciter || ''}
        onChange={(e) => onReciterChange(e.target.value)}
        options={reciters}
        placeholder="Select Reciter"
        className={
          minimal
            ? 'h-9 rounded-full border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus:border-stone-400'
            : undefined
        }
      />
    </div>
  );
}
