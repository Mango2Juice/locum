/**
 * @fileoverview Scroll optimization hooks for better performance.
 * Includes passive event listeners, throttling, and Intersection Observer utilities.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseScrollOptions {
  throttleMs?: number
  passive?: boolean
}

/**
 * Hook for optimized scroll event handling with throttling
 * @param callback Function to call on scroll
 * @param options Configuration options
 */
export function useOptimizedScroll(callback: (scrollY: number) => void, options: UseScrollOptions = {}) {
  const { throttleMs = 100, passive = true } = options
  const lastCallRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)

  const handleScroll = useCallback(() => {
    const now = Date.now()

    if (now - lastCallRef.current >= throttleMs) {
      lastCallRef.current = now

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        callback(window.scrollY)
      })
    }
  }, [callback, throttleMs])

  useEffect(() => {
    const scrollOptions = passive ? { passive: true } : undefined
    window.addEventListener('scroll', handleScroll, scrollOptions)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, passive])
}

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook for scroll-based reveal animations using Intersection Observer
 * @param options Configuration options
 * @returns Ref to attach to element and visibility state
 */
export function useScrollReveal<T extends HTMLElement>(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<T>(null)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!triggerOnce || !hasTriggeredRef.current) {
              setIsVisible(true)
              hasTriggeredRef.current = true
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref: elementRef, isVisible }
}

/**
 * Hook for tracking scroll direction
 * @param threshold Minimum scroll distance to trigger direction change
 * @returns Current scroll direction
 */
export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollYRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY

        if (Math.abs(currentScrollY - lastScrollYRef.current) < threshold) {
          return
        }

        setScrollDirection(currentScrollY > lastScrollYRef.current ? 'down' : 'up')
        lastScrollYRef.current = currentScrollY
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [threshold])

  return scrollDirection
}

/**
 * Hook for lazy loading images on scroll
 * @returns Ref to attach to image element
 */
export function useLazyLoad<T extends HTMLImageElement>() {
  const imageRef = useRef<T>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (!image) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const { src } = img.dataset

            if (src) {
              img.src = src
              img.onload = () => setIsLoaded(true)
              observer.unobserve(img)
            }
          }
        }
      },
      {
        rootMargin: '50px',
      },
    )

    observer.observe(image)

    return () => {
      observer.disconnect()
    }
  }, [])

  return { ref: imageRef, isLoaded }
}

/**
 * Hook for throttling any function
 * @param callback Function to throttle
 * @param delay Throttle delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const lastCallRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now()
            callback(...args)
          },
          delay - (now - lastCallRef.current),
        )
      }
    },
    [callback, delay],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}
