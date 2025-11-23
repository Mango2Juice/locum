// src/lib/utils/pregnancy-calculator.test.ts

import { add, sub } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculatePregnancyFromEdd, calculatePregnancyInfo } from './pregnancy-calculator'

// Mock "today" globally for deterministic tests
const MOCKED_TODAY = new Date('2025-11-03T00:00:00.000Z')

describe('calculatePregnancyInfo with mocked date', () => {
  beforeEach(() => {
    // Use modern vitest timers to mock the date
    vi.useFakeTimers()
    vi.setSystemTime(MOCKED_TODAY)
  })

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers()
  })

  it('calculates EDD and GA correctly from LMP only', () => {
    const lmp = new Date('2025-01-20T00:00:00.000Z')
    const result = calculatePregnancyInfo(lmp)

    // Assert that result is not null before further checks
    expect(result).not.toBeNull()
    if (!result) return

    expect(result.lmpEdd.toISOString().split('T')[0]).toBe('2025-10-27')
    expect(result.bestEstimateEdd.toISOString().split('T')[0]).toBe('2025-10-27')
    expect(result.source).toBe('LMP')
    expect(result.gestationalAgeWeeks).toBe(41)
    expect(result.gestationalAgeDays).toBe(0)
    expect(result.trimester).toBe(3)
  })

  it('uses ultrasound for redating when discrepancy exceeds ACOG cutoff (GA >= 9w)', () => {
    // For GA 9w0d – 13w6d, discrepancy threshold is >7 days.
    // GA by LMP at ultrasound date (2024-07-20) is 7w 0d (49 days).
    // Ultrasound GA is 8w 2d (58 days).
    // Discrepancy is 9 days, which is > 7, so it should redate.
    const lmp = new Date('2024-06-01T00:00:00.000Z')
    const ultrasoundDate = new Date('2024-07-20T00:00:00.000Z')
    const result = calculatePregnancyInfo(lmp, ultrasoundDate, 8, 2)

    expect(result).not.toBeNull()
    if (!result) return

    expect(result.source).toBe('Ultrasound')
    expect(result.bestEstimateEdd.toISOString().split('T')[0]).toBe('2025-02-27')
    expect(result.discrepancyDays).toBe(9)
  })

  it('sticks with LMP when discrepancy is below ACOG cutoff', () => {
    // For GA < 9w0d, discrepancy threshold is >5 days.
    // GA by LMP at ultrasound date (2024-07-20) is 7w 0d (49 days).
    // Ultrasound GA is 7w 2d (51 days).
    // Discrepancy is 2 days, which is <= 5, so it should NOT redate.
    const lmp = new Date('2024-06-01T00:00:00.000Z')
    const ultrasoundDate = new Date('2024-07-20T00:00:00.000Z')
    const result = calculatePregnancyInfo(lmp, ultrasoundDate, 7, 2)

    expect(result).not.toBeNull()
    if (!result) return

    expect(result.source).toBe('LMP_CONFIRMED')
    expect(result.bestEstimateEdd.toISOString().split('T')[0]).toBe('2025-03-08')
    expect(result.discrepancyDays).toBe(2)
  })

  it('calculates GA as 0w 0d when LMP is today', () => {
    const result = calculatePregnancyInfo(MOCKED_TODAY)
    expect(result?.gestationalAgeWeeks).toBe(0)
    expect(result?.gestationalAgeDays).toBe(0)
  })

  it('calculates GA as 40w 0d when EDD is today', () => {
    const lmp = sub(MOCKED_TODAY, { days: 280 })
    const result = calculatePregnancyInfo(lmp)
    expect(result?.gestationalAgeWeeks).toBe(40)
    expect(result?.gestationalAgeDays).toBe(0)
  })

  it('calculates trimester correctly for first, second, and third trimesters', () => {
    // 6 weeks pregnant -> 1st trimester
    const lmpFirst = sub(MOCKED_TODAY, { weeks: 6 })
    expect(calculatePregnancyInfo(lmpFirst)?.trimester).toBe(1)

    // 18 weeks pregnant -> 2nd trimester
    const lmpSecond = sub(MOCKED_TODAY, { weeks: 18 })
    expect(calculatePregnancyInfo(lmpSecond)?.trimester).toBe(2)

    // 30 weeks pregnant -> 3rd trimester
    const lmpThird = sub(MOCKED_TODAY, { weeks: 30 })
    expect(calculatePregnancyInfo(lmpThird)?.trimester).toBe(3)
  })

  it('calculates key milestone dates correctly', () => {
    const lmp = new Date('2024-01-01T00:00:00.000Z')
    const result = calculatePregnancyInfo(lmp)
    expect(result).not.toBeNull()
    if (!result) return

        // First milestone: "Blood Screening" starts at 10 weeks
    const firstMilestone = result.milestoneDates[0]
    const expectedStart = add(lmp, { weeks: 10 })
    expect(firstMilestone?.dateRange).toContain(expectedStart.getDate().toString())
  })

  it('returns null if LMP is not a valid date', () => {
    expect(calculatePregnancyInfo(null)).toBeNull()
    expect(calculatePregnancyInfo(undefined)).toBeNull()
  })

  it('handles future LMP by clamping gestational age to 0w 0d', () => {
    const lmp = add(MOCKED_TODAY, { days: 10 })
    const result = calculatePregnancyInfo(lmp)
    expect(result?.gestationalAgeWeeks).toBe(0)
    expect(result?.gestationalAgeDays).toBe(0)
  })
})

describe('calculatePregnancyFromEdd (reverse ultrasound method)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MOCKED_TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates LMP correctly from a known EDD', () => {
    // EDD is 2025-10-27, so LMP should be EDD − 280 days = 2025-01-20
    const edd = new Date('2025-10-27T00:00:00.000Z')
    const result = calculatePregnancyFromEdd(edd)

    expect(result).not.toBeNull()
    if (!result) return

    const expectedLmp = sub(edd, { days: 280 })
    expect(result.bestEstimateEdd.toISOString().split('T')[0]).toBe('2025-10-27')
    expect(expectedLmp.toISOString().split('T')[0]).toBe('2025-01-20')
  })

  it('calculates conception date correctly from EDD', () => {
    // Conception = EDD − 266 days
    const edd = new Date('2025-10-27T00:00:00.000Z')
    const result = calculatePregnancyFromEdd(edd)

    expect(result).not.toBeNull()
    if (!result) return

    const expectedConception = sub(edd, { days: 266 })
    expect(result.conceptionDate.toISOString().split('T')[0]).toBe(expectedConception.toISOString().split('T')[0])
  })

  it('calculates gestational age correctly from EDD', () => {
    // If EDD is 2025-10-27 and today is 2025-11-03 (mocked)
    // LMP would be 2025-01-20
    // GA = days from LMP to today = 287 days = 41w 0d
    const edd = new Date('2025-10-27T00:00:00.000Z')
    const result = calculatePregnancyFromEdd(edd)

    expect(result).not.toBeNull()
    if (!result) return

    expect(result.gestationalAgeWeeks).toBe(41)
    expect(result.gestationalAgeDays).toBe(0)
  })

  it('sets source as Ultrasound for reverse calculation', () => {
    const edd = new Date('2025-10-27T00:00:00.000Z')
    const result = calculatePregnancyFromEdd(edd)

    expect(result).not.toBeNull()
    if (!result) return

    expect(result.source).toBe('Ultrasound')
    expect(result.discrepancyDays).toBe(0)
  })

  it('calculates trimester correctly from EDD', () => {
    // First trimester: GA < 14 weeks
    const eddFirst = add(MOCKED_TODAY, { weeks: 30 }) // EDD is 30 weeks away
    const resultFirst = calculatePregnancyFromEdd(eddFirst)
    expect(resultFirst?.trimester).toBe(1)

    // Second trimester: GA 14-28 weeks
    const eddSecond = add(MOCKED_TODAY, { weeks: 18 }) // EDD is 18 weeks away (GA ~22w)
    const resultSecond = calculatePregnancyFromEdd(eddSecond)
    expect(resultSecond?.trimester).toBe(2)

    // Third trimester: GA > 28 weeks
    const eddThird = add(MOCKED_TODAY, { weeks: 8 }) // EDD is 8 weeks away (GA ~32w)
    const resultThird = calculatePregnancyFromEdd(eddThird)
    expect(resultThird?.trimester).toBe(3)
  })

  it('returns null if EDD is not a valid date', () => {
    expect(calculatePregnancyFromEdd(null)).toBeNull()
    expect(calculatePregnancyFromEdd(undefined)).toBeNull()
  })

  it('handles past EDD correctly', () => {
    // EDD in the past (already delivered)
    const edd = sub(MOCKED_TODAY, { weeks: 2 })
    const result = calculatePregnancyFromEdd(edd)

    expect(result).not.toBeNull()
    if (!result) return

    // GA should be > 40 weeks since EDD has passed
    expect(result.gestationalAgeWeeks).toBeGreaterThan(40)
  })
})

