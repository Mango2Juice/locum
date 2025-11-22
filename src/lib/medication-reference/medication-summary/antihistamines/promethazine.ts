import type { QuickReferenceMedication } from '../../types'

/**
 * Promethazine (Phenergan)
 * Categories: allergy
 *
 * Frank Shann: 0.2-0.5 mg/kg tds
 *
 * MIMS, BNFc:
 * 2-5 years 5 mg bid
 * 6-12 years 5-10 mg bid
 */
const promethazine: QuickReferenceMedication = {
  id: 'promethazine-quick',
  name: 'Promethazine',
  dosingProfiles: [
    {
      minAge: 24,
      maxAge: 71,
      formula: 'fixed',
      amount: 5,
      unit: 'mg/dose',
      frequency: 'BD',
      maxDose: 5,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 72,
      maxAge: 143,
      formula: 'fixed',
      amount: 10,
      unit: 'mg/dose',
      frequency: 'BD',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 5,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['allergy'],
  enabled: true,
}

export default promethazine
