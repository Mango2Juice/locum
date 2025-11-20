// src/components/ui/pull-to-refresh.tsx
'use client'

import { Check, Loader2, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void> | void
  enabled?: boolean | undefined
  threshold?: number | undefined
  onThresholdReached?: (() => void) | undefined
  className?: string | undefined
}

/**
 * Wraps scrollable content to provide a pull-to-refresh gesture with a visual indicator.
 *
 * @param children - The scrollable content to wrap
 * @param onRefresh - Callback invoked when a pull exceeds the threshold to perform a refresh
 * @param enabled - Whether pull-to-refresh is active
 * @param threshold - Minimum pull distance in pixels required to trigger a refresh
 * @param onThresholdReached - Optional callback invoked once when the pull distance crosses the threshold (useful for haptic feedback)
 * @param className - Additional CSS classes applied to the outer container
 * @returns A React element that wraps the children and provides pull-to-refresh UI and behavior
 */
export function PullToRefresh({
  children,
  onRefresh,
  enabled = true,
  threshold = 80,
  onThresholdReached,
  className,
}: PullToRefreshProps) {
  const { state, pullDistance, progress, containerRef } = usePullToRefresh({
    threshold,
    onRefresh,
    enabled,
    onThresholdReached,
  })

  const showIndicator = state !== 'idle'
  const indicatorOpacity = Math.min(pullDistance / 40, 1) // Fade in over first 40px

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className={cn('relative overflow-auto', className)}>
      {/* Pull-to-refresh indicator */}
      {showIndicator && (
        <div
          className='absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50'
          style={{
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
            opacity: indicatorOpacity,
            transition: state === 'refreshing' || state === 'complete' ? 'transform 300ms ease-out' : 'none',
          }}
        >
          <div className='bg-background/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border'>
            {state === 'complete' ? (
              <Check className='w-6 h-6 text-success animate-in zoom-in duration-200' />
            ) : state === 'refreshing' ? (
              <Loader2 className='w-6 h-6 text-primary animate-spin' />
            ) : (
              <div className='relative w-6 h-6'>
                {/* Background circle */}
                <svg className='w-6 h-6 -rotate-90' viewBox='0 0 24 24'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='text-muted'
                    opacity='0.2'
                  />
                  {/* Progress circle */}
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                    className={cn('text-primary transition-all duration-100', state === 'threshold' && 'text-success')}
                    strokeLinecap='round'
                  />
                </svg>
                {/* Icon */}
                <RefreshCw
                  className={cn(
                    'absolute inset-0 m-auto w-4 h-4 text-primary transition-transform duration-200',
                    state === 'threshold' && 'text-success scale-110',
                  )}
                  style={{
                    transform: `rotate(${progress * 3.6}deg)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: state === 'refreshing' ? `translateY(${threshold}px)` : 'translateY(0)',
          transition: state === 'refreshing' || state === 'complete' ? 'transform 300ms ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
