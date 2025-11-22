import type { QuickReferenceMedication } from '../../types'

/**
 * Buscopan (Hyoscine butylbromide)
 * Categories: antispasmodics
 *
 * MIMS, BNFc:
 * 6-11 years 10mg tid
 * 12–17 years: 20 mg 4 times daily
 *
 * Frank Shann: 0.5 mg/kg 6-8H
 */
const buscopan: QuickReferenceMedication = {
  id: 'buscopan-quick',
  name: 'Buscopan',
  dosingProfiles: [
    {
      minAge: 72, // 6 years
      maxAge: 143, // up to 12 years
      formula: 'fixed',
      amount: 10,
      unit: 'mg/dose',
      frequency: 'TDS',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
    },
    {
      minAge: 144, // 12 years and older
      formula: 'fixed',
      amount: 20,
      unit: 'mg/dose',
      frequency: 'QID',
      maxDose: 20,
      maxDoseUnit: 'mg/dose',
    },
  ],
  concentration: {
    amount: 10,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['antispasmodics'],
  enabled: true,
}

export default buscopan
