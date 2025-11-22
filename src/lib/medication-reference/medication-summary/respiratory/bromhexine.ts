import type { QuickReferenceMedication } from '../../types'

/**
 * Bromhexine (Bisolvon)
 * Categories: respiratory
 *
 * Frank Shann: 0.3 mg/kg tds
 *
 * MIMS:
 * 2-5 years 2 mg tid or 4 mg bid (Max: 8 mg daily)
 * 6-11 years 4-8 mg tid (Max: 24 mg daily)
 * ≥12 years 8mg tid
 */
const bromhexine: QuickReferenceMedication = {
  id: 'bromhexine-quick',
  name: 'Bromhexine',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.3,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 8,
      minAge: 24,
    },
  ],
  concentration: {
    amount: 4,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['respiratory'],
  enabled: true,
}

export default bromhexine
