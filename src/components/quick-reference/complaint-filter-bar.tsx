// src/components/quick-reference/complaint-filter-bar.tsx
'use client'

import { Filter, X } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import MobileSelect from '@/components/ui/mobile-select'
import { useDevice } from '@/hooks/use-device'
import { useScreenReader } from '@/hooks/use-screen-reader'
import type { QuickReferenceComplaintCategory as ComplaintCategory } from '@/lib/medication-reference'
import { cn } from '@/lib/utils'

interface ComplaintFilterBarProps {
  availableComplaints: ComplaintCategory[]
  selectedComplaint: string | null
  onComplaintChange: (complaint: string | null) => void
  className?: string
}

// Color mapping for complaint categories using Tailwind classes
const COMPLAINT_COLORS = {
  gray: {
    active: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600',
    inactive:
      'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800',
  },
  red: {
    active: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-600',
    inactive:
      'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900',
  },
  blue: {
    active: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-600',
    inactive:
      'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900',
  },
  orange: {
    active:
      'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-600',
    inactive:
      'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900',
  },
  green: {
    active: 'bg-green-100 text-green-900 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-600',
    inactive:
      'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900',
  },
  purple: {
    active:
      'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-600',
    inactive:
      'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900',
  },
  pink: {
    active: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-600',
    inactive:
      'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800 dark:hover:bg-pink-900',
  },
} as const

type ColorKey = keyof typeof COMPLAINT_COLORS

/**
 * Selects the Tailwind class string for a complaint category color based on active state.
 *
 * @param color - The complaint color key; if not found, falls back to `gray`.
 * @param isActive - When `true`, returns the color's active classes; when `false`, returns the inactive classes.
 * @returns The Tailwind CSS class string corresponding to the color and active state.
 */
function getComplaintColorClasses(color: string, isActive: boolean): string {
  const colorKey = color as ColorKey
  const colorConfig = COMPLAINT_COLORS[colorKey] || COMPLAINT_COLORS.gray
  return isActive ? colorConfig.active : colorConfig.inactive
}

/**
 * Render a responsive complaint category filter bar for selecting or clearing a complaint category.
 *
 * Renders nothing when there is one or zero categories. On mobile it shows a searchable select; on desktop it shows a horizontal list of category buttons. Selecting or clearing a category calls `onComplaintChange` with the selected category id (or `null` to clear) and emits an accessibility announcement. While a transition is pending, interactive buttons are visually dimmed and disabled.
 *
 * @param availableComplaints - Array of complaint category objects available for filtering. Each item must include `id`, `displayName`, and `color`.
 * @param selectedComplaint - Currently selected complaint id, or `null` when no specific category is selected.
 * @param onComplaintChange - Callback invoked with the new complaint id (or `null`) when the selection changes.
 * @param className - Optional additional container class names.
 * @returns The component's rendered JSX element, or `null` if no filter UI should be shown.
 */
export function ComplaintFilterBar({
  availableComplaints,
  selectedComplaint,
  onComplaintChange,
  className,
}: Readonly<ComplaintFilterBarProps>) {
  const { isMobile } = useDevice()
  const { announceStatus } = useScreenReader()
  const [isPending, startTransition] = useTransition()

  const handleComplaintClick = (complaintId: string | null) => {
    const complaint = availableComplaints.find((c) => c.id === complaintId)
    startTransition(() => {
      onComplaintChange(complaintId)
    })
    if (complaint) {
      announceStatus(`Filtering by ${complaint.displayName}`)
    } else {
      announceStatus('Showing all categories')
    }
  }

  if (availableComplaints.length <= 1) {
    return null
  }

  // Mobile and Tablet View: Use a searchable modal select
  if (isMobile) {
    const filterOptions = availableComplaints.map((c) => ({
      value: c.id,
      label: c.displayName,
    }))
    // Mobile View
    return (
      <div className={cn('w-full space-y-2', className)}>
        <div className='flex items-center justify-between'>
          <h2 className='hidden md:text-sm md:font-medium md:text-muted-foreground md:flex md:items-center gap-2'>
            <Filter size={16} />
            Filter by category
          </h2>
          {selectedComplaint && selectedComplaint !== 'all' && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-1 text-xs'
              onClick={() => handleComplaintClick(null)}
              aria-label='Clear filter'
            >
              <X className='w-3 h-3 mr-1' />
              Clear
            </Button>
          )}
        </div>
        <MobileSelect
          options={filterOptions}
          value={selectedComplaint || 'all'}
          onChange={(value) => handleComplaintClick(value === 'all' ? null : value)}
          placeholder='Select a category...'
          title='Filter by Category'
          searchPlaceholder='Search categories...'
          searchable={true}
        />
      </div>
    )
  }

  // Desktop View: Horizontal button list
  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('flex flex-wrap gap-2', isPending && 'opacity-75 transition-opacity')}
        role='tablist'
        aria-label='Filter drugs by complaint category'
      >
        {availableComplaints.map((complaint) => {
          const isActive = selectedComplaint === complaint.id || (!selectedComplaint && complaint.id === 'all')
          return (
            <Button
              key={complaint.id}
              variant='outline'
              size='sm'
              onClick={() => handleComplaintClick(complaint.id === 'all' ? null : complaint.id)}
              className={cn(
                'font-medium transition-all duration-200',
                getComplaintColorClasses(complaint.color, isActive),
                isActive && 'ring-2 ring-offset-2 ring-current/30 shadow-md',
              )}
              role='tab'
              aria-selected={isActive}
              disabled={isPending}
            >
              {complaint.displayName}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
