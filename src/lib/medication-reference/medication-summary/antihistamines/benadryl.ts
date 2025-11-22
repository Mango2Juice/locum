import type { QuickReferenceMedication } from '../../types'

/**
 * Benadryl (Diphenhydramine)
 * Categories: allergy
 *
 * MIMS:
 * 2-6 years 6.25 mg 4-6 hourly
 * 6-12 years 12.5-25 mg 4-6 hourly
 * >12 years 25-50 mg 3 or 4 times daily
 *
 * Frank Shann: 1-2 mg/kg 6-8H
 */
const benadryl: QuickReferenceMedication = {
  id: 'benadryl-quick',
  name: 'Benadryl',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 1,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 50,
      maxDoseUnit: 'mg/dose',
      minAge: 24,
    },
  ],
  concentration: {
    amount: 14,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['allergy'],
  enabled: true,
}

export default benadryl
