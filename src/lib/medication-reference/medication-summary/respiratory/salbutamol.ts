import type { QuickReferenceMedication } from '../../types'

/**
 * Salbutamol (Ventolin, Albuterol)
 * Categories: respiratory
 *
 * MIMS:
 * 2-6 years 1-2 mg 3-4 times daily
 * >6-12 years 2 mg 3-4 times daily
 *
 * BNFc:
 * 2–5 years: 1–2 mg 3–4 times a day
 * 6–11 years: 2 mg 3–4 times a day
 * 12–17 years: 2–4 mg 3–4 times a day
 *
 * Frank Shann: 0.1-0.15 mg/kg qid
 */
const salbutamol: QuickReferenceMedication = {
  id: 'salbutamol-quick',
  name: 'Salbutamol',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.1,
      unit: 'mg/kg/dose',
      frequency: 'QID',
      maxDose: 5,
      minAge: 24,
    },
  ],
  concentration: {
    amount: 2,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['respiratory'],
  enabled: true,
}

export default salbutamol
