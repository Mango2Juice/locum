import '@testing-library/jest-dom'

// Polyfill ResizeObserver for Radix UI components in JSDOM
// Improve typings and method signatures so TypeScript understands the shape.
declare global {
  interface GlobalThis {
    ResizeObserver?: new (callback?: ResizeObserverCallback) => ResizeObserver
  }
}

class ResizeObserverPolyfill implements ResizeObserver {
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
}

// Use typeof check to avoid potential ReferenceErrors and be explicit.
if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: ResizeObserverPolyfill,
    writable: true,
    configurable: true,
  })
}
