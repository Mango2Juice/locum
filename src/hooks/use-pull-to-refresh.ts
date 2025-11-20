// src/hooks/use-pull-to-refresh.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  threshold?: number | undefined
  onRefresh: () => Promise<void> | void
  enabled?: boolean | undefined
  onThresholdReached?: (() => void) | undefined
}

type RefreshState = 'idle' | 'pulling' | 'threshold' | 'refreshing' | 'complete'

interface PullToRefreshReturn {
  state: RefreshState
  pullDistance: number
  progress: number
  containerRef: React.RefObject<HTMLElement | null>
}

/**
 * Custom hook for implementing pull-to-refresh functionality.
 *
 * Tracks vertical pull gestures and triggers refresh callback when threshold is exceeded.
 * Provides state machine for UI feedback during the refresh cycle.
 *
 * @param options - Configuration options for pull-to-refresh behavior
 * @param options.threshold - Minimum pull distance in pixels to trigger refresh (default: 80)
 * @param options.onRefresh - Async callback invoked when refresh is triggered
 * @param options.enabled - Whether pull-to-refresh is enabled (default: true)
 * @param options.onThresholdReached - Optional callback when threshold is reached (for haptic feedback)
 * @returns Object containing refresh state, pull distance, progress, and container ref
 */
export function usePullToRefresh({
  threshold = 80,
  onRefresh,
  enabled = true,
  onThresholdReached,
}: PullToRefreshOptions): PullToRefreshReturn {
  const [state, setState] = useState<RefreshState>('idle')
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLElement>(null)
  const startYRef = useRef<number | null>(null)
  const currentYRef = useRef<number | null>(null)
  const isPullingRef = useRef(false)
  const thresholdReachedRef = useRef(false)

  const progress = Math.min((pullDistance / threshold) * 100, 100)

  const reset = useCallback(() => {
    setPullDistance(0)
    setState('idle')
    startYRef.current = null
    currentYRef.current = null
    isPullingRef.current = false
    thresholdReachedRef.current = false
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || state !== 'idle') return

      const container = containerRef.current
      if (!container) return

      // Only start pull if at the top of the scroll container
      if (container.scrollTop === 0 && e.touches[0]) {
        startYRef.current = e.touches[0].clientY
        currentYRef.current = e.touches[0].clientY
        isPullingRef.current = true
        setState('pulling')
      }
    },
    [enabled, state],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isPullingRef.current || startYRef.current === null) return

      const container = containerRef.current
      if (!container) return

      // Stop pulling if user scrolls down
      if (container.scrollTop > 0) {
        reset()
        return
      }

      if (!e.touches[0]) return

      currentYRef.current = e.touches[0].clientY
      const diff = currentYRef.current - startYRef.current

      // Only allow pulling down
      if (diff > 0) {
        // Prevent default to stop page scroll
        e.preventDefault()

        // Apply resistance to pull distance (diminishing returns)
        const resistance = 0.5
        const distance = diff * resistance

        setPullDistance(distance)

        if (distance >= threshold) {
          if (!thresholdReachedRef.current) {
            setState('threshold')
            thresholdReachedRef.current = true
            onThresholdReached?.()
          }
        } else {
          setState('pulling')
          thresholdReachedRef.current = false
        }
      }
    },
    [enabled, threshold, onThresholdReached, reset],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isPullingRef.current) return

    isPullingRef.current = false

    if (pullDistance >= threshold) {
      setState('refreshing')
      setPullDistance(threshold) // Lock at threshold during refresh

      try {
        await onRefresh()
        setState('complete')
        // Show complete state briefly
        setTimeout(() => {
          reset()
        }, 500)
      } catch (error) {
        console.error('Pull-to-refresh error:', error)
        reset()
      }
    } else {
      reset()
    }
  }, [enabled, pullDistance, threshold, onRefresh, reset])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    state,
    pullDistance,
    progress,
    containerRef,
  }
}
