// Play Button Molecule
// Composed of: Button (atom)
// Single responsibility: Play/pause audio with consistent UI
// Follows Atomic Design & SRP

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
    >
      {isPlaying ? '⏸️ Pause' : '▶️ Play'}
    </Button>
  );
}
