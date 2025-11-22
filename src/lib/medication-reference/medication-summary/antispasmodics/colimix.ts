// src/lib/medication-reference/medications/antispasmodics/colimix.ts
import type { QuickReferenceMedication } from '../../types'

/**
 * Colimix (Dicyclomine/Simethicone)
 * Categories: antispasmodics
 *
 * Infant over 6 months: 5ml before each feed
 * 4-12 years: 5-10 ml 4 times daily
 * adults: 10 ml 4 times daily
 * Sources: product leaflet
 */
const colimix: QuickReferenceMedication = {
  id: 'colimix-quick',
  name: 'Colimix',
  dosingProfiles: [
    {
      minAge: 6,
      maxAge: 47,
      formula: 'fixed',
      amount: 5,
      unit: 'mL/dose',
      frequency: 'QID',
      maxDose: 5,
      maxDoseUnit: 'mL/dose',
    },
    {
      minAge: 48,
      maxAge: 143,
      formula: 'fixed',
      amount: 10,
      unit: 'mL/dose',
      frequency: 'QID',
      maxDose: 10,
      maxDoseUnit: 'mL/dose',
    },
  ],
  concentration: {
    amount: 1,
    unit: 'mg/ml',
    formulation: 'syrup',
  },
  complaintCategories: ['antispasmodics'],
  enabled: true,
}

export default colimix
