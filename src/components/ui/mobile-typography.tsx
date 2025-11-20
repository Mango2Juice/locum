// src/components/ui/mobile-typography.tsx

import type React from 'react'
import { cn } from '@/lib/utils'

interface MobileTextProps {
  children: React.ReactNode
  className?: string
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

// Mobile-optimized text component with proper scaling
export const MobileText: React.FC<MobileTextProps & { variant?: 'body' | 'caption' | 'small' }> = ({
  children,
  className,
  as: Component = 'p',
  variant = 'body',
}) => {
  const baseClasses = {
    body: 'mobile-readable',
    caption: 'detail-text',
    small: 'mobile-text-xs',
  }

  return <Component className={cn(baseClasses[variant], 'zoom-safe', className)}>{children}</Component>
}

// Mobile-optimized heading component
export const MobileHeading: React.FC<MobileTextProps & { level: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  children,
  className,
  level,
  as,
}) => {
  const Component = (as || (`h${level}` as keyof React.JSX.IntrinsicElements)) as React.ElementType

  const levelClasses = {
    1: 'mobile-text-3xl',
    2: 'mobile-text-2xl',
    3: 'mobile-text-xl',
    4: 'mobile-text-lg',
    5: 'mobile-text-base',
    6: 'mobile-text-sm',
  }

  return (
    <Component className={cn('mobile-heading', levelClasses[level], 'text-high-contrast', 'zoom-safe', className)}>
      {children}
    </Component>
  )
}

// Medication name component with enhanced readability
export const MedicationName: React.FC<MobileTextProps> = ({ children, className, as: Component = 'span' }) => {
  return (
    <Component className={cn('medication-name-display', 'text-high-contrast', 'zoom-safe', className)}>
      {children}
    </Component>
  )
}

// Dosage display component with maximum readability
export const DosageDisplay: React.FC<
  MobileTextProps & {
    primary?: boolean
    frequency?: string
  }
> = ({ children, className, as: Component = 'div', primary = false, frequency }) => {
  if (primary) {
    return (
      <div className='text-center space-y-1'>
        <Component className={cn('dosage-display', 'dosage-primary', 'text-primary', 'zoom-safe', className)}>
          {children}
        </Component>
        {frequency && <div className={cn('frequency-display', 'dosage-secondary', 'text-primary/90')}>{frequency}</div>}
      </div>
    )
  }

  return <Component className={cn('critical-info', 'text-high-contrast', 'zoom-safe', className)}>{children}</Component>
}

// Detail text component for secondary information
export const DetailText: React.FC<MobileTextProps & { muted?: boolean }> = ({
  children,
  className,
  as: Component = 'span',
  muted = false,
}) => {
  return (
    <Component
      className={cn('detail-text', muted ? 'enhanced-contrast-muted' : 'text-high-contrast', 'zoom-safe', className)}
    >
      {children}
    </Component>
  )
}

// High contrast wrapper for critical medical information
export const CriticalInfo: React.FC<MobileTextProps> = ({ children, className, as: Component = 'div' }) => {
  return (
    <Component className={cn('critical-info', 'enhanced-contrast', 'zoom-safe', 'p-2 rounded-md', className)}>
      {children}
    </Component>
  )
}
