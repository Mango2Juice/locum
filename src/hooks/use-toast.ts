// src/hooks/use-toast.ts
'use client'
import type React from 'react'
import { useEffect } from 'react'
import { create } from 'zustand'
import type { ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000
const TOAST_ANIMATION_DURATION = 1000 // A bit longer to ensure animations complete

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

interface ToastState {
  toasts: ToasterToast[]
  timeouts: Map<string, ReturnType<typeof setTimeout>>
  addToast: (toast: ToasterToast) => void
  updateToast: (toast: Partial<ToasterToast>) => void
  dismissToast: (toastId?: string) => void
  removeToast: (toastId?: string) => void
  cleanupTimeouts: () => void
}

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  timeouts: new Map(),
  addToast: (toast: ToasterToast) => {
    set((state) => {
      const newToasts = [toast, ...state.toasts].slice(0, TOAST_LIMIT)
      const newTimeouts = new Map(state.timeouts)

      // Clear any existing timeout for this toast ID to reset its lifecycle
      const existingTimeout = newTimeouts.get(toast.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set a new timeout for dismissal
      const timeoutId = setTimeout(() => {
        get().dismissToast(toast.id)
      }, toast.duration ?? TOAST_REMOVE_DELAY)

      newTimeouts.set(toast.id, timeoutId)

      return { toasts: newToasts, timeouts: newTimeouts }
    })
  },
  updateToast: (toast) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)),
    }))
  },
  dismissToast: (toastId) => {
    set((state) => {
      const newTimeouts = new Map(state.timeouts)

      const idsToDismiss = toastId ? [toastId] : state.toasts.map((t) => t.id)

      for (const id of idsToDismiss) {
        // Clear any pending dismiss timeout
        const existingTimeout = newTimeouts.get(id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          newTimeouts.delete(id)
        }

        // Set a new timeout to *remove* the toast after the animation
        const removalTimeout = setTimeout(() => {
          get().removeToast(id)
        }, TOAST_ANIMATION_DURATION)
        newTimeouts.set(id, removalTimeout)
      }

      return {
        toasts: state.toasts.map((t) => (idsToDismiss.includes(t.id) ? { ...t, open: false } : t)),
        timeouts: newTimeouts,
      }
    })
  },
  removeToast: (toastId) => {
    set((state) => {
      const newTimeouts = new Map(state.timeouts)

      if (toastId) {
        const timeoutId = newTimeouts.get(toastId)
        if (timeoutId) {
          clearTimeout(timeoutId)
          newTimeouts.delete(toastId)
        }
        return {
          toasts: state.toasts.filter((t) => t.id !== toastId),
          timeouts: newTimeouts,
        }
      } else {
        for (const timeoutId of Array.from(newTimeouts.values())) {
          clearTimeout(timeoutId)
        }
        return {
          toasts: [],
          timeouts: new Map(),
        }
      }
    })
  },
  cleanupTimeouts: () => {
    const { timeouts } = get()
    for (const timeoutId of Array.from(timeouts.values())) {
      clearTimeout(timeoutId)
    }
    set({ timeouts: new Map() })
  },
}))

let count = 0
/**
 * Generates a unique ID for a toast notification.
 * This function combines a timestamp, a small counter, and a random string
 * to ensure a high degree of uniqueness, preventing collisions even with
 * frequent calls.
 */
function genId() {
  count = (count + 1) % 1000 // Keep counter small and cycling
  return `${Date.now()}-${count}-${Math.random().toString(36).substring(2, 9)}`
}

type Toast = Omit<ToasterToast, 'id'>

function toast(props: Toast) {
  const id = genId()
  const { addToast, updateToast, dismissToast } = useToastStore.getState()

  const update = (newProps: Partial<ToasterToast>) => updateToast({ ...newProps, id })
  const dismiss = () => dismissToast(id)

  addToast({
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        dismiss()
      }
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const state = useToastStore()

  useEffect(() => {
    const cleanup = useToastStore.getState().cleanupTimeouts
    window.addEventListener('beforeunload', cleanup)
    return () => {
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  return {
    ...state,
    toast,
  }
}

/** @lintignore */
export { useToast, toast }
