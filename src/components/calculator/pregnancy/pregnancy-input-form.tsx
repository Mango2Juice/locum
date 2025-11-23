// src/components/calculator/pregnancy/pregnancy-input-form.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ResponsiveDatePicker } from '@/components/ui/responsive-date-picker'
import type { CalculationMethod } from '@/hooks/use-pregnancy-calculator'

interface PregnancyInputFormProps {
  method: CalculationMethod
  setMethod: (method: CalculationMethod) => void
  lmpDate: Date | undefined
  setLmpDate: (date: Date | undefined) => void
  ultrasoundDate: Date | undefined
  setUltrasoundDate: (date: Date | undefined) => void
  gaWeeks: string
  setGaWeeks: (weeks: string) => void
  gaDays: string
  setGaDays: (days: string) => void
  eddDate: Date | undefined
  setEddDate: (date: Date | undefined) => void
}

/**
 * Renders a pregnancy input form with method selection and conditional inputs based on the selected method.
 *
 * Supports three calculation methods:
 * - LMP: Calculate from Last Menstrual Period only
 * - Ultrasound: Calculate from LMP with ultrasound date and GA at scan
 * - Reverse Ultrasound: Calculate from a known EDD
 *
 * @component Client Component
 * @returns A React element containing the pregnancy input form with method selection.
 */
export function PregnancyInputForm({
  method,
  setMethod,
  lmpDate,
  setLmpDate,
  ultrasoundDate,
  setUltrasoundDate,
  gaWeeks,
  setGaWeeks,
  gaDays,
  setGaDays,
  eddDate,
  setEddDate,
}: Readonly<PregnancyInputFormProps>) {
  const currentYear = new Date().getFullYear()

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Label>Calculation Method</Label>
        <RadioGroup value={method} onValueChange={(value) => setMethod(value as CalculationMethod)}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='lmp' id='method-lmp' />
            <Label htmlFor='method-lmp' className='font-normal cursor-pointer'>
              Last Menstrual Period (LMP)
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='ultrasound' id='method-ultrasound' />
            <Label htmlFor='method-ultrasound' className='font-normal cursor-pointer'>
              Ultrasound (Date + GA at Scan)
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='reverseUltrasound' id='method-reverse' />
            <Label htmlFor='method-reverse' className='font-normal cursor-pointer'>
              Reverse Ultrasound (EDD Known)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {method === 'reverseUltrasound' ? (
        <div className='space-y-2'>
          <Label htmlFor='edd-date'>Known Estimated Due Date (EDD)</Label>
          <ResponsiveDatePicker
            triggerId='edd-date'
            date={eddDate}
            onSelect={setEddDate}
            disabled={(date) => date < new Date('1900-01-01') || date > new Date(currentYear + 2, 11, 31)}
            fromYear={1900}
            toYear={currentYear + 2}
            aria-label='Select known EDD'
          />
          <p className='text-xs text-muted-foreground'>
            LMP and conception date will be calculated from the provided EDD.
          </p>
        </div>
      ) : (
        <>
          <div className='space-y-2'>
            <Label htmlFor='lmp-date'>First Day of Last Menstrual Period (LMP)</Label>
            <ResponsiveDatePicker
              triggerId='lmp-date'
              date={lmpDate}
              onSelect={setLmpDate}
              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
              fromYear={1900}
              toYear={currentYear}
              aria-label='Select Last Menstrual Period date'
            />
          </div>

          {method === 'ultrasound' && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='ultrasound-date'>First-Trimester Ultrasound Date</Label>
                <ResponsiveDatePicker
                  triggerId='ultrasound-date'
                  date={ultrasoundDate}
                  onSelect={setUltrasoundDate}
                  disabled={(date) => date > new Date() || !lmpDate || date < lmpDate}
                  fromYear={lmpDate ? lmpDate.getFullYear() : 1900}
                  toYear={currentYear}
                  aria-label='Select ultrasound date'
                />
              </div>
              <div className='space-y-2'>
                <Label>Gestational Age at Ultrasound (CRL)</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    placeholder='Weeks'
                    value={gaWeeks}
                    onChange={(e) => setGaWeeks(e.target.value)}
                    min='4'
                    max='14'
                    aria-label='Gestational age in weeks'
                    disabled={!ultrasoundDate}
                  />
                  <span className='text-muted-foreground'>weeks</span>
                  <Input
                    type='number'
                    placeholder='Days'
                    value={gaDays}
                    onChange={(e) => setGaDays(e.target.value)}
                    min='0'
                    max='6'
                    aria-label='Gestational age in days'
                    disabled={!ultrasoundDate}
                  />
                  <span className='text-muted-foreground'>days</span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
