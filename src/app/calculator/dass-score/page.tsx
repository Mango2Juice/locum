// src/app/calculator/dass-score/page.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ProgressBar } from '@/components/ui/progress-bar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useDassScore } from '@/hooks/use-dass-score'
import { cn } from '@/lib/utils'
import type { AnswerValue, Question } from '@/lib/utils/dass-score'
import { questions } from '@/lib/utils/dass-score'

/**
 * Renders a single DASS-21 question row with four selectable response options (0–3).
 *
 * @param question - The question object containing at least `id` and `text`.
 * @param value - The currently selected answer value for this question.
 * @param onChange - Callback invoked with the new `AnswerValue` when the selection changes.
 * @param index - Zero-based position of the question used for display numbering.
 * @returns A JSX element representing the question label and a 4-option radio group for selecting an answer.
 */
function QuestionRow({
  question,
  value,
  onChange,
  index,
}: {
  readonly question: Question
  readonly value: AnswerValue
  readonly onChange: (value: AnswerValue) => void
  readonly index: number
}) {
  return (
    <div className='flex flex-col rounded-lg border p-4 transition-colors hover:bg-accent/50'>
      <div className='mb-3'>
        <Label className='font-medium'>
          {index + 1}. {question.text}
        </Label>
      </div>

      <RadioGroup
        value={String(value)}
        onValueChange={(val) => {
          onChange(Number.parseInt(val, 10) as AnswerValue)
        }}
        className='grid grid-cols-4 gap-2'
        aria-label={question.text}
      >
        {[
          { v: '0', description: 'Not at all' },
          { v: '1', description: 'A little' },
          { v: '2', description: 'Quite a bit' },
          { v: '3', description: 'Very much' },
        ].map((opt) => (
          <div key={opt.v} className='flex flex-col items-start space-y-1'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value={opt.v} id={`${question.id}-${opt.v}`} />
              <Label htmlFor={`${question.id}-${opt.v}`} className='font-semibold'>
                {opt.v}
              </Label>
            </div>
            <span className='text-xs text-muted-foreground leading-tight'>
              — {opt.description}
            </span>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

/**
 * Render a result card showing a category title, numeric score, and severity indicator.
 *
 * @param title - Category name (e.g., "Depression", "Anxiety", "Stress")
 * @param score - Numeric score to display prominently
 * @param severity - Severity label shown in the alert (e.g., "Mild", "Moderate", "Severe")
 * @param color - Tailwind text color class applied to the severity label
 * @returns A Card containing the title, a large centered score, and an Alert with the severity and corresponding icon/variant
 */
function ResultCard({
  title,
  score,
  severity,
  color,
}: {
  readonly title: string
  readonly score: number
  readonly severity: string
  readonly color: 'text-green-600' | 'text-yellow-600' | 'text-orange-500' | 'text-red-600' | 'text-red-700'
}) {
  let variant: 'destructive' | 'accent' | 'default' = 'default'
  if (severity === 'Severe' || severity === 'Extremely Severe') {
    variant = 'destructive'
  } else if (severity === 'Moderate') {
    variant = 'accent'
  }

  const icon = variant === 'destructive' ? <AlertTriangle className='w-4 h-4' /> : <Check className='w-4 h-4' />

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='text-center space-y-2'>
        <p className='text-4xl font-bold'>{score}</p>
        <Alert variant={variant} className='text-left'>
          {icon}
          <AlertTitle className={cn(color)}>{severity}</AlertTitle>
        </Alert>
      </CardContent>
    </Card>
  )
}

/**
 * Render the DASS-21 questionnaire page that lets users complete 21 items, calculate category scores, reset responses, and view results.
 *
 * @returns A React element representing the DASS-21 questionnaire UI, including question rows, submit/reset actions, and conditional result cards.
 */
export default function DassScorePage() {
  const { answers, results, showResult, handleAnswerChange, handleSubmit, handleReset, isComplete } = useDassScore()
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const pageSize = 7
  const totalPages = useMemo(() => Math.ceil(questions.length / pageSize), [])
  const from = page * pageSize
  const pageQuestions = questions.slice(from, from + pageSize)
  const progress = Math.round((Object.values(answers).filter((v) => v > -1).length / questions.length) * 100)

  return (
    <div className='w-full max-w-4xl mx-auto pb-24'>
      <div className='mb-8 hidden md:block'>
        <h1 className='text-3xl font-bold tracking-tight'>Depression Anxiety Stress Scale (DASS-21)</h1>
        <p className='text-muted-foreground mt-2'>
          A set of 21 questions to measure the severity of symptoms of Depression, Anxiety and Stress.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className='w-full'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Questionnaire</CardTitle>
                  <CardDescription>
                    Read each statement and choose the option that best describes how much it applied to you in the past
                    week.
                  </CardDescription>
                </div>
                <div className='w-48'>
                  <ProgressBar value={progress} />
                  <p className='text-xs text-right text-muted-foreground mt-1'>{progress}% completed</p>
                </div>
              </div>
              <div className='mt-3 flex items-center justify-between text-sm text-muted-foreground'>
                <div>
                  Page {page + 1} of {totalPages}
                </div>
                <div>
                  Questions {from + 1}–{Math.min(from + pageSize, questions.length)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            <AnimatePresence initial={false} custom={direction} mode='wait'>
              <motion.div
                key={page}
                custom={direction}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.28 }}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
                }}
                className='space-y-6'
              >
                {pageQuestions.map((q, i) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    value={answers[q.id] ?? -1}
                    onChange={(value) => {
                      handleAnswerChange(q.id, value)
                    }}
                    index={from + i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <div className='flex flex-col sm:flex-row gap-2 pt-4 items-center'>
              <div className='flex gap-2 w-full sm:w-auto'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => {
                    setDirection(-1)
                    setPage((p) => Math.max(0, p - 1))
                  }}
                  disabled={page === 0}
                >
                  Back
                </Button>
                {page < totalPages - 1 ? (
                  <Button
                    type='button'
                    onClick={() => {
                      setDirection(1)
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type='submit' className='w-full' disabled={!isComplete}>
                    Calculate Score
                  </Button>
                )}
              </div>

              <div className='ml-auto w-full sm:w-40'>
                <Button type='button' variant='outline' className='w-full' onClick={handleReset}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Reset
                </Button>
              </div>
            </div>
            {!isComplete && (
              <p className='text-sm text-center text-muted-foreground pt-2'>
                Please answer all questions to calculate the score.
              </p>
            )}
          </CardContent>
        </Card>
      </form>

      {showResult && results && (
        <Card className='mt-8'>
          <CardHeader>
            <div className='flex items-center justify-between w-full'>
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>The scores below indicate the severity of symptoms for each category.</CardDescription>
              </div>
              <div className='text-right text-sm text-muted-foreground'>
                <div className='font-medium'>Interpretation</div>
                <div>Higher scores indicate greater symptom severity.</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col md:flex-row gap-4'>
            <ResultCard title='Depression' {...results.depression} />
            <ResultCard title='Anxiety' {...results.anxiety} />
            <ResultCard title='Stress' {...results.stress} />
          </CardContent>
        </Card>
      )}

      <p className='text-xs text-muted-foreground mt-4 text-center'>
        The DASS-21 is a screening tool. It is not a substitute for a professional clinical diagnosis.
      </p>
    </div>
  )
}
