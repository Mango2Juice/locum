// src/app/calculator/pregnancy/page.tsx
'use client'

import { Info, RefreshCw } from 'lucide-react'
import { PregnancyInputForm } from '@/components/calculator/pregnancy/pregnancy-input-form'
import { PregnancyResults } from '@/components/calculator/pregnancy/pregnancy-results'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePregnancyCalculator } from '@/hooks/use-pregnancy-calculator'

/**
 * Page component that renders the pregnancy due date calculator UI.
 *
 * Displays an input card for clinical data and a results panel that shows calculated
 * pregnancy details when available or an informational placeholder when no data is present.
 *
 * @returns The JSX element for the pregnancy due date calculator page.
 */
export default function PregnancyCalculatorPage() {
  const {
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
    pregnancyInfo,
    handleReset,
  } = usePregnancyCalculator()

  return (
    <div className='w-full max-w-4xl mx-auto pb-24'>
      <div className='mb-8 hidden md:block'>
        <h1 className='text-3xl font-bold tracking-tight'>Pregnancy Due Date</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
        <Card>
          <CardContent className='space-y-6'>
            <PregnancyInputForm
              method={method}
              setMethod={setMethod}
              lmpDate={lmpDate}
              setLmpDate={setLmpDate}
              ultrasoundDate={ultrasoundDate}
              setUltrasoundDate={setUltrasoundDate}
              gaWeeks={gaWeeks}
              setGaWeeks={setGaWeeks}
              gaDays={gaDays}
              setGaDays={setGaDays}
              eddDate={eddDate}
              setEddDate={setEddDate}
            />
            <Button variant='outline' onClick={handleReset} className='w-full'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Reset Calculator
            </Button>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          {pregnancyInfo ? (
            <PregnancyResults pregnancyInfo={pregnancyInfo} />
          ) : (
            <Card>
              <CardContent className='p-6 text-center text-muted-foreground'>
                <Info className='mx-auto w-12 h-12 mb-4' />
                <p>
                  {method === 'reverseUltrasound'
                    ? 'Enter the known EDD to see pregnancy details.'
                    : 'Enter the LMP date to see pregnancy details.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
