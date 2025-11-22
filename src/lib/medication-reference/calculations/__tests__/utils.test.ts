import { describe, expect, it } from 'vitest'
import type { DosingProfile } from '../../types'
import { computeDoseFromProfile, convertAmountToMg, findWeightTier } from '../helpers'

describe('calculations utils', () => {
  it('convertAmountToMg converts mg, mcg and mL correctly', () => {
    expect(convertAmountToMg(10, 'mg/dose', 0)).toBe(10)
    expect(convertAmountToMg(1000, 'mcg/dose', 0)).toBe(1)
    expect(convertAmountToMg(2, 'mL/dose', 5)).toBe(10)
  })

  it('findWeightTier returns correct tier or undefined', () => {
    const profile: DosingProfile = {
      formula: 'weight-tiered',
      amount: 0,
      unit: 'mg/dose',
      frequency: 'BD',
      weightTiers: [
        { minWeight: 0, maxWeight: 5, amount: 10 },
        { minWeight: 5.1, maxWeight: 10, amount: 20 },
      ],
    }

    expect(findWeightTier(profile, 3)?.amount).toBe(10)
    expect(findWeightTier(profile, 6)?.amount).toBe(20)
    expect(findWeightTier(profile, 100)).toBeUndefined()
  })

  it('computeDoseFromProfile handles weight, fixed and tiered profiles', () => {
    const mgPerMl = 5

    const weightProfile: DosingProfile = {
      formula: 'weight',
      amount: 10,
      unit: 'mg/kg/dose',
      frequency: 'OD',
    }
    const r1 = computeDoseFromProfile(weightProfile, 10, mgPerMl)
    expect(r1.calculatedDose).toBeCloseTo(100)

    const fixedProfile: DosingProfile = {
      formula: 'fixed',
      amount: 50,
      unit: 'mg/dose',
      frequency: 'BD',
    }
    const r2 = computeDoseFromProfile(fixedProfile, 10, mgPerMl)
    expect(r2.calculatedDose).toBe(50)

    const tieredProfile: DosingProfile = {
      formula: 'weight-tiered',
      amount: 0,
      unit: 'mg/dose',
      frequency: 'BD',
      weightTiers: [{ minWeight: 0, maxWeight: 5, amount: 5 }],
    }
    const r3 = computeDoseFromProfile(tieredProfile, 6, mgPerMl)
    expect(r3.error).toBeDefined()
  })
})
