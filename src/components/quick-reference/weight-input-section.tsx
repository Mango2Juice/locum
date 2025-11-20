// src/components/quick-reference/weight-input-section.tsx
'use client'

import { Weight } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { MobileFormField } from '@/components/ui/mobile-form'
import { MobileInput } from '@/components/ui/mobile-input'
import { useDevice } from '@/hooks/use-device'
import { useScreenReader } from '@/hooks/use-screen-reader'
import { useCalculatorStore } from '@/lib/stores/calculator-store'
import { cn } from '@/lib/utils'

interface WeightInputSectionProps {
  disabled?: boolean
}

/**
 * Render a weight input section for entering patient weight in kilograms with validation, debounced updates to the calculator store, and screen reader announcements.
 *
 * @returns The rendered weight input section as JSX
 */
export function WeightInputSection({ disabled }: Readonly<WeightInputSectionProps>) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { isMobile } = useDevice()
  const { announceStatus } = useScreenReader()

  const { displayWeight, setDisplayWeight, setIsWeightManuallyEntered } = useCalculatorStore()

  const inputId = useId()
  const descriptionId = useId()

  const debouncedWeightChange = useCallback(
    (newWeight: number | undefined, isManual: boolean) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        setDisplayWeight(newWeight)
        setIsWeightManuallyEntered(isManual)

        if (newWeight === undefined) {
          announceStatus('Weight cleared')
        } else {
          announceStatus(`Weight updated to ${newWeight} kilograms`)
        }
      }, 300)
    },
    [setDisplayWeight, setIsWeightManuallyEntered, announceStatus],
  )

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        debouncedWeightChange(undefined, false) // Not a manual entry if cleared
        return
      }

      const numericValue = Number.parseFloat(value)
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        debouncedWeightChange(numericValue, true)
      } else {
        // If user types something invalid, we still call onWeightChange with undefined
        // to clear any existing calculations based on a now-invalid weight.
        debouncedWeightChange(undefined, true)
      }
    },
    [debouncedWeightChange],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const displayValue = displayWeight === undefined ? '' : String(displayWeight)

  return (
    <div className='relative' id='weight-input'>
      <MobileFormField className={cn('space-y-2', isMobile && 'space-y-2')}>
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className={cn('flex items-center gap-2 font-semibold', isMobile ? 'text-sm' : 'text-base')}
          >
            <Weight size={isMobile ? 16 : 20} className='text-primary' />
            Weight (Optional)
          </Label>
        </div>

        <div id={descriptionId} className='sr-only'></div>

        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <MobileInput
              id={inputId}
              name='quick-weight'
              type='text'
              mobileKeyboard='decimal'
              placeholder='e.g., 15.5'
              value={displayValue}
              onChange={handleInputChange}
              scrollIntoViewOnFocus={true}
              size={isMobile ? 'default' : 'lg'}
              className='text-base font-medium pr-12'
              disabled={disabled}
              min='0'
              step='0.1'
              showValidationIcon={false}
              aria-label='Patient weight in kilograms'
              aria-describedby={descriptionId}
            />
            <label
              htmlFor={inputId}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground cursor-text',
                isMobile ? 'text-sm' : 'text-base',
              )}
            >
              kg
            </label>
          </div>
        </div>
      </MobileFormField>
    </div>
  )
}
