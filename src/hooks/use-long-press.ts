// src/hooks/use-long-press.ts
'use client'

import { useCallback, useRef } from 'react'

interface LongPressOptions {
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void
  onPress?: (event: React.TouchEvent | React.MouseEvent) => void
  duration?: number
  enabled?: boolean
  onPressStart?: () => void
  onPressEnd?: () => void
}

interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseUp: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
}

/**
 * Detects long-press gestures and provides event handlers for touch and mouse interactions.
 *
 * The returned handlers start a timed detection on press start, invoke `onLongPress` when the
 * press duration elapses, call `onPress` if released before the duration, and expose optional
 * start/end callbacks for visual or haptic feedback.
 *
 * @param options - Configuration options for long-press behavior
 * @param options.onLongPress - Callback invoked when the long-press duration is reached; receives the originating event
 * @param options.onPress - Optional callback invoked when the press ends before the long-press duration; receives the originating event
 * @param options.duration - Long-press duration in milliseconds (default: 500)
 * @param options.enabled - Whether long-press detection is enabled (default: true)
 * @param options.onPressStart - Optional callback invoked when a press starts (useful for visual feedback)
 * @param options.onPressEnd - Optional callback invoked when a press ends (useful for visual feedback)
 * @returns An object containing event handlers to attach to elements: `onTouchStart`, `onTouchEnd`, `onTouchMove`, `onMouseDown`, `onMouseUp`, and `onMouseLeave`
 */
export function useLongPress({
  onLongPress,
  onPress,
  duration = 500,
  enabled = true,
  onPressStart,
  onPressEnd,
}: LongPressOptions): LongPressHandlers {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const startPositionRef = useRef<{ x: number; y: number } | null>(null)
  const eventRef = useRef<React.TouchEvent | React.MouseEvent | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    isLongPressRef.current = false
    startPositionRef.current = null
    eventRef.current = null
    onPressEnd?.()
  }, [onPressEnd])

  const handleStart = useCallback(
    (event: React.TouchEvent | React.MouseEvent, clientX: number, clientY: number) => {
      if (!enabled) return

      eventRef.current = event
      startPositionRef.current = { x: clientX, y: clientY }
      isLongPressRef.current = false

      onPressStart?.()

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true
        onLongPress(event)

        // Trigger haptic feedback if available, with error handling
        try {
          const nav = globalThis.navigator as
            | (Navigator & { vibrate?: (pattern: number | number[]) => boolean })
            | undefined
          if (nav?.vibrate) {
            nav.vibrate(50) // Heavy impact
          }
        } catch (err) {
          // Log unexpected failures so they can be diagnosed instead of being silently ignored.
          // eslint-disable-next-line no-console
          console.error('Long press vibration failed:', err)
        }
      }, duration)
    },
    [enabled, duration, onLongPress, onPressStart],
  )

  const handleEnd = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!enabled) return

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      if (!isLongPressRef.current && onPress) {
        onPress(event)
      }

      clear()
    },
    [enabled, onPress, clear],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled || !startPositionRef.current) return

      // Cancel long-press if finger/mouse moves too far
      const moveThreshold = 10 // pixels
      const dx = clientX - startPositionRef.current.x
      const dy = clientY - startPositionRef.current.y
      const distance = Math.hypot(dx, dy)

      if (distance > moveThreshold) {
        clear()
      }
    },
    [enabled, clear],
  )

  const handlers: LongPressHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) {
        handleStart(e, e.touches[0].clientX, e.touches[0].clientY)
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleEnd(e)
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    },
    onMouseDown: (e: React.MouseEvent) => {
      handleStart(e, e.clientX, e.clientY)
    },
    onMouseUp: (e: React.MouseEvent) => {
      handleEnd(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleEnd(e)
    },
  }

  return handlers
}
