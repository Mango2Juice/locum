import type { QuickReferenceMedication } from '../../types'

/**
 * Paracetamol (Acetaminophen, Tylenol)
 * Categories: pain-fever
 *
 * Fever, Mild to moderate pain:
 * 3-5 months 60 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 6-23 months 120 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 2-3 years 180 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 4-5 years 240 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 6-7 years 240-250 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 8-9 years 360-375 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 10-11 years 480-500 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 12-15 years 480-750 mg 4-6 hourly as needed. Max: 4 doses daily.
 * 16-17 years 500-1,000 mg 4-6 hourly as needed. Max: 4 doses daily.
 * Sources: MIMS, BNFc
 * Frank Shann: 15 mg/kg 4-6H.
 */
const paracetamol: QuickReferenceMedication = {
  id: 'paracetamol-quick',
  name: 'Paracetamol',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 15,
      unit: 'mg/kg/dose',
      frequency: 'QID',
      maxDose: 1000,
      maxDoseUnit: 'mg/kg/day',
      minAge: 1,
    },
  ],
  concentration: {
    amount: 250,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['pain-fever'],
  enabled: true,
}

export default paracetamol
