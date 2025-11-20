// src/components/ui/view-transition.tsx

'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ViewTransitionProps {
  children: ReactNode
  isVisible: boolean
  animationType?: 'slide' | 'fade' | 'scale' | 'none'
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
  className?: string
  onAnimationComplete?: () => void
}

/**
 * Manages mounting and unmounting of its children with configurable enter/exit animations.
 *
 * Renders the children inside a transition wrapper when visible and keeps them mounted for the duration of exit animations so the exit transition can complete. Calls `onAnimationComplete` after an exit finishes. When `animationType` is `'none'`, renders children immediately only while `isVisible` is true.
 *
 * @param children - Content to render inside the transition container
 * @param isVisible - Controls whether the view should be shown
 * @param animationType - Type of transition to apply: `'slide'`, `'fade'`, `'scale'`, or `'none'`
 * @param direction - Direction used for slide transitions: `'left'`, `'right'`, `'up'`, or `'down'`
 * @param duration - Animation duration in milliseconds
 * @param className - Additional CSS classes applied to the outer wrapper
 * @param onAnimationComplete - Optional callback invoked after an exit animation completes
 * @returns The transition-wrapped children element when rendered, or `null` when not rendered
 */
export function ViewTransition({
  children,
  isVisible,
  animationType = 'slide',
  direction = 'right',
  duration = 300,
  className,
  onAnimationComplete,
}: ViewTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isVisible ? 'entered' : 'exited',
  )

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true)
      setAnimationState('entering')

      // Start enter animation
      const enterTimer = setTimeout(() => {
        setAnimationState('entered')
      }, 50) // Small delay to ensure DOM update

      return () => clearTimeout(enterTimer)
    } else if (!isVisible && shouldRender) {
      setAnimationState('exiting')

      // Start exit animation
      const exitTimer = setTimeout(() => {
        setAnimationState('exited')
        setShouldRender(false)
        onAnimationComplete?.()
      }, duration)

      return () => clearTimeout(exitTimer)
    }

    // No cleanup needed for other cases
    return undefined
  }, [isVisible, shouldRender, duration, onAnimationComplete])

  if (animationType === 'none') {
    return isVisible ? <div className={className}>{children}</div> : null
  }

  if (!shouldRender) {
    return null
  }

  const getTransitionClasses = (): string => {
    const baseClasses = 'transition-all ease-in-out'

    switch (animationType) {
      case 'slide': {
        const slideClasses = {
          left: {
            entering: 'transform -translate-x-full opacity-0',
            entered: 'transform translate-x-0 opacity-100',
            exiting: 'transform translate-x-full opacity-0',
            exited: 'transform translate-x-full opacity-0',
          },
          right: {
            entering: 'transform translate-x-full opacity-0',
            entered: 'transform translate-x-0 opacity-100',
            exiting: 'transform -translate-x-full opacity-0',
            exited: 'transform -translate-x-full opacity-0',
          },
          up: {
            entering: 'transform -translate-y-full opacity-0',
            entered: 'transform translate-y-0 opacity-100',
            exiting: 'transform translate-y-full opacity-0',
            exited: 'transform translate-y-full opacity-0',
          },
          down: {
            entering: 'transform translate-y-full opacity-0',
            entered: 'transform translate-y-0 opacity-100',
            exiting: 'transform -translate-y-full opacity-0',
            exited: 'transform -translate-y-full opacity-0',
          },
        }
        return `${baseClasses} ${slideClasses[direction][animationState]}`
      }
      case 'fade':
        return `${baseClasses} ${animationState === 'entered' ? 'opacity-100' : 'opacity-0'}`
      case 'scale': {
        let scaleClasses: string
        if (animationState === 'entered') {
          scaleClasses = 'scale-100 opacity-100'
        } else if (animationState === 'entering') {
          scaleClasses = 'scale-95 opacity-0'
        } else {
          scaleClasses = 'scale-105 opacity-0'
        }
        return `${baseClasses} ${scaleClasses}`
      }
      default:
        return baseClasses
    }
  }

  return (
    <div className={cn('w-full', getTransitionClasses(), className)} style={{ transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  )
}

// Specialized transition for calculator views
export interface CalculatorViewTransitionProps {
  children: ReactNode
  viewType: 'quick-reference' | 'calculator'
  isActive: boolean
  className?: string
}

/**
 * Specialized view transition configured for calculator and quick-reference screens.
 *
 * @param viewType - Determines the slide direction: 'calculator' uses 'right', otherwise 'left'.
 * @param isActive - Controls whether the view is visible.
 * @param className - Optional additional CSS classes applied to the outer container.
 * @returns The transition wrapper that renders the given children with the configured slide animation.
 */
export function CalculatorViewTransition({ children, viewType, isActive, className }: CalculatorViewTransitionProps) {
  return (
    <ViewTransition
      isVisible={isActive}
      animationType='slide'
      direction={viewType === 'calculator' ? 'right' : 'left'}
      duration={400}
      className={cn(
        'min-h-screen',
        // Ensure proper stacking and positioning
        'relative z-10',
        className,
      )}
    >
      {children}
    </ViewTransition>
  )
}

// Loading transition for smooth state changes
export interface LoadingTransitionProps {
  isLoading: boolean
  children: ReactNode
  loadingComponent?: ReactNode
  className?: string
}

/**
 * Cross-fades between provided content and a loading overlay based on loading state.
 *
 * @param isLoading - When `true`, shows the loading overlay; when `false`, shows `children`.
 * @param children - The primary content to display when not loading.
 * @param loadingComponent - Optional element to render while loading; a centered spinner is used if omitted.
 * @param className - Optional additional CSS classes applied to the outer container.
 * @returns A wrapper element that displays either the content or the loading overlay with fade transitions.
 */
export function LoadingTransition({ isLoading, children, loadingComponent, className }: LoadingTransitionProps) {
  const defaultLoadingComponent = (
    <div className='flex items-center justify-center min-h-[200px]'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      <ViewTransition isVisible={!isLoading} animationType='fade' duration={200}>
        {children}
      </ViewTransition>

      <ViewTransition isVisible={isLoading} animationType='fade' duration={200} className='absolute inset-0'>
        {loadingComponent || defaultLoadingComponent}
      </ViewTransition>
    </div>
  )
}
