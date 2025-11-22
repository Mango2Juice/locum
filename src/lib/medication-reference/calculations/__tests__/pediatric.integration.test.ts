import { describe, expect, it } from 'vitest'
import type { QuickReferenceMedication } from '../../types'
import { calculatePediatricDose } from '../pediatric'

const medication: QuickReferenceMedication = {
  id: 'test-med',
  name: 'TestMed',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 10,
      unit: 'mg/kg/dose',
      frequency: 'OD',
    },
  ],
  concentration: {
    amount: 10,
    unit: 'mg/ml',
    formulation: 'syrup',
  },
  complaintCategories: ['test'],
  enabled: true,
}

describe('calculatePediatricDose integration', () => {
  it('calculates weight-based dose correctly', () => {
    const res = calculatePediatricDose(medication, 10)
    expect(res.isValid).toBe(true)
    // 10 mg/kg * 10kg = 100 mg
    expect(res.doseMg).toBeCloseTo(100)
  })

  it('returns invalid result if no tier matches weight-tiered profile', () => {
    const medTiered: QuickReferenceMedication = {
      ...medication,
      id: 'tiered',
      dosingProfiles: [
        {
          formula: 'weight-tiered',
          amount: 0,
          unit: 'mg/dose',
          frequency: 'BD',
          weightTiers: [{ minWeight: 0, maxWeight: 5, amount: 5 }],
        },
      ],
    }
    const res = calculatePediatricDose(medTiered, 10)
    expect(res.isValid).toBe(false)
    expect(res.warnings.some((w) => w.includes('No matching weight tier'))).toBe(true)
  })
})
