import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string | undefined
  variant?: 'text' | 'circular' | 'rectangular'
}

/**
 * Renders an animated skeleton placeholder for loading states.
 *
 * The rendered element uses an ARIA label of "Loading content".
 *
 * @param className - Additional CSS classes to apply to the root element
 * @param variant - Shape variant: `'text'` renders a single-line bar, `'circular'` renders a circle, `'rectangular'` renders a rounded rectangle (default: `'rectangular'`)
 * @returns A div element styled as an animated skeleton placeholder with an aria-label of "Loading content"
 */
const variantClasses = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
}

export function SkeletonLoader({ className, variant = 'rectangular' }: SkeletonLoaderProps) {
  return (
    <div className={cn('animate-pulse bg-muted', variantClasses[variant], className)} aria-label='Loading content' />
  )
}

interface SkeletonGroupProps {
  lines?: number
  className?: string | undefined
}

/**
 * Render a vertical group of text skeleton loaders.
 *
 * Renders `lines` text skeletons stacked with vertical spacing; the final line is shortened to 75% width.
 *
 * @param lines - Number of skeleton lines to render (default: 3)
 * @param className - Additional class names applied to the container
 * @returns The container element containing the generated skeleton loaders
 */
export function SkeletonGroup({ lines = 3, className }: SkeletonGroupProps) {
  const skeletonLines = Array.from({ length: lines }, (_, i) => ({
    id: `skeleton-${i}-${Date.now()}`,
    isLast: i === lines - 1,
  }))

  return (
    <div className={cn('space-y-3', className)}>
      {skeletonLines.map((line) => (
        <SkeletonLoader key={line.id} variant='text' className={line.isLast ? 'w-3/4' : undefined} />
      ))}
    </div>
  )
}
