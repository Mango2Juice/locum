import type { QuickReferenceMedication } from '../../types'

/**
 * Ibuprofen (Advil, Nurofen)
 * Categories: pain-fever
 *
 * Fever, inflammation, mild to moderate pain:
 * 3-5 months weighing >5 kg: 50 mg tid. Max: 24 hours
 * 6-11 months 50 mg 3-4 times daily
 * 1-3 years 100 mg tid
 * 4-6 years 150 mg tid
 * 7-9 years 200 mg tid
 * 10-11 years 300 mg tid
 * >12 years 200 mg 4-6 hourly, may increase to 400 mg as necessary. Max: 1,200 mg daily.
 * Sources: MIMS, BNFc
 *
 * Frank Shann: 10 mg/kg 4-8H. Max 40 mg/kg/day.
 */
const ibuprofen: QuickReferenceMedication = {
  id: 'ibuprofen-quick',
  name: 'Ibuprofen',
  dosingProfiles: [
    {
      minAge: 6,
      maxAge: 11,
      formula: 'fixed',
      amount: 50,
      unit: 'mg/dose',
      frequency: 'TDS',
    },
    {
      // 1-3 years
      minAge: 12,
      maxAge: 47,
      formula: 'fixed',
      amount: 100,
      unit: 'mg/dose',
      frequency: 'TDS',
    },
    {
      // 4-6 years
      minAge: 48,
      maxAge: 83,
      formula: 'fixed',
      amount: 150,
      unit: 'mg/dose',
      frequency: 'TDS',
    },
    {
      // 7-9 years
      minAge: 84,
      maxAge: 119,
      formula: 'fixed',
      amount: 200,
      unit: 'mg/dose',
      frequency: 'TDS',
    },
    {
      // 10-11 years
      minAge: 120,
      maxAge: 143,
      formula: 'fixed',
      amount: 300,
      unit: 'mg/dose',
      frequency: 'TDS',
    },
  ],
  concentration: {
    amount: 100,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['pain-fever'],
  enabled: true,
}

export default ibuprofen
