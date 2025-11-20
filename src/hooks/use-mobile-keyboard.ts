/**
 * @fileoverview Hook for handling mobile keyboard interactions and viewport adjustments
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface MobileKeyboardState {
  isVisible: boolean
  height: number
  viewportHeight: number
}

interface UseMobileKeyboardOptions {
  /**
   * Whether to automatically adjust viewport when keyboard appears
   */
  adjustViewport?: boolean
  /**
   * Callback when keyboard visibility changes
   */
  onKeyboardToggle?: (isVisible: boolean, height: number) => void
}

/**
 * Compute whether a keyboard is visible and its height from initial and current viewport heights.
 *
 * @param initialHeight - The viewport height recorded before any keyboard appeared.
 * @param currentHeight - The current viewport height to compare against `initialHeight`.
 * @returns `isVisible` is `true` if the viewport height decreased by more than 150 pixels; `height` is the detected keyboard height in pixels (0 if not visible).
 */
function getNewKeyboardState(
  initialHeight: number,
  currentHeight: number,
): Omit<MobileKeyboardState, 'viewportHeight'> {
  // A significant reduction in viewport height indicates the keyboard is visible.
  const KEYBOARD_THRESHOLD_PX = 150
  const heightDifference = initialHeight - currentHeight
  const isKeyboardVisible = heightDifference > KEYBOARD_THRESHOLD_PX
  const keyboardHeight = isKeyboardVisible ? heightDifference : 0

  return {
    isVisible: isKeyboardVisible,
    height: keyboardHeight,
  }
}

/**
 * Manage mobile keyboard visibility, keyboard height, and viewport-related helpers for responsive layouts.
 *
 * Tracks the viewport height to detect keyboard appearance (using a height-difference threshold), updates keyboard metrics, optionally adjusts viewport CSS variables, and provides helpers to scroll elements into view when the keyboard is visible.
 *
 * @param options - Configuration options for the hook
 * @param options.adjustViewport - If `true`, exposes CSS custom properties for the keyboard and viewport sizes; if `false`, `getViewportStyles` returns an empty object. Defaults to `true`.
 * @param options.onKeyboardToggle - Optional callback invoked when keyboard visibility changes with `(isVisible, height)` where `isVisible` is `true` if the keyboard is visible and `height` is the detected keyboard height in pixels.
 * @returns An object containing:
 *  - `keyboard`: the current keyboard state with `isVisible` (`true` if keyboard is visible), `height` (keyboard height in pixels), and `viewportHeight` (current viewport height in pixels);
 *  - `scrollIntoView(element, options?)`: scrolls the given element into view when the keyboard is visible (uses smooth behavior and centers the element);
 *  - `getViewportStyles()`: returns React CSS properties mapping `--keyboard-height`, `--viewport-height`, and `--available-height` to pixel values when `adjustViewport` is enabled, otherwise an empty object.
 */
export function useMobileKeyboard(options: UseMobileKeyboardOptions = {}) {
  const { adjustViewport = true, onKeyboardToggle } = options

  const [keyboardState, setKeyboardState] = useState<MobileKeyboardState>({
    isVisible: false,
    height: 0,
    viewportHeight: globalThis.window === undefined ? 0 : globalThis.window.innerHeight,
  })
  // Use direct undefined comparison instead of `typeof`
  const isClient = globalThis.window !== undefined

  useEffect(() => {
    if (!isClient) return

    const viewportHeight = globalThis.window === undefined ? 0 : globalThis.window.innerHeight
    setKeyboardState((prev) => ({
      ...prev,
      viewportHeight,
    }))
  }, [isClient])
  const initialViewportHeight = useRef<number>(globalThis.window === undefined ? 0 : globalThis.window.innerHeight)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleViewportChange = useCallback(() => {
    if (globalThis.window === undefined) return

    // Clear any existing timeout to debounce the event
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce to avoid rapid updates during animations
    debounceTimeoutRef.current = setTimeout(() => {
      const currentViewportHeight = window.innerHeight
      const newKeyboardMetrics = getNewKeyboardState(initialViewportHeight.current, currentViewportHeight)

      setKeyboardState((previousState) => {
        const newState = {
          ...newKeyboardMetrics,
          viewportHeight: currentViewportHeight,
        }

        // Only call the callback if the visibility state has actually changed
        if (previousState.isVisible !== newState.isVisible) {
          onKeyboardToggle?.(newState.isVisible, newState.height)
        }

        return newState
      })
    }, 100)
  }, [onKeyboardToggle])

  // Initialize viewport height on client mount
  useEffect(() => {
    if (globalThis.window === undefined) return

    initialViewportHeight.current = window.innerHeight
    setKeyboardState((prev) => ({
      ...prev,
      viewportHeight: window.innerHeight,
    }))
  }, [])

  useEffect(() => {
    if (globalThis.window === undefined) {
      return
    }

    if (adjustViewport === false) {
      return
    }

    const eventTarget = window.visualViewport ?? globalThis.window
    eventTarget.addEventListener('resize', handleViewportChange)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      eventTarget.removeEventListener('resize', handleViewportChange)
    }
  }, [adjustViewport, handleViewportChange])

  /**
   * Scroll an element into view when keyboard appears
   */
  const scrollIntoView = useCallback(
    (element: HTMLElement, options?: ScrollIntoViewOptions) => {
      if (keyboardState.isVisible) {
        // Add a small delay to ensure keyboard is fully visible
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            ...options,
          })
        }, 300)
      }
    },
    [keyboardState.isVisible],
  )

  /**
   * Get CSS custom properties for viewport adjustments
   */
  const getViewportStyles = useCallback(() => {
    if (!adjustViewport) return {}

    return {
      '--keyboard-height': `${keyboardState.height}px`,
      '--viewport-height': `${keyboardState.viewportHeight}px`,
      '--available-height': `${keyboardState.viewportHeight}px`,
    } as React.CSSProperties
  }, [adjustViewport, keyboardState])

  return {
    keyboard: keyboardState,
    scrollIntoView,
    getViewportStyles,
  }
}
