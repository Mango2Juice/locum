// src/app/calculator/centor-score/page.tsx
'use client'

import { AlertTriangle, Check, RefreshCw } from 'lucide-react'
import type React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCentorScore } from '@/hooks/use-centor-score'
import { cn } from '@/lib/utils'
import type { AgeGroup, Criteria } from '@/lib/utils/centor-score'
import { criteria } from '@/lib/utils/centor-score'

/**
 * Render a selectable row for a single Centor criterion with its label and description.
 *
 * @param criterion - Criterion data containing `id`, `text`, and `description`; used to populate the label, description, and checkbox id for accessibility.
 * @param checked - Whether the criterion checkbox is currently selected.
 * @param onCheckedChange - Invoked with the new checked state when the checkbox is toggled.
 * @returns A JSX element representing the criterion row (checkbox, label, and description).
 */
function CriteriaRow({
  criterion,
  checked,
  onCheckedChange,
}: Readonly<{
  criterion: Readonly<Criteria>
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}>) {
  return (
    <div className='flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/50'>
      <Checkbox id={criterion.id} checked={checked} onCheckedChange={onCheckedChange} className='mt-1' />
      <div className='grid gap-1.5 leading-none'>
        <Label htmlFor={criterion.id} className='font-medium cursor-pointer'>
          {criterion.text}
        </Label>
        <p className='text-sm text-muted-foreground'>{criterion.description}</p>
      </div>
    </div>
  )
}

/**
 * Render a card displaying a Centor score with its associated risk level and recommended management.
 *
 * @param score - Centor score used to determine the visual severity and displayed numeric value
 * @param risk - Short risk label shown as the alert title
 * @param management - Management guidance shown as the alert description
 * @param color - Tailwind text color class applied to the numeric score (`text-green-600`, `text-yellow-600`, or `text-red-600`)
 * @returns The Card JSX element showing the score, a severity-styled alert with `risk` as the title and `management` as the description
 */
function ResultCard({
  score,
  risk,
  management,
  color,
}: Readonly<{
  score: number
  risk: string
  management: string
  color: 'text-green-600' | 'text-yellow-600' | 'text-red-600'
}>) {
  let alertVariant: 'destructive' | 'accent' | 'default'
  if (score >= 3) {
    alertVariant = 'destructive'
  } else if (score >= 1) {
    alertVariant = 'accent'
  } else {
    alertVariant = 'default'
  }

  let alertIcon: React.ReactNode
  if (score >= 1) {
    alertIcon = <AlertTriangle className='w-4 h-4' />
  } else {
    alertIcon = <Check className='w-4 h-4' />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result: Centor Score</CardTitle>
        <CardDescription>Estimated risk and recommended management for Streptococcal Pharyngitis.</CardDescription>
      </CardHeader>
      <CardContent className='text-center space-y-4'>
        <p className={cn('text-6xl font-bold', color)}>{score}</p>
        <Alert variant={alertVariant} className='text-left'>
          {alertIcon}
          <AlertTitle>{risk}</AlertTitle>
          <AlertDescription>{management}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

/**
 * Centor Score calculator page component for predicting Group A Streptococcal Pharyngitis probability.
 * Provides an interactive form for clinical criteria assessment and displays risk-based recommendations.
 */
export default function CentorScorePage() {
  const { answers, result, showResult, handleCheckboxChange, handleAgeChange, handleSubmit, handleReset } =
    useCentorScore()

  return (
    <div className='w-full max-w-2xl mx-auto pb-24'>
      <div className='mb-8 hidden md:block'>
        <h1 className='text-3xl font-bold tracking-tight'>Modified Centor Score</h1>
        <p className='text-muted-foreground mt-2'>
          For predicting the probability of Group A Streptococcal Pharyngitis.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Clinical Criteria</CardTitle>
            <CardDescription>Select all that apply to the patient.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {criteria.map((c) => (
              <CriteriaRow
                key={c.id}
                criterion={c}
                checked={answers[c.id]}
                onCheckedChange={(checked) => handleCheckboxChange(c.id, checked)}
              />
            ))}

            <div className='rounded-lg border p-4'>
              <Label className='text-base font-medium'>Age Group</Label>
              <RadioGroup
                value={answers.age}
                onValueChange={(value) => handleAgeChange(value as AgeGroup)}
                className='mt-3 space-y-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='under15' id='under15' />
                  <Label htmlFor='under15' className='font-normal'>
                    3 - 14 years
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='15to44' id='15to44' />
                  <Label htmlFor='15to44' className='font-normal'>
                    15 - 44 years
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='over44' id='over44' />
                  <Label htmlFor='over44' className='font-normal'>
                    45 years and older
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 pt-4'>
              <Button type='submit' className='w-full'>
                Calculate Score
              </Button>
              <Button
                type='button'
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                onClick={handleReset}
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {showResult && (
        <div className='mt-8'>
          <ResultCard {...result} />
        </div>
      )}
      <p className='text-xs text-muted-foreground mt-4 text-center'>
        This score is a tool to aid clinical judgment and does not replace it.
      </p>
    </div>
  )
}
