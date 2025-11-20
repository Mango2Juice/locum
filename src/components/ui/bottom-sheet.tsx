// src/components/ui/bottom-sheet.tsx
'use client'

import { X } from 'lucide-react'
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomSheetProps extends ComponentPropsWithoutRef<'div'> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
}

export const BottomSheet = forwardRef<ComponentRef<'div'>, BottomSheetProps>(
  ({ open, onOpenChange, title, description, children, className, ...props }, ref) => {
    const [mounted, setMounted] = useState(false)
    const internalSheetRef = useRef<HTMLDivElement | null>(null)
    const triggerRef = useRef<HTMLElement | null>(null)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      if (open) {
        triggerRef.current = document.activeElement as HTMLElement
        document.body.style.overflow = 'hidden'
        const timer = setTimeout(() => {
          internalSheetRef.current?.focus()
        }, 100)
        return () => {
          clearTimeout(timer)
          document.body.style.overflow = 'unset'
          triggerRef.current?.focus()
        }
      }
      document.body.style.overflow = 'unset'
      return undefined
    }, [open])

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onOpenChange(false)
        } else if (e.key === 'Tab' && open && internalSheetRef.current) {
          const focusableElements = internalSheetRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
          )
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus()
              e.preventDefault()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onOpenChange])

    if (!mounted) {
      return null
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    }

    const content = (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-end justify-center transition-all duration-300',
          open ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0 pointer-events-none',
        )}
        onClick={handleBackdropClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBackdropClick(e as unknown as React.MouseEvent)
          }
        }}
        aria-label='Close bottom sheet'
      >
        <div
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
            internalSheetRef.current = node
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={cn(
            'w-full max-w-md bg-background rounded-t-xl shadow-lg transition-transform duration-300 ease-out',
            'max-h-[85vh] overflow-hidden flex flex-col',
            open ? 'translate-y-0' : 'translate-y-full',
            className,
          )}
          {...props}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <div className='flex-1'>
              {title && (
                <h2 id={titleId} className='text-lg font-semibold leading-none tracking-tight'>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className='text-sm text-muted-foreground mt-1'>
                  {description}
                </p>
              )}
            </div>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0 ml-2' onClick={() => onOpenChange(false)}>
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-auto'>{children}</div>
        </div>
      </div>
    )

    return createPortal(content, document.body)
  },
)

BottomSheet.displayName = 'BottomSheet'

export default BottomSheet
