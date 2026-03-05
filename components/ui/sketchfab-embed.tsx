// Sketchfab Embed Component
// Embeds 3D models from Sketchfab
// Follows Atomic Design - Atom component

'use client';

import { cn } from '@/lib/utils/cn';

interface SketchfabEmbedProps {
  modelId: string;
  title?: string;
  className?: string;
  allowFullscreen?: boolean;
}

export function SketchfabEmbed({ 
  modelId, 
  title = '3D Model',
  className,
  allowFullscreen = true 
}: SketchfabEmbedProps) {
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed`;

  return (
    <div className={cn('w-full h-full relative', className)}>
      <iframe
        title={title}
        frameBorder="0"
        allowFullScreen={allowFullscreen}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={embedUrl}
        className="w-full h-full border-0"
        style={{ background: 'transparent' }}
        {...(allowFullscreen && {
          // Legacy browser support (handled via allowFullScreen prop)
        })}
      />
    </div>
  );
}
