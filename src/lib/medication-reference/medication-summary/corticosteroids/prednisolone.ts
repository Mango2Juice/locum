import type { QuickReferenceMedication } from '../../types'

/**
 * Prednisolone (Prelone)
 * Categories: respiratory, allergy
 *
 * MIMS: 0.14-2 mg/kg daily in 3 or 4 divided doses.
 *
 * Frank Shann:
 * Asthma - 1 mg/kg daily
 *
 * BNFc:
 * Asthma - 1 month–11 years: 1–2 mg/kg once daily (max. per dose 40 mg)
 */
const prednisolone: QuickReferenceMedication = {
  id: 'prednisolone-quick',
  name: 'Prednisolone',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.5,
      unit: 'mg/kg/day',
      frequency: 'TDS',
    },
  ],
  concentration: {
    amount: 3,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['respiratory', 'allergy'],
  enabled: true,
}

export default prednisolone
