// src/app/calculator/dass-score/page.test.tsx

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DassScorePage from './page'

// Helper: complete all 21 questions with the given answer value
async function answerAllQuestions(option: 0 | 1 | 2 | 3) {
  // The page renders each question text directly; query all labels used as aria-label on RadioGroup
  const questionGroups = screen.getAllByRole('radiogroup')
  const optionLabelMap: Record<0 | 1 | 2 | 3, string> = {
    0: 'Did not apply to me at all',
    1: 'Applied to me to some degree',
    2: 'Applied to me a considerable degree',
    3: 'Applied to me very much',
  }
  const user = userEvent.setup()
  for (const group of questionGroups) {
    const radio = within(group).getByLabelText(optionLabelMap[option])
    // click each radio
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await user.click(radio)
    })
  }
}

// The page uses the useDassScore hook and pure UI primitives; we test visible behavior end-to-end without mocks.

describe('DassScorePage', () => {
  it('renders questionnaire and disables Calculate until complete', () => {
    render(<DassScorePage />)

    // Heading and description
    expect(screen.getByText('Depression Anxiety Stress Scale (DASS-21)')).toBeInTheDocument()
    expect(
      screen.getByText('A set of 21 questions to measure the severity of symptoms of Depression, Anxiety and Stress.'),
    ).toBeInTheDocument()

    // Shows helper text when incomplete
    expect(screen.getByText('Please answer all questions to calculate the score.')).toBeInTheDocument()

    const calcBtn = screen.getByRole('button', { name: 'Calculate Score' })
    expect(calcBtn).toBeDisabled()
  })

  it('enables Calculate when all questions are answered and shows results with three categories', async () => {
    const user = userEvent.setup()
    render(<DassScorePage />)

    await answerAllQuestions(0)

    const calcBtn = screen.getByRole('button', { name: 'Calculate Score' })
    expect(calcBtn).toBeEnabled()

    await act(async () => {
      await user.click(calcBtn)
    })

    // Results visible with three cards
    expect(await screen.findByText('Results')).toBeInTheDocument()
    expect(screen.getByText('Depression')).toBeInTheDocument()
    expect(screen.getByText('Anxiety')).toBeInTheDocument()
    expect(screen.getByText('Stress')).toBeInTheDocument()

    // With all zeros, scores should be 0 and Normal, green
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
    const severities = screen.getAllByText('Normal')
    expect(severities.length).toBeGreaterThanOrEqual(3)
    for (const el of severities) {
      expect(el.className).toMatch(/text-green-600/)
    }
  })

  it('resets answers to initial state and hides results', async () => {
    const user = userEvent.setup()
    render(<DassScorePage />)

    await answerAllQuestions(1)

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calculate Score' }))
    })
    expect(await screen.findByText('Results')).toBeInTheDocument()

    // Click Reset
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Reset/i }))
    })

    // Results hidden and Calculate disabled again
    expect(screen.queryByText('Results')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculate Score' })).toBeDisabled()
  })

  it('updates results when answers change and hides results until resubmitted', async () => {
    const user = userEvent.setup()
    render(<DassScorePage />)

    // Answer all with 1 and submit
    await answerAllQuestions(1)
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calculate Score' }))
    })
    expect(await screen.findByText('Results')).toBeInTheDocument()

    // Change a single question to 3; this should hide results (showResult false)
    const groups = screen.getAllByRole('radiogroup')
    const firstQuestionGroup = groups[0]
    expect(firstQuestionGroup).toBeDefined()
    if (!firstQuestionGroup) throw new Error('First question group missing')
    const radioThree = within(firstQuestionGroup).getByLabelText('Applied to me very much')
    await act(async () => {
      await user.click(radioThree)
    })

    expect(screen.queryByText('Results')).not.toBeInTheDocument()

    // Recalculate shows results again
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calculate Score' }))
    })
    expect(await screen.findByText('Results')).toBeInTheDocument()
  })

  it('applies severity thresholds and variants per category correctly', async () => {
    const user = userEvent.setup()
    render(<DassScorePage />)

    // Craft answers to produce different category severities.
    // Depression: set all 7 depression items to 2 -> raw 14, doubled 28 => Severe (levels [9,13,20,27])
    // Anxiety: set all 7 anxiety items to 1 -> raw 7, doubled 14 => Moderate (levels [7,9,14,19])
    // Stress: set all 7 stress items to 0 -> 0 => Normal

    // Map of question id to desired value
    const depressionIds = ['q3', 'q5', 'q10', 'q13', 'q16', 'q17', 'q21']
    const anxietyIds = ['q2', 'q4', 'q7', 'q9', 'q15', 'q19', 'q20']
    const stressIds = ['q1', 'q6', 'q8', 'q11', 'q12', 'q14', 'q18']

    // First set all to 0
    await answerAllQuestions(0)

    // Now set per category values by targeting each group's label (question text). We need the text; find by radiogroup order and ids.
    // Instead of relying on texts, programmatically set by ids via accessible labels inside groups.
    // We can find the group by role and then index by known order (questions are rendered in the questions array order q1..q21)
    const groups = screen.getAllByRole('radiogroup')

    const idToIndex = (id: string) => Number.parseInt(id.slice(1), 10) - 1 // q1 -> 0

    // Set Depression questions to 2
    for (const id of depressionIds) {
      const group = groups[idToIndex(id)]
      expect(group).toBeDefined()
      if (!group) throw new Error(`Question group ${id} missing`)
      const radio = within(group).getByLabelText('Applied to me a considerable degree')
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await user.click(radio)
      })
    }

    // Set Anxiety questions to 1
    for (const id of anxietyIds) {
      const group = groups[idToIndex(id)]
      expect(group).toBeDefined()
      if (!group) throw new Error(`Question group ${id} missing`)
      const radio = within(group).getByLabelText('Applied to me to some degree')
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await user.click(radio)
      })
    }

    // Stress remain 0
    for (const id of stressIds) {
      const group = groups[idToIndex(id)]
      expect(group).toBeDefined()
      if (!group) throw new Error(`Question group ${id} missing`)
      const radio = within(group).getByLabelText('Applied to me to some degree')
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await user.click(radio)
      })
    }

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calculate Score' }))
    })

    // Get alerts in order: Depression, Anxiety, Stress
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(3)

    // Depression: 28 => Extremely Severe (red-700 label)
    const depAlert = alerts[0]
    expect(depAlert).toBeDefined()
    if (!depAlert) throw new Error('Depression alert missing')
    const depSeverity = within(depAlert).getByText('Extremely Severe')
    expect(depSeverity.className).toMatch(/text-red-700/)

    // Anxiety: 14 => Moderate (orange label)
    const anxAlert = alerts[1]
    expect(anxAlert).toBeDefined()
    if (!anxAlert) throw new Error('Anxiety alert missing')
    const anxSeverity = within(anxAlert).getByText('Moderate')
    expect(anxSeverity.className).toMatch(/text-orange-500/)

    // Stress: 0 => Normal (green label)
    const stressAlert = alerts[2]
    expect(stressAlert).toBeDefined()
    if (!stressAlert) throw new Error('Stress alert missing')
    const stressSeverity = within(stressAlert).getByText('Normal')
    expect(stressSeverity.className).toMatch(/text-green-600/)
  }, 15000)
})
