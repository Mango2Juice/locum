import type { QuickReferenceMedication } from '../../types'

/**
 * Cloxacillin (Tegopen)
 * Categories: antibiotics
 *
 * High-level summary: Penicillin antibiotic for Staph infections.
 * Indications: Skin infections (cellulitis, impetigo).
 * Contraindications: Penicillin allergy.
 * Adverse effects: Nausea, vomiting, diarrhea.
 * Pregnancy & Lactation: Generally considered safe.
 * Sources: MIMS, Drugs.com, local clinical guidelines.
 */
const cloxacillin: QuickReferenceMedication = {
  id: 'cloxacillin-quick',
  name: 'Cloxacillin',
  dosingProfiles: [
    {
      formula: 'weight',
      amount: 25,
      unit: 'mg/kg/dose',
      frequency: 'QID',
      maxDose: 500,
      maxDoseUnit: 'mg/dose',
      minAge: 1,
    },
  ],
  concentration: {
    amount: 125,
    unit: 'mg/5ml',
    formulation: 'suspension',
  },
  complaintCategories: ['antibiotics'],
  enabled: true,
}

export default cloxacillin
