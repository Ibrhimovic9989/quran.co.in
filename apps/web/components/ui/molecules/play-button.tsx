// Play Button Molecule
// Composed of: Button (atom)
// Single responsibility: Play/pause audio with consistent UI
// Follows Atomic Design & SRP

import { Pause, Play } from 'lucide-react';
import { Button } from '../atoms';

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
}

export function PlayButton({
  isPlaying,
  isLoading = false,
  onClick,
  className,
}: PlayButtonProps) {
  return (
    <Button
      variant={isPlaying ? 'primary' : 'secondary'}
      onClick={onClick}
      isLoading={isLoading}
      className={className}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      <span className="flex items-center gap-2">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </span>
    </Button>
  );
}
