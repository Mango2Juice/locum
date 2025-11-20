// src/components/ui/swipeable-card.tsx
'use client'

import { Heart, History, Share2, Trash2 } from 'lucide-react'
import { type ReactNode, useCallback } from 'react'
import { useSwipeableCard } from '@/hooks/use-swipeable-card'
import { cn } from '@/lib/utils'

interface SwipeAction {
  icon: ReactNode
  label: string
  onClick: () => void
  variant: 'favorite' | 'delete' | 'history' | 'share'
}

interface SwipeableCardProps {
  children: ReactNode
  onFavorite?: (() => void) | undefined
  onDelete?: (() => void) | undefined
  onHistory?: (() => void) | undefined
  onShare?: (() => void) | undefined
  enabled?: boolean | undefined
  className?: string | undefined
}

const actionStyles = {
  favorite: 'bg-pink-500 text-white',
  delete: 'bg-red-500 text-white',
  history: 'bg-blue-500 text-white',
  share: 'bg-green-500 text-white',
}

/**
 * A swipeable card wrapper that reveals action buttons on left/right swipe gestures.
 *
 * Left swipe reveals right-side actions (favorite, delete).
 * Right swipe reveals left-side actions (history, share).
 *
 * @param children - The card content to render
 * @param onFavorite - Callback when favorite action is triggered
 * @param onDelete - Callback when delete action is triggered
 * @param onHistory - Callback when history action is triggered
 * @param onShare - Callback when share action is triggered
 * @param enabled - Whether swipe gestures are enabled (default: true)
 * @param className - Additional CSS classes for the container
 * @returns A swipeable card component with hidden action buttons
 */
export function SwipeableCard({
  children,
  onFavorite,
  onDelete,
  onHistory,
  onShare,
  enabled = true,
  className,
}: SwipeableCardProps) {
  const leftActions: SwipeAction[] = []
  const rightActions: SwipeAction[] = []

  if (onHistory) {
    leftActions.push({
      icon: <History size={20} />,
      label: 'History',
      onClick: onHistory,
      variant: 'history',
    })
  }

  if (onShare) {
    leftActions.push({
      icon: <Share2 size={20} />,
      label: 'Share',
      onClick: onShare,
      variant: 'share',
    })
  }

  if (onFavorite) {
    rightActions.push({
      icon: <Heart size={20} />,
      label: 'Favorite',
      onClick: onFavorite,
      variant: 'favorite',
    })
  }

  if (onDelete) {
    rightActions.push({
      icon: <Trash2 size={20} />,
      label: 'Delete',
      onClick: onDelete,
      variant: 'delete',
    })
  }

  const handleSwipeLeft = useCallback(() => {
    // Swipe left reveals right actions
    // Actions will be visible via isRevealed state
  }, [])

  const handleSwipeRight = useCallback(() => {
    // Swipe right reveals left actions
    // Actions will be visible via isRevealed state
  }, [])

  const { swipeOffset, isRevealed, handlers, reset } = useSwipeableCard({
    threshold: 50,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    enabled: enabled && (leftActions.length > 0 || rightActions.length > 0),
  })

  const handleActionClick = useCallback(
    (action: SwipeAction) => {
      action.onClick()
      reset()
    },
    [reset],
  )

  // If no actions are provided, render children directly
  if (leftActions.length === 0 && rightActions.length === 0) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Actions (revealed on right swipe) */}
      {leftActions.length > 0 && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 flex items-center gap-2 px-2',
            'transition-opacity duration-200',
            isRevealed === 'left' ? 'opacity-100' : 'opacity-0',
          )}
        >
          {leftActions.map((action) => (
            <button
              key={action.label}
              type='button'
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[60px] h-full rounded-lg',
                'transition-all duration-200',
                'hover:scale-105 active:scale-95',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                actionStyles[action.variant],
              )}
              aria-label={action.label}
            >
              {action.icon}
              <span className='text-xs mt-1 font-medium'>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed on left swipe) */}
      {rightActions.length > 0 && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 flex items-center gap-2 px-2',
            'transition-opacity duration-200',
            isRevealed === 'right' ? 'opacity-100' : 'opacity-0',
          )}
        >
          {rightActions.map((action) => (
            <button
              key={action.label}
              type='button'
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[60px] h-full rounded-lg',
                'transition-all duration-200',
                'hover:scale-105 active:scale-95',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                actionStyles[action.variant],
              )}
              aria-label={action.label}
            >
              {action.icon}
              <span className='text-xs mt-1 font-medium'>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card Content */}
      <div
        {...handlers}
        className='relative z-10 bg-card'
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 200ms ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
