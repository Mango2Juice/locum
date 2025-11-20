// src/app/calculator/stop-bang/page.tsx
'use client'

import { AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useStopBangScore } from '@/hooks/use-stop-bang-score'
import { cn } from '@/lib/utils'
import type { Question, YesNo } from '@/lib/utils/stop-bang-score'
import { questions } from '@/lib/utils/stop-bang-score'

/**
 * Renders a single questionnaire row showing a question, optional description, and a Yes/No radio control.
 *
 * @param question - The question object containing `id`, `text`, and optional `description`.
 * @param value - The current answer, either `'yes'` or `'no'`.
 * @param onChange - Callback invoked with the new `YesNo` value when the selection changes.
 * @returns The QuestionRow React element.
 */
function QuestionRow({
  question,
  value,
  onChange,
}: Readonly<{
  question: Question
  value: YesNo
  onChange: (value: YesNo) => void
}>) {
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4'>
      <div className='mb-4 sm:mb-0'>
        <Label htmlFor={question.id} className='text-base font-medium'>
          {question.text}
        </Label>
        {question.description && <p className='text-sm text-muted-foreground mt-1'>{question.description}</p>}
      </div>
      <RadioGroup
        id={question.id}
        value={value}
        onValueChange={onChange}
        className='flex items-center space-x-4'
        aria-label={question.text}
      >
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='yes' id={`${question.id}-yes`} />
          <Label htmlFor={`${question.id}-yes`}>Yes</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='no' id={`${question.id}-no`} />
          <Label htmlFor={`${question.id}-no`}>No</Label>
        </div>
      </RadioGroup>
    </div>
  )
}

/**
 * Render a result card showing the STOP-BANG score, risk level, and explanatory description.
 *
 * @param score - The numeric STOP-BANG score (0–8) to display
 * @param risk - The categorical risk label: 'Low', 'Intermediate', or 'High'
 * @param color - Tailwind text color class applied to the risk label
 * @param description - Explanatory text shown inside the alert for the given risk
 * @returns A card element that presents the risk label, score, and an alert describing the risk
 */
function ResultCard({
  score,
  risk,
  color,
  description,
}: Readonly<{
  score: number
  risk: 'Low' | 'Intermediate' | 'High'
  color: 'text-green-600' | 'text-yellow-600' | 'text-red-600'
  description: string
}>) {
  let variant: 'destructive' | 'accent' | 'default'
  if (risk === 'High') {
    variant = 'destructive'
  } else if (risk === 'Intermediate') {
    variant = 'accent'
  } else {
    variant = 'default'
  }

  const icon = risk === 'High' ? <AlertTriangle className='w-4 h-4' /> : <Check className='w-4 h-4' />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result</CardTitle>
        <CardDescription>Your estimated risk for Obstructive Sleep Apnea.</CardDescription>
      </CardHeader>
      <CardContent className='text-center space-y-4'>
        <p className={cn('text-6xl font-bold', color)}>{risk}</p>
        <p className='text-xl text-muted-foreground'>Score: {score} / 8</p>
        <Alert variant={variant} className='text-left'>
          {icon}
          <AlertTitle>{risk} Risk</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

/**
 * Render the STOP-BANG questionnaire page for obstructive sleep apnea screening.
 *
 * Renders a list of Yes/No questions, Submit and Reset controls, and a conditional result panel that displays the calculated score and risk after submission.
 *
 * @returns The React element containing the questionnaire UI and conditional results panel.
 */
export default function StopBangPage() {
  const { answers, result, showResult, handleAnswerChange, handleSubmit, handleReset } = useStopBangScore()

  return (
    <div className='w-full max-w-2xl mx-auto pb-24'>
      <div className='mb-8 hidden md:block'>
        <h1 className='text-3xl font-bold tracking-tight'>STOP-BANG Score for OSA</h1>
        <p className='text-muted-foreground mt-2'>Screening questionnaire for Obstructive Sleep Apnea.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire</CardTitle>
            <CardDescription>Answer the following questions to assess your risk.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {questions.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(value) => handleAnswerChange(q.id, value)}
              />
            ))}

            <div className='flex flex-col sm:flex-row gap-2 pt-4'>
              <Button type='submit' className='w-full'>
                Calculate Score
              </Button>
              <Button type='button' variant='outline' className='w-full' onClick={handleReset}>
                <RefreshCw className='w-4 h-4 mr-2' />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {showResult === true && (
        <div className='mt-8'>
          <ResultCard {...result} />
        </div>
      )}
      <p className='text-xs text-muted-foreground mt-4 text-center'>
        This calculator is a screening tool and is not a substitute for a formal sleep study or medical diagnosis.
      </p>
    </div>
  )
}
