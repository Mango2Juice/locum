// src/hooks/use-swipe-gesture.ts
/**
 * @fileoverview Hook for handling swipe gestures on mobile devices
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  isActive: boolean
}

interface SwipeGestureOptions {
  /**
   * Minimum distance in pixels to register as a swipe
   */
  minDistance?: number
  /**
   * Maximum time in milliseconds for a swipe gesture
   */
  maxTime?: number
  /**
   * Maximum vertical movement allowed for horizontal swipe
   */
  maxVerticalMovement?: number
  /**
   * Whether to prevent default touch behavior
   */
  preventDefault?: boolean
  /**
   * Whether the swipe is enabled
   */
  enabled?: boolean
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeStart?: (startX: number, startY: number) => void
  onSwipeMove?: (deltaX: number, deltaY: number) => void
  onSwipeEnd?: () => void
}

/**
 * Hook for handling swipe gestures with customizable options
 * @lintignore Make exceptions for unused or duplicate exports - used by knip
 */
export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: SwipeCallbacks,
  options: SwipeGestureOptions = {},
) {
  const { minDistance = 50, maxTime = 300, maxVerticalMovement = 100, preventDefault = true, enabled = true } = options

  const swipeState = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isActive: false,
  })

  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false)
  const callbacksRef = useRef(callbacks)

  // Keep the ref updated with the latest callbacks
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return

      const touch = e.touches[0]
      if (!touch) return

      swipeState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: Date.now(),
        isActive: true,
      }

      setIsSwipeInProgress(true)
      callbacksRef.current.onSwipeStart?.(touch.clientX, touch.clientY)
    },
    [enabled],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !swipeState.current.isActive || e.touches.length !== 1) return

      const touch = e.touches[0]
      if (!touch) return

      swipeState.current.currentX = touch.clientX
      swipeState.current.currentY = touch.clientY

      const deltaX = touch.clientX - swipeState.current.startX
      const deltaY = touch.clientY - swipeState.current.startY

      // Only prevent default if horizontal movement is greater than vertical,
      // allowing for vertical scrolling.
      if (preventDefault && Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
      }

      callbacksRef.current.onSwipeMove?.(deltaX, deltaY)
    },
    [enabled, preventDefault],
  )

  const handleTouchEnd = useCallback(
    (_e: TouchEvent) => {
      if (!enabled || !swipeState.current.isActive) return

      const { startX, startY, currentX, currentY, startTime } = swipeState.current
      const deltaX = currentX - startX
      const deltaY = currentY - startY
      const deltaTime = Date.now() - startTime

      // Reset state
      swipeState.current.isActive = false
      setIsSwipeInProgress(false)
      callbacksRef.current.onSwipeEnd?.()

      // Check if it's a valid swipe
      const distance = Math.abs(deltaX)
      const verticalMovement = Math.abs(deltaY)

      if (distance >= minDistance && deltaTime <= maxTime && verticalMovement <= maxVerticalMovement) {
        if (deltaX > 0) {
          callbacksRef.current.onSwipeRight?.()
        } else {
          callbacksRef.current.onSwipeLeft?.()
        }
      }
    },
    [enabled, minDistance, maxTime, maxVerticalMovement],
  )

  const handleTouchCancel = useCallback(
    (_e: TouchEvent) => {
      if (!enabled) return

      swipeState.current.isActive = false
      setIsSwipeInProgress(false)
      callbacksRef.current.onSwipeEnd?.()
    },
    [enabled],
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [elementRef, enabled, preventDefault, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel])

  return {
    isSwipeInProgress,
  }
}
