import type { QuickReferenceMedication } from '../../types'

/**
 * Piriton (Chlorpheniramine, Chlorphenamine maleate)
 * Categories: allergy
 *
 * Frank Shann: 0.1 mg/kg 6-8H
 *
 * MIMS:
 * 1- <2 years 1 mg bid
 * 2-5 years 1 mg 4-6 hourly. Max: 6 mg daily
 * 6- <12 years 2 mg 4-6 hourly. Max: 12 mg daily
 *
 * BNFc:
 * 1–23 months: 1mg twice daily
 * 2–5 years: 1mg every 4–6 hours. maximum 6mg per day
 * 6–11 years: 2mg every 4–6 hours. maximum 12mg per day
 * 12–17 years: 4mg every 4–6 hours. maximum 24mg per day
 */
const piriton: QuickReferenceMedication = {
  id: 'piriton-quick',
  name: 'Piriton',
  dosingProfiles: [
    {
      minAge: 12,
      maxAge: 23,
      formula: 'fixed',
      amount: 1,
      unit: 'mg/dose',
      frequency: 'BD',
      maxDose: 1,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 24,
      maxAge: 71,
      formula: 'fixed',
      amount: 1,
      unit: 'mg/dose',
      frequency: 'QID',
      maxDose: 1,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 72,
      maxAge: 143,
      formula: 'fixed',
      amount: 2,
      unit: 'mg/dose',
      frequency: 'QID',
      maxDose: 2,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 144,
      maxAge: 215,
      formula: 'fixed',
      amount: 4,
      unit: 'mg/dose',
      frequency: 'QID',
      maxDose: 4,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 4,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['allergy'],
  enabled: true,
}

export default piriton
