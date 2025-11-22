import type { QuickReferenceMedication } from '../../types'

/**
 * Desloratadine (Clarinex, Aerius)
 * Categories: allergy
 *
 * BNFc, MIMS:
 * 1–5 years: 1.25 mg once daily
 * 6–11 years: 2.5 mg once daily
 * 12–17 years: 5 mg once daily
 *
 * Frank Shann: 0.1 mg/kg od
 */
const desloratadine: QuickReferenceMedication = {
  id: 'desloratadine-quick',
  name: 'Desloratadine',
  dosingProfiles: [
    {
      minAge: 12,
      maxAge: 71,
      formula: 'fixed',
      amount: 1.25,
      unit: 'mg/dose',
      frequency: 'OD',
      maxDose: 1.25,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 72,
      maxAge: 143,
      formula: 'fixed',
      amount: 2.5,
      unit: 'mg/dose',
      frequency: 'OD',
      maxDose: 2.5,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 144,
      maxAge: 216,
      formula: 'fixed',
      amount: 5,
      unit: 'mg/dose',
      frequency: 'OD',
      maxDose: 5,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 2.5,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['allergy'],
  enabled: true,
}

export default desloratadine
