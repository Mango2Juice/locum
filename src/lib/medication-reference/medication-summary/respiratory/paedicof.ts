import type { QuickReferenceMedication } from '../../types'

/**
 * Paedicof (Pediatric cough syrup)
 * Categories: respiratory
 *
 * MIMS:
 * 2-5 yr 5 mL every 4-6 hr
 * 6-11 yr 10 mL every 4-6 hr
 */
const paedicof: QuickReferenceMedication = {
  id: 'paedicof-quick',
  name: 'Paedicof',
  dosingProfiles: [
    {
      minAge: 24,
      maxAge: 71,
      formula: 'fixed',
      amount: 5,
      unit: 'mL/dose',
      frequency: 'QID',
    },
    {
      minAge: 72,
      maxAge: 143,
      formula: 'fixed',
      amount: 10,
      unit: 'mL/dose',
      frequency: 'QID',
    },
  ],
  concentration: {
    amount: 1,
    unit: 'mg/ml',
    formulation: 'syrup',
  },
  complaintCategories: ['respiratory'],
  enabled: true,
}

export default paedicof
