// src/components/quick-reference/drug-dosage-card.tsx
'use client'

import { AlertTriangle, Heart, History, Share2, Trash2 } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useCallback, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ContextMenuOverlay } from '@/components/ui/context-menu-overlay'
import { SwipeableCard } from '@/components/ui/swipeable-card'
import { useDevice } from '@/hooks/use-device'
import { useLongPress } from '@/hooks/use-long-press'
import type {
  QuickReferenceCalculation,
  QuickReferenceComplaintCategory,
  QuickReferenceMedication,
} from '@/lib/quick-reference-database'
import { cn } from '@/lib/utils'
import { AriaLabels } from '@/lib/utils/accessibility/labels'

interface DrugDosageCardProps {
  drug: QuickReferenceMedication
  calculationResult: QuickReferenceCalculation | null
  categories: readonly QuickReferenceComplaintCategory[]
  onClick?: (() => void) | undefined
  onFavorite?: (() => void) | undefined
  onDelete?: (() => void) | undefined
  onHistory?: (() => void) | undefined
  onShare?: (() => void) | undefined
  enableSwipe?: boolean | undefined
  enableLongPress?: boolean | undefined
  className?: string | undefined
}

// Color mapping for medication types based on complaint tags
const MEDICATION_TYPE_COLORS = {
  gray: {
    text: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-600 text-white',
  },
  red: {
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-600 text-white',
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-600 text-white',
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-600 text-white',
  },
  green: {
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-600 text-white',
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-600 text-white',
  },
  pink: {
    text: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-600 text-white',
  },
  yellow: {
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-600 text-white',
  },
  default: {
    text: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-600 text-white',
  },
} as const

type ColorKey = keyof typeof MEDICATION_TYPE_COLORS

/**
 * Selects the primary complaint category for a medication from the provided categories.
 *
 * Searches the medication's `complaintCategories` for the first category present in `categories`
 * (ignoring the `'all'` tag). If none match, prefers the category with id `'symptomatic'`.
 * If no suitable category is found, returns a built-in default general category.
 *
 * @param drug - The medication object whose complaint category tags will be matched.
 * @param categories - The available complaint categories to search.
 * @returns The matching `QuickReferenceComplaintCategory`, the `'symptomatic'` category if no direct match, or a default general category when no match exists.
 */
function getPrimaryComplaintCategory(
  drug: QuickReferenceMedication,
  categories: readonly QuickReferenceComplaintCategory[],
): QuickReferenceComplaintCategory {
  const primaryTag = drug.complaintCategories?.find((tag) =>
    categories.some((cat) => cat.id === tag && cat.id !== 'all'),
  )

  const foundCategory =
    categories.find((cat) => cat.id === primaryTag) || categories.find((cat) => cat.id === 'symptomatic')

  if (!foundCategory) {
    // Fallback category if categories array is empty or no match is found
    return {
      id: 'default',
      name: 'general',
      displayName: 'General',
      color: 'gray',
      enabled: true,
      sortOrder: 99,
    }
  }

  return foundCategory
}

/**
 * Selects the color styling entry for a complaint category.
 *
 * @param complaintCategory - The complaint category whose `color` key is used to look up the styling mapping
 * @returns The color/style mapping from MEDICATION_TYPE_COLORS corresponding to the category's color, or the default mapping if no match is found
 */
function getMedicationTypeColors(complaintCategory: QuickReferenceComplaintCategory) {
  const color = complaintCategory.color
  if (color in MEDICATION_TYPE_COLORS) {
    return MEDICATION_TYPE_COLORS[color as ColorKey]
  }
  return MEDICATION_TYPE_COLORS.default
}

/**
 * Format a calculation result's dosage into a concise, human-readable string.
 *
 * Chooses units based on available fields: prefers `adminVolumeMl` (milliliters) if present,
 * otherwise uses `doseMg` and represents it in grams when >= 1000 mg or in milligrams when < 1000 mg.
 *
 * @param calculationResult - The calculation result whose dosage should be formatted
 * @returns The formatted dosage, e.g. "2.5 mL", "1.2 g", or "250 mg"
 */
function formatDosage(calculationResult: QuickReferenceCalculation): string {
  const { adminVolumeMl, doseMg } = calculationResult

  if (adminVolumeMl !== null) {
    return `${adminVolumeMl.toFixed(1)} mL`
  }

  if (doseMg >= 1000) {
    return `${(doseMg / 1000).toFixed(1)} g`
  }
  return `${doseMg.toFixed(0)} mg`
}

/**
 * Normalize common medication frequency text to a standardized abbreviation.
 *
 * @param frequencyText - The frequency string to normalize (e.g., `od`, `once daily`, `twice daily`)
 * @returns The standardized uppercase abbreviation (e.g., `OD`, `BD`, `TDS`); returns the input converted to uppercase if no mapping exists
 */
function formatFrequency(frequencyText: string): string {
  const frequencyMap: Record<string, string> = {
    od: 'OD',
    bd: 'BD',
    tds: 'TDS',
    qid: 'QID',
    on: 'ON',
    om: 'OM',
    prn: 'PRN',
    eod: 'EOD',
    'once daily': 'OD',
    'twice daily': 'BD',
    'three times daily': 'TDS',
    'four times daily': 'QID',
  }
  return frequencyMap[frequencyText.toLowerCase()] || frequencyText.toUpperCase()
}

/**
 * Display a medication card showing the drug name and either a formatted dosage with frequency or a loading skeleton.
 *
 * When `calculationResult` is null a loading skeleton is shown. When provided, the card shows the formatted dosage and frequency or an inline error indicator if the calculation is invalid. The card can expose click, swipe, and long-press actions via the supplied callbacks.
 *
 * @param drug - Medication data used for the name and category-based styling
 * @param calculationResult - Calculation details to display; pass `null` to render the loading skeleton
 * @param categories - Available complaint categories used to determine the primary category for styling
 * @param onClick - Optional callback invoked when the card is clicked or activated via keyboard
 * @param onFavorite - Optional callback for the favorite action
 * @param onDelete - Optional callback for the delete action
 * @param onHistory - Optional callback for the history action
 * @param onShare - Optional callback for the share action
 * @param enableSwipe - Whether to enable swipe gestures (defaults to true on mobile)
 * @param enableLongPress - Whether to enable long-press context menu (defaults to true on mobile)
 * @param className - Optional additional CSS class names applied to the root element
 * @returns The JSX element for the drug dosage card
 */
export function DrugDosageCard({
  drug,
  calculationResult,
  categories,
  onClick,
  onFavorite,
  onDelete,
  onHistory,
  onShare,
  enableSwipe = true,
  enableLongPress = true,
  className,
}: DrugDosageCardProps) {
  const { isMobile } = useDevice()
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [isPressing, setIsPressing] = useState(false)
  const primaryCategory = getPrimaryComplaintCategory(drug, categories)
  const colors = getMedicationTypeColors(primaryCategory)

  const handleClick = useCallback(() => {
    if (!isPressing) {
      onClick?.()
    }
  }, [onClick, isPressing])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick?.()
      }
    },
    [onClick],
  )

  const handleLongPress = useCallback(() => {
    setIsContextMenuOpen(true)
  }, [])

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPress,
    onPress: handleClick,
    duration: 500,
    enabled: enableLongPress && isMobile && (!!onFavorite || !!onDelete || !!onHistory || !!onShare),
    onPressStart: () => setIsPressing(true),
    onPressEnd: () => setIsPressing(false),
  })

  const contextMenuItems = []
  if (onFavorite) {
    contextMenuItems.push({
      icon: <Heart size={20} />,
      label: 'Add to Favorites',
      onClick: onFavorite,
    })
  }
  if (onHistory) {
    contextMenuItems.push({
      icon: <History size={20} />,
      label: 'View History',
      onClick: onHistory,
    })
  }
  if (onShare) {
    contextMenuItems.push({
      icon: <Share2 size={20} />,
      label: 'Share',
      onClick: onShare,
    })
  }
  if (onDelete) {
    contextMenuItems.push({
      icon: <Trash2 size={20} />,
      label: 'Remove',
      onClick: onDelete,
      variant: 'destructive' as const,
    })
  }

  const isClickable = !!onClick

  if (!calculationResult) {
    return (
      <div className={cn('p-3 animate-pulse', isMobile ? 'min-h-[60px]' : 'min-h-[68px]', className)}>
        <div className='h-4 bg-muted rounded w-3/4 mb-2' />
        <div className='h-8 bg-muted rounded w-1/2' />
      </div>
    )
  }

  const isValidCalculation = calculationResult.isCalculationValid

  const dosageText = `${formatDosage(calculationResult)} ${formatFrequency(calculationResult.frequencyText)}`
  const cardAriaLabel = isClickable
    ? `${AriaLabels.drugDosageCard(drug.name, dosageText)}. Press Enter or Space to view details.`
    : AriaLabels.drugDosageCard(drug.name, dosageText)

  const cardContent = (
    <>
      <button
        type='button'
        className={cn(
          'padding-inline gap-inline transition-all duration-200 h-full w-full text-left flex flex-col justify-between',
          'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isPressing && 'scale-95',
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={cardAriaLabel}
        {...(enableLongPress && isMobile ? longPressHandlers : {})}
      >
        <div className='gap-inline' style={{ display: 'flex', flexDirection: 'column' }}>
          <p className={cn('text-sm font-medium truncate', colors.text)}>{drug.name}</p>
          {isValidCalculation ? (
            <Badge className={cn('font-bold', colors.badge, isMobile ? 'text-sm px-3 py-1' : 'text-base px-4 py-1.5')}>
              {dosageText}
            </Badge>
          ) : (
            <div className='flex items-center gap-inline text-destructive'>
              <AlertTriangle size={12} />
              <span className='text-xs font-medium'>Calculation Error</span>
            </div>
          )}
        </div>
      </button>

      {/* Context Menu */}
      <ContextMenuOverlay
        isOpen={isContextMenuOpen}
        onClose={() => setIsContextMenuOpen(false)}
        items={contextMenuItems}
        title={drug.name}
      />
    </>
  )

  // Wrap with SwipeableCard if swipe is enabled and on mobile
  if (enableSwipe && isMobile) {
    return (
      <SwipeableCard
        onFavorite={onFavorite}
        onDelete={onDelete}
        onHistory={onHistory}
        onShare={onShare}
        enabled={enableSwipe}
        className={className}
      >
        {cardContent}
      </SwipeableCard>
    )
  }

  return <div className={className}>{cardContent}</div>
}
