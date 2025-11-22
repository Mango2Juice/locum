import type { QuickReferenceMedication } from '../../types'

/**
 * Cetirizine (Zyrtec, Cetirizine hydrochloride)
 * Categories: allergy
 *
 * MIMS: 6-12 years 5 mg bid
 *
 * Frank Shann:
 * 6-23 months 2.5 od
 * 2-5 years 2.5-5 mg od
 * >5 years 5-10 mg od
 *
 * BNFc:
 * 1 year: 250 micrograms/kg twice daily
 * 2–5 years: 2.5 mg twice daily
 * 6–11 years: 5 mg twice daily
 * 12–17 years: 10 mg once daily
 */
const cetirizine: QuickReferenceMedication = {
  id: 'cetirizine-quick',
  name: 'Cetirizine',
  dosingProfiles: [
    {
      minAge: 12,
      maxAge: 24,
      formula: 'weight',
      amount: 0.25,
      unit: 'mg/kg/dose',
      frequency: 'BD',
      maxDose: 2.5,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 24,
      maxAge: 72,
      formula: 'fixed',
      amount: 2.5,
      unit: 'mg/dose',
      frequency: 'BD',
      maxDose: 2.5,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 72,
      maxAge: 144,
      formula: 'fixed',
      amount: 5,
      unit: 'mg/dose',
      frequency: 'BD',
      maxDose: 5,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 144,
      maxAge: 216,
      formula: 'fixed',
      amount: 10,
      unit: 'mg/dose',
      frequency: 'OD',
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

export default cetirizine
