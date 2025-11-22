import type { QuickReferenceMedication } from '../../types'

/**
 * Carbocisteine (Mucodyne)
 * Categories: respiratory
 *
 * MIMS:
 * 2-5 years Usual dose: 62.5-125 mg 4 times daily or 200 mg daily in 2 divided doses
 * 6-12 years Usual dose: 100 mg or 250 mg tid
 *
 * Frank Shann: 10-15 mg/kg tds
 *
 * BNFc:
 * 2–4 years: 62.5–125 mg 4 times a day
 * 5–11 years: 250 mg 3 times a day
 */
const carbocisteine: QuickReferenceMedication = {
  id: 'carbocisteine-quick',
  name: 'Carbocisteine',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 10,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 750,
      minAge: 24,
    },
  ],
  concentration: {
    amount: 100,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['respiratory'],
  enabled: true,
}

export default carbocisteine
