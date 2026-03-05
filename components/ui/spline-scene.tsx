// Spline Scene Component
// 3D scene renderer using Spline
// Follows Atomic Design - Atom component

'use client'

import { Suspense, lazy } from 'react'
import { Spinner } from './atoms'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Spinner size="lg" />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
