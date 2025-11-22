import type { QuickReferenceMedication } from '../../types'

/**
 * Maxolon (Metoclopramide)
 * Categories: gastrointestinal
 *
 * Frank Shann: 0.1-0.3 mg/kg tds
 */
const maxolon: QuickReferenceMedication = {
  id: 'maxolon-quick',
  name: 'Maxolon',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 0.15,
      unit: 'mg/kg/dose',
      frequency: 'TDS',
      maxDose: 10,
      maxDoseUnit: 'mg/dose',
      minAge: 12,
    },
  ],
  concentration: {
    amount: 5,
    unit: 'mg/5ml',
    formulation: 'syrup',
  },
  complaintCategories: ['gastrointestinal'],
  enabled: false,
}

export default maxolon
