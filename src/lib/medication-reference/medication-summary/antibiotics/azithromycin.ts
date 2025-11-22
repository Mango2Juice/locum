import type { QuickReferenceMedication } from '../../types'

/**
 * Azithromycin (Zithromax)
 * Categories: antibiotics, respiratory
 *
 * High-level summary: Antibiotic for respiratory and other infections, often a short course.
 * Indications: Atypical pneumonia, strep throat (if penicillin allergy), chlamydia.
 * Contraindications: Allergy to macrolides, history of liver problems with azithromycin.
 * Adverse effects: Diarrhea, nausea, abdominal pain.
 * Pregnancy & Lactation: Generally considered safe. Use with caution in lactation.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const azithromycin: QuickReferenceMedication = {
  id: 'azithromycin-quick',
  name: 'Azithromycin',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 10,
      unit: 'mg/kg/dose',
      frequency: 'OD',
      maxDose: 500,
      maxDoseUnit: 'mg/dose',
      minAge: 6,
    },
  ],
  concentration: {
    amount: 200,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default azithromycin
