import type { QuickReferenceMedication } from '../../types'

/**
 * Lactulose (Duphalac)
 * Categories: gastrointestinal
 *
 * BNFc:
 * 1–11 months: 2. 5mL twice daily
 * 1-4years: 2.5–10 mL twice daily
 * 5–17 years: 5–20 mL twice daily
 *
 * Frank Shann: 0.5 mL/kg bd
 */
const lactulose: QuickReferenceMedication = {
  id: 'lactulose-quick',
  name: 'Lactulose',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.5,
      unit: 'mL/kg/dose',
      frequency: 'BD',
      maxDose: 20,
      maxDoseUnit: 'mL/dose',
      minAge: 1,
    },
  ],
  concentration: {
    amount: 3.35,
    unit: 'g/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['gastrointestinal'],
  enabled: true,
}

export default lactulose
